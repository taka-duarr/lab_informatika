<?php

namespace App\Imports;

use App\Models\Praktikum;
use App\Models\Praktikan;
use App\Models\Nilai;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class NilaiAslabImport implements ToCollection
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

    public function collection(Collection $rows)
    {
        $isHeader = true;

        foreach ($rows as $row) {
            if ($isHeader) {
                $isHeader = false;
                continue; 
            }

            $npm = $row[0];
            if (!$npm) continue;

            $praktikan = Praktikan::where('username', $npm)->first();
            if (!$praktikan) continue;

            // Pastikan praktikan ini adalah bimbingan aslab yang sedang import
            $isAssigned = \App\Models\PraktikumPraktikan::where('praktikum_id', $this->praktikum_id)
                ->where('praktikan_id', $praktikan->id)
                ->where('aslab_id', $this->aslab_id)
                ->exists();

            if (!$isAssigned) {
                continue; // Skip jika bukan bimbingannya
            }

            $colIndex = 2; // Modul 1
            
            foreach ($this->moduls as $modul) {
                $rawVal = isset($row[$colIndex]) ? $row[$colIndex] : null;
                $nilai_asistensi = ($rawVal !== null && trim((string)$rawVal) !== '' && is_numeric($rawVal)) ? (float)$rawVal : null;

                Nilai::updateOrCreate(
                    [
                        'praktikum_id' => $this->praktikum_id,
                        'praktikan_id' => $praktikan->id,
                        'modul_id' => $modul->id,
                    ],
                    [
                        'nilai_asistensi' => $nilai_asistensi,
                    ]
                );
                $colIndex++;
            }
        }
    }
}
