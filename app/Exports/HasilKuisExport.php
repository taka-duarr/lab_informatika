<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class HasilKuisExport implements 
    FromCollection, 
    WithHeadings, 
    ShouldAutoSize,
    WithStyles
{
    protected $data;

    public function __construct(Collection $data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'No',
            'NPM',
            'Nama',
            'Skor',
            'Selesai'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style Header
        $sheet->getStyle('A1:E1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => 'solid',
                'color' => ['rgb' => '4F81BD'], // biru elegan
            ],
            'alignment' => [
                'horizontal' => 'center',
                'vertical' => 'center',
            ]
        ]);

        // Style border untuk semua data
        $sheet->getStyle('A1:E' . ($this->data->count() + 1))
            ->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => 'thin',
                        'color' => ['rgb' => '000000']
                    ]
                ],
            ]);

        // Align kolom tertentu ke center
        $sheet->getStyle('A:E')->getAlignment()->setHorizontal('center');

        // Kolom Nama dibuat left align agar lebih enak dibaca
        $sheet->getStyle('C')->getAlignment()->setHorizontal('left');
    }
}
