<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Aslab;
use App\Models\Dosen;
use App\Models\Praktikan;
use App\Models\Praktikum;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DosenPagesController extends Controller
{
    public function loginPage()
    {
        return Inertia::render('Dosen/DosenLoginPage');
    }
    public function dashboardPage()
    {
        $authDosen = Auth::guard('dosen')->user();
        if (!$authDosen) {
            abort(401);
        }

        return Inertia::render('Dosen/DosenDashboardPage', [
            'aslabs' => fn() => Aslab::select(['id','nama','username','jabatan','avatar','laboratorium_id'])
                ->where('aktif', true)
                ->with('laboratorium:id,nama')
                ->orderBy('username', 'asc')
                ->get(),
            'praktikums' => Praktikum::select(['id', 'nama', 'jenis_praktikum_id'])
                ->where('praktikum.status', true)
                ->whereHas('praktikum_praktikan', function ($query) use ($authDosen) {
                    $query->select('praktikum_id');
                    $query->where('dosen_id', $authDosen->id);
                })
                ->with([
                    'praktikan' => function ($query) use ($authDosen) {
                        $query->select(['id', 'nama', 'username', 'avatar']);
                        $query->wherePivot('terverifikasi', true);
                        $query->wherePivot('dosen_id', $authDosen->id);
                    },
                    'jenis:id,nama,laboratorium_id',
                    'jenis.laboratorium:id,nama'
                ])
                ->get()
                ->map(fn ($praktikum) => [
                    'id' => $praktikum->id,
                    'nama' => $praktikum->nama,
                    'laboratorium' => $praktikum->jenis->laboratorium,
                    'praktikans' => $praktikum->praktikan->map(fn ($praktikan) => [
                        'id' => $praktikan->id,
                        'nama' => $praktikan->nama,
                        'username' => $praktikan->username,
                        'avatar' => $praktikan->avatar,
                    ]),
                ])
        ]);
    }
    public function profilePage()
    {
        $authDosen = Auth::guard('dosen')->user();
        if (!$authDosen) {
            abort(401);
        }

        return Inertia::render('Dosen/DosenProfilePage', [
            'dosen' => fn() => Dosen::select(['id','nama', 'username'])
                ->where('id', $authDosen->id)
                ->with('laboratorium:id,nama')->first(),
        ]);
    }
    public function praktikumIndexPage(Request $request)
    {
        $authDosen = Auth::guard('dosen')->user();
        if (!$authDosen) {
            abort(401);
        }

        $viewPerPage = $this->getViewPerPage($request);
        $query = Praktikum::select([
            'praktikum.id',
            'praktikum.nama',
            'praktikum.tahun',
            'praktikum.status',
            'praktikum.periode_praktikum_id',
        ])
            ->with([
                'periode:id,nama',
            ])
            ->withCount([
                'praktikum_praktikan as praktikan_count' => function ($q) use ($authDosen) {
                    $q->where('terverifikasi', true)
                        ->where('dosen_id', $authDosen->id);
                }
            ])
            ->join('periode_praktikum', 'praktikum.periode_praktikum_id', '=', 'periode_praktikum.id')
            ->join('laboratorium', 'periode_praktikum.laboratorium_id', '=', 'laboratorium.id');

        $query->orderBy('praktikum.status', 'desc')
            ->orderBy('praktikum.tahun', 'desc')
            ->orderBy('laboratorium.nama', 'asc')
            ->orderBy('praktikum.nama', 'desc');

        $search = $request->query('search');
        if ($search) {
            $query->where('praktikum.nama', 'like', '%' . $search . '%');
        }

        $praktikums = $query->paginate($viewPerPage)->withQueryString();

        return Inertia::render('Dosen/DosenPraktikumIndexPage', [
            'pagination' => fn () => $praktikums,
        ]);
    }
    public function praktikumDetailsPage(Request $request, $id = null)
    {
        if (!$id) {
            abort(404);
        }

        $authDosen = Auth::guard('dosen')->user();
        if (!$authDosen) {
            abort(401);
        }

        $praktikum = Praktikum::select([
            'praktikum.id',
            'praktikum.nama',
            'praktikum.tahun',
            'pertemuan_id'
        ])
            ->with([
                'praktikum_praktikan' => function ($query) use ($authDosen) {
                    $query->select([
                        'praktikum_praktikan.praktikum_id',
                        'praktikum_praktikan.praktikan_id',
                        'praktikum_praktikan.aslab_id',
                        'praktikum_praktikan.dosen_id',
                        'praktikum_praktikan.sesi_praktikum_id',
                        'praktikum_praktikan.terverifikasi'
                    ])
                        ->where('dosen_id', $authDosen->id)
                        ->where('terverifikasi', true)
                        ->with([
                            'praktikan:id,nama,username',
                            'sesi_praktikum:id,nama,hari,waktu_mulai,waktu_selesai',
                            'dosen:id,nama',
                            'aslab:id,nama',
                        ]);
                },
                'pertemuan:id,praktikum_id',
                'pertemuan.modul' => function ($query) use ($authDosen) {
                    $query->select(['modul.id', 'modul.nama', 'modul.pertemuan_id']);
                    $query->orderBy('modul.nama', 'asc');
                },
            ])
            ->select('id', 'nama', 'tahun')
            ->findOrFail($id);

        return Inertia::render('Dosen/DosenPraktikumDetailsPage', [
            'currentDate' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
            'praktikum' => [
                'id' => $praktikum->id,
                'nama' => $praktikum->nama,
                'pertemuan' => $praktikum->pertemuan,
                'praktikans' => $praktikum->praktikum_praktikan->map(function ($pivot) {
                    return [
                        'id' => $pivot->praktikan->id,
                        'nama' => $pivot->praktikan->nama,
                        'username' => $pivot->praktikan->username,
                        'sesi_praktikum' => $pivot->sesi_praktikum ? [
                            'id' => $pivot->sesi_praktikum->id,
                            'nama' => $pivot->sesi_praktikum->nama,
                            'hari' => $pivot->sesi_praktikum->hari,
                            'waktu_mulai' => $pivot->sesi_praktikum->waktu_mulai,
                            'waktu_selesai' => $pivot->sesi_praktikum->waktu_selesai,
                        ] : null,
                        'aslab' => $pivot->aslab ? [
                            'id' => $pivot->aslab->id,
                            'nama' => $pivot->aslab->nama,
                        ] : null,
                        'dosen' => $pivot->dosen ? [
                            'id' => $pivot->dosen->id,
                            'nama' => $pivot->dosen->nama,
                        ] : null,
                    ];
                }),
            ],
        ]);
    }
}
