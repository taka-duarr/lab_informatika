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
use Illuminate\Support\Collection;

class NilaiAsdosExport implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $praktikum_id;
    protected $dosen_id;
    protected $moduls;

    public function __construct($praktikum_id, $dosen_id)
    {
        $this->praktikum_id = $praktikum_id;
        $this->dosen_id = $dosen_id;
        
        $praktikum = Praktikum::with('pertemuan.modul')->findOrFail($praktikum_id);
        $this->moduls = $praktikum->pertemuan->flatMap(function($p) {
            return $p->modul;
        });
    }

    public function collection()
    {
        $query = PraktikumPraktikan::with('praktikan')
            ->where('praktikum_id', $this->praktikum_id)
            ->where('dosen_id', $this->dosen_id)
            ->get();

        return $query;
    }

    public function headings(): array
    {
        $headers = ['NPM', 'Nama Praktikan'];
        
        foreach ($this->moduls as $index => $modul) {
            $headers[] = 'Modul ' . ($index + 1) . ' (' . $modul->nama . ') - Dosen';
        }

        return $headers;
    }

    public function map($row): array
    {
        $data = [
            $row->praktikan->username, // NPM
            $row->praktikan->nama,
        ];

        // Fetch existing nilai
        $nilais = Nilai::where('praktikum_id', $this->praktikum_id)
            ->where('praktikan_id', $row->praktikan_id)
            ->get();

        foreach ($this->moduls as $modul) {
            $nilai = $nilais->firstWhere('modul_id', $modul->id);
            $data[] = $nilai ? $nilai->nilai_asdos : null;
        }

        return $data;
    }

    public function title(): string
    {
        return 'Format Nilai Dosen';
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
