<?php

namespace App\Imports;

use App\Models\Praktikum;
use App\Models\Praktikan;
use App\Models\Nilai;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class NilaiAsdosImport implements ToCollection
{
    protected $praktikum_id;
    protected $moduls;

    public function __construct($praktikum_id)
    {
        $this->praktikum_id = $praktikum_id;
        
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
                continue; // Skip the header row
            }

            $npm = $row[0];
            if (!$npm) continue;

            $praktikan = Praktikan::where('username', $npm)->first();
            if (!$praktikan) continue;

            $colIndex = 2; // Modul 1 starts at index 2 (C)
            
            foreach ($this->moduls as $modul) {
                $rawVal = isset($row[$colIndex]) ? $row[$colIndex] : null;
                $nilai_asdos = ($rawVal !== null && trim((string)$rawVal) !== '' && is_numeric($rawVal)) ? (float)$rawVal : null;

                Nilai::updateOrCreate(
                    [
                        'praktikum_id' => $this->praktikum_id,
                        'praktikan_id' => $praktikan->id,
                        'modul_id' => $modul->id,
                    ],
                    [
                        'nilai_asdos' => $nilai_asdos,
                    ]
                );
                $colIndex++;
            }
        }
    }
}
