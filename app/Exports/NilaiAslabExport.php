<?php

namespace App\Exports;

use App\Models\Praktikum;
use App\Models\PraktikumPraktikan;
use App\Models\Nilai;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class NilaiAslabExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $praktikum_id;
    protected $aslab_id;
    protected $moduls;

    public function __construct($praktikum_id, $aslab_id)
    {
        $this->praktikum_id = $praktikum_id;
        $this->aslab_id = $aslab_id;
        
        $praktikum = Praktikum::with('pertemuan.modul')->findOrFail($praktikum_id);
        $this->moduls = $praktikum->pertemuan->flatMap(function($p) {
            return $p->modul;
        });
    }

    public function collection()
    {
        $query = PraktikumPraktikan::with('praktikan')
            ->where('praktikum_id', $this->praktikum_id)
            ->where('aslab_id', $this->aslab_id)
            ->get();

        return $query;
    }

    public function headings(): array
    {
        $headers = ['NPM', 'Nama Praktikan'];
        
        foreach ($this->moduls as $index => $modul) {
            $headers[] = 'Modul ' . ($index + 1) . ' (' . $modul->nama . ') - Asistensi';
        }

        return $headers;
    }

    public function map($row): array
    {
        $data = [
            $row->praktikan->username,
            $row->praktikan->nama,
        ];

        $nilais = Nilai::where('praktikum_id', $this->praktikum_id)
            ->where('praktikan_id', $row->praktikan_id)
            ->get();

        foreach ($this->moduls as $modul) {
            $nilai = $nilais->firstWhere('modul_id', $modul->id);
            $data[] = $nilai ? $nilai->nilai_asistensi : null;
        }

        return $data;
    }

    public function title(): string
    {
        return 'Format Nilai Asistensi';
    }

    public function styles(Worksheet $sheet)
    {
        $lastColumn = $sheet->getHighestColumn();
        $lastRow = $sheet->getHighestRow();

        $sheet->getStyle('A1:' . $lastColumn . '1')->applyFromArray([
            'font' => ['bold' => true],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE2E8F0'],
            ],
        ]);

        $sheet->getStyle('A1:' . $lastColumn . $lastRow)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                ],
            ],
        ]);

        if ($lastRow > 1) {
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            if ($lastColumn !== 'B') {
                $sheet->getStyle('C2:' . $lastColumn . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
            }
        }

        return [];
    }
}
