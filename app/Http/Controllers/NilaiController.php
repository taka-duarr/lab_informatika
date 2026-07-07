<?php

namespace App\Http\Controllers;

use App\Models\Modul;
use App\Models\Nilai;
use App\Models\Praktikum;
use App\Models\Praktikan;
use App\Models\PraktikumPraktikan;
use App\Models\KuisPraktikan;
use App\Exports\NilaiAsdosExport;
use App\Imports\NilaiAsdosImport;
use App\Exports\NilaiAdminExport;
use App\Imports\NilaiAdminImport;
use App\Exports\NilaiAkhirExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NilaiController extends Controller
{
    public function listPraktikum(Request $request)
    {
        $role = $request->route()->getPrefix(); 
        $isDosen = str_contains($role, 'dosen');

        $query = Praktikum::query()->with('periode', 'jenis');
        if ($isDosen) {
            $query->whereHas('praktikum_praktikan', function ($q) {
                $q->where('dosen_id', auth('dosen')->id());
            });
        }
        $query->orderBy('tahun', 'desc')->orderBy('nama', 'asc');
        
        $praktikums = $query->paginate(15);
        
        return Inertia::render('Nilai/ListPraktikum', [
            'pagination' => fn() => $praktikums,
            'role' => $isDosen ? 'dosen' : 'admin'
        ]);
    }

    public function index(Request $request, $praktikum_id)
    {
        $praktikum = Praktikum::with(['pertemuan.modul', 'pertemuan.kuis'])->findOrFail($praktikum_id);
        
        $role = $request->route()->getPrefix(); 
        $isDosen = str_contains($role, 'dosen');
        $isAdmin = str_contains($role, 'admin');

        $query = PraktikumPraktikan::with(['praktikan', 'sesi_praktikum'])
            ->where('praktikum_id', $praktikum_id);

        if ($isDosen) {
            $query->where('dosen_id', auth('dosen')->id());
        }

        $praktikans = $query->get();
        $praktikanIds = $praktikans->pluck('praktikan_id');

        $nilais = Nilai::where('praktikum_id', $praktikum_id)
            ->whereIn('praktikan_id', $praktikanIds)
            ->get();

        $kuisIds = $praktikum->pertemuan->flatMap(function($p) {
            return $p->kuis->pluck('id');
        });

        $kuisPraktikans = KuisPraktikan::whereIn('kuis_id', $kuisIds)
            ->whereIn('praktikan_id', $praktikanIds)
            ->get();

        return Inertia::render('Nilai/Index', [
            'praktikum' => $praktikum,
            'praktikans' => $praktikans,
            'nilais' => $nilais,
            'kuisPraktikans' => $kuisPraktikans,
            'role' => $isDosen ? 'dosen' : 'admin'
        ]);
    }

    public function updateCell(Request $request, $praktikum_id)
    {
        $validated = $request->validate([
            'praktikan_id' => 'required|uuid',
            'modul_id' => 'nullable|uuid',
            'field' => 'required|string|in:nilai_asistensi,nilai_asdos,nilai_ta,nilai_total,pelanggaran_pretest',
            'value' => 'nullable|numeric'
        ]);

        $role = $request->route()->getPrefix();
        $isDosen = str_contains($role, 'dosen');
        $isAdmin = str_contains($role, 'admin');

        $field = $validated['field'];
        $value = $validated['value'];
        $praktikan_id = $validated['praktikan_id'];

        // Validasi akses
        if ($isDosen && $field !== 'nilai_asdos') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($isAdmin && !in_array($field, ['nilai_asistensi', 'nilai_ta', 'nilai_total', 'pelanggaran_pretest'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($field === 'nilai_ta' || $field === 'nilai_total') {
            PraktikumPraktikan::where('praktikum_id', $praktikum_id)
                ->where('praktikan_id', $praktikan_id)
                ->update([$field => $value]);
        } else {
            Nilai::updateOrCreate(
                [
                    'praktikum_id' => $praktikum_id,
                    'praktikan_id' => $praktikan_id,
                    'modul_id' => $validated['modul_id']
                ],
                [
                    $field => $value
                ]
            );
        }

        return redirect()->back()->with('success', 'Nilai berhasil disimpan.');
    }

    public function exportExcel(Request $request, $praktikum_id)
    {
        $praktikum = Praktikum::findOrFail($praktikum_id);
        $role = $request->route()->getPrefix();
        $isAdmin = str_contains($role, 'admin');

        if ($isAdmin) {
            $fileName = 'Format_Nilai_Asistensi_' . str_replace(' ', '_', $praktikum->nama) . '.xlsx';
            return Excel::download(new NilaiAdminExport($praktikum_id), $fileName);
        } else {
            $fileName = 'Format_Nilai_Asdos_' . str_replace(' ', '_', $praktikum->nama) . '.xlsx';
            $dosen_id = auth('dosen')->id();
            return Excel::download(new NilaiAsdosExport($praktikum_id, $dosen_id), $fileName);
        }
    }

    public function importExcel(Request $request, $praktikum_id)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:2048',
        ]);

        $role = $request->route()->getPrefix();
        $isAdmin = str_contains($role, 'admin');

        if ($isAdmin) {
            Excel::import(new NilaiAdminImport($praktikum_id), $request->file('file'));
            return redirect()->back()->with('success', 'Nilai Asistensi berhasil diimpor.');
        } else {
            Excel::import(new NilaiAsdosImport($praktikum_id), $request->file('file'));
            return redirect()->back()->with('success', 'Nilai Asdos berhasil diimpor.');
        }
    }

    public function exportNilaiAkhir(Request $request, $praktikum_id)
    {
        $praktikum = Praktikum::findOrFail($praktikum_id);
        $role = $request->route()->getPrefix();
        $isAdmin = str_contains($role, 'admin');

        if (!$isAdmin) {
            return abort(403, 'Unauthorized');
        }

        $fileName = 'Rekap_Nilai_Akhir_' . str_replace(' ', '_', $praktikum->nama) . '.xlsx';
        return Excel::download(new NilaiAkhirExport($praktikum_id), $fileName);
    }
}
