<?php

namespace App\Exports;

use App\Models\Praktikum;
use App\Models\PraktikumPraktikan;
use App\Models\KuisPraktikan;
use App\Models\Nilai;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NilaiAkhirExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $praktikum_id;
    protected $praktikum;
    protected $moduls;
    protected $kuisPraktikans;
    protected $allNilais;

    public function __construct($praktikum_id)
    {
        $this->praktikum_id = $praktikum_id;
        
        $this->praktikum = Praktikum::with(['pertemuan.modul', 'pertemuan.kuis'])->findOrFail($praktikum_id);
        $this->moduls = $this->praktikum->pertemuan->flatMap(function($p) {
            return $p->modul;
        });

        // Pre-fetch all quiz scores
        $this->kuisPraktikans = KuisPraktikan::whereHas('kuis.pertemuan', function($q) use ($praktikum_id) {
            $q->where('praktikum_id', $praktikum_id);
        })->get();

        // Pre-fetch all nilais
        $this->allNilais = Nilai::where('praktikum_id', $praktikum_id)->get();
    }

    public function collection()
    {
        return PraktikumPraktikan::with('praktikan')
            ->where('praktikum_id', $this->praktikum_id)
            ->get();
    }

    public function headings(): array
    {
        return [
            'NPM',
            'Nama Praktikan',
            'Nilai Akhir',
            'Nilai Huruf'
        ];
    }

    public function map($row): array
    {
        $praktikanId = $row->praktikan_id;
        
        $sumTotalModul = 0;
        $modulCount = count($this->moduls);

        if ($modulCount > 0) {
            foreach ($this->moduls as $modul) {
                $nilaiRec = $this->allNilais->first(function($n) use ($praktikanId, $modul) {
                    return $n->praktikan_id === $praktikanId && $n->modul_id === $modul->id;
                });

                // Calculate Raw Pretest (max of all quizzes in this pertemuan)
                $pertemuan = $this->praktikum->pertemuan->firstWhere('id', $modul->pertemuan_id);
                $rawPretest = 0;
                
                if ($pertemuan && $pertemuan->kuis->count() > 0) {
                    $scores = [];
                    foreach ($pertemuan->kuis as $k) {
                        $kp = $this->kuisPraktikans->first(function($kp) use ($praktikanId, $k) {
                            return $kp->praktikan_id === $praktikanId && $kp->kuis_id === $k->id;
                        });
                        $scores[] = $kp ? $kp->skor : 0;
                    }
                    $rawPretest = max($scores);
                }

                $minus = $nilaiRec ? ($nilaiRec->pelanggaran_pretest ?: 0) : 0;
                $pretest = max(0, $rawPretest - $minus);
                $asistensi = $nilaiRec ? ($nilaiRec->nilai_asistensi ?: 0) : 0;
                $asdos = $nilaiRec ? ($nilaiRec->nilai_asdos ?: 0) : 0;

                $totalModul = ($pretest * 0.20) + ($asistensi * 0.40) + ($asdos * 0.40);
                $sumTotalModul += $totalModul;
            }

            $rataRataModul = $sumTotalModul / $modulCount;
        } else {
            $rataRataModul = 0;
        }

        $ta = $row->nilai_ta ?: 0;
        $nilaiAkhir = ($rataRataModul * 0.80) + ($ta * 0.20);
        $roundedAkhir = round($nilaiAkhir);

        // Grade mapping
        $huruf = 'E';

        if ($roundedAkhir >= 91) {
            $huruf = 'A+';
        } elseif ($roundedAkhir >= 86) {
            $huruf = 'A';
        } elseif ($roundedAkhir >= 80) {
            $huruf = 'A-';
        } elseif ($roundedAkhir >= 76) {
            $huruf = 'B+';
        } elseif ($roundedAkhir >= 73) {
            $huruf = 'B';
        } elseif ($roundedAkhir >= 66) {
            $huruf = 'B-';
        } elseif ($roundedAkhir >= 61) {
            $huruf = 'C+';
        } elseif ($roundedAkhir >= 51) {
            $huruf = 'C';
        } elseif ($roundedAkhir >= 41) {
            $huruf = 'D';
        }

        return [
            $row->praktikan->username, // NPM
            $row->praktikan->nama,
            number_format($nilaiAkhir, 2),
            $huruf
        ];
    }

    public function title(): string
    {
        return 'Nilai Akhir';
    }

    public function styles(Worksheet $sheet)
    {
        $lastColumn = $sheet->getHighestColumn();
        $lastRow = $sheet->getHighestRow();

        // Style the headers (Bold + Center)
        $sheet->getStyle('A1:' . $lastColumn . '1')->applyFromArray([
            'font' => ['bold' => true],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE2E8F0'], // Light gray
            ],
        ]);

        // Add borders to all cells
        $sheet->getStyle('A1:' . $lastColumn . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ]);

        // Center align NPM and all score columns, leave Nama (Column B) as left-aligned
        if ($lastRow > 1) {
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            if ($lastColumn !== 'B') {
                $sheet->getStyle('C2:' . $lastColumn . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            }
        }

        return [];
    }
}
