<?php

namespace Database\Seeders;

use App\Models\Label;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $labels = [
            'Pre-Test', 'Evaluasi',
            'Pertemuan 1', 'Pertemuan 2', 'Pertemuan 3', 'Pertemuan 4',
            'Modul 1', 'Modul 2', 'Modul 3', 'Modul 4', 'Modul 5', 'Modul 6', 'Modul 7', 'Modul 8', 'Modul 9', 'Modul 10',
            'Pemrograman Terstruktur', 'Struktur Data',
            'Pemrograman Berorientasi Objek', 'Basis Data',
            'Sistem Operasi', 'Jaringan Komputer',
            'Rev.2019', 'Rev.2020', 'Rev.2021', 'Rev.2022', 'Rev.2023',
        ];

        $labelsData = array_map(fn ($label) => [
            'id' => Str::uuid(),
            'nama' => $label,
            'created_at' => Carbon::now('Asia/Jakarta'),
            'updated_at' => Carbon::now('Asia/Jakarta'),
        ], $labels);

        Label::insert($labelsData);
    }
}
