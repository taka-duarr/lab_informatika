<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Aslab;
use App\Models\JenisPraktikum;
use App\Models\Kuis;
use App\Models\Laboratorium;
use App\Models\PeriodePraktikum;
use App\Models\Praktikan;
use App\Models\Praktikum;
use App\Models\PraktikumPraktikan;
use App\Models\SesiPraktikum;
use Carbon\Carbon;
use GuzzleHttp\Psr7\Response;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AslabPagesController extends Controller
{
    public function loginPage()
    {
        return Inertia::render('Aslab/AslabLoginPage');
    }
    public function dashboardPage()
    {
        $authAslab = Auth::guard('aslab')->user();
        if (!$authAslab) {
            abort(401);
        }

        return Inertia::render('Aslab/AslabDashboardPage', [
            'praktikans' => Praktikan::select([
                'praktikan.id',
                'praktikan.nama',
                'praktikan.username',
                'praktikan.avatar'
            ])
                ->join('praktikum_praktikan', 'praktikum_praktikan.praktikan_id', '=', 'praktikan.id')
                ->join('praktikum', 'praktikum.id', '=', 'praktikum_praktikan.praktikum_id')
                ->where('praktikum_praktikan.terverifikasi', true)
                ->where('praktikum_praktikan.aslab_id', $authAslab->id)
                ->where('praktikum.status', true)
                ->get(),
            'praktikums' => Praktikum::select(['id', 'nama', 'jenis_praktikum_id'])
                ->where('praktikum.status', true)
                ->whereHas('praktikum_praktikan', function ($query) use ($authAslab) {
                    $query->select('praktikum_id');
                    $query->where('aslab_id', $authAslab->id);
                })
                ->with([
                    'praktikan' => function ($query) use ($authAslab) {
                        $query->select(['id', 'nama', 'username', 'avatar']);
                        $query->wherePivot('terverifikasi', true);
                        $query->wherePivot('aslab_id', $authAslab->id);
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
        $authAslab = Auth::guard('aslab')->user();
        if (!$authAslab) {
            abort(401);
        }

        return Inertia::render('Aslab/AslabProfilePage', [
            'aslab' => fn() => Aslab::select('id','nama', 'username','avatar', 'laboratorium_id')->where('id', $authAslab->id)->with('laboratorium:id,nama')->first(),
        ]);
    }
    public function praktikumIndexPage(Request $request)
    {
        $authAslab = Auth::guard('aslab')->user();
        if (!$authAslab) {
            abort(401);
        }

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
                'praktikum_praktikan as praktikan_count' => function ($q) use ($authAslab) {
                    $q->where('terverifikasi', true)
                        ->where('aslab_id', $authAslab->id);
                }
            ])
            ->join('periode_praktikum', 'praktikum.periode_praktikum_id', '=', 'periode_praktikum.id')
            ->join('laboratorium', 'periode_praktikum.laboratorium_id', '=', 'laboratorium.id');

        if ($authAslab->laboratorium_id) {
            $query->where('periode_praktikum.laboratorium_id', $authAslab->laboratorium_id);
        }

        $query->orderBy('praktikum.tahun', 'desc')
            ->orderBy('laboratorium.nama', 'asc')
            ->orderBy('praktikum.nama', 'desc');

        $praktikums = $query->get();

        return Inertia::render('Aslab/AslabPraktikumIndexPage', [
            'praktikums' => fn () => $praktikums,
        ]);
    }
    public function praktikumCreatePage(Request $request)
    {
        $authAslab = Auth::guard('aslab')->user();
        if (!$authAslab) {
            abort(401);
        }

        $queryJenisPraktikum = JenisPraktikum::select('id', 'nama', 'laboratorium_id')->with('laboratorium:id,nama');
        if ($authAslab->laboratorium_id) {
            $queryJenisPraktikum->where('laboratorium_id', $authAslab->laboratorium_id);
        }

        $queryPeriodePraktikum = PeriodePraktikum::select('id', 'nama', 'laboratorium_id')->with('laboratorium:id,nama');
        if ($authAslab->laboratorium_id) {
            $queryPeriodePraktikum->where('laboratorium_id', $authAslab->laboratorium_id);
        }

        $jenisPraktikums = $queryJenisPraktikum->orderBy('created_at', 'desc')->get();
        $periodePraktikums = $queryPeriodePraktikum->orderBy('created_at', 'desc')->get();

        return Inertia::render('Aslab/AslabPraktikumCreatePage', [
            'currentDate' => Carbon::now()->timezone('Asia/Jakarta')->toDateString(),
            'laboratoriums' => fn() => Laboratorium::select('id', 'nama')->get(),
            'jenisPraktikums' => fn() => $jenisPraktikums,
            'periodePraktikums' => fn() => $periodePraktikums->sortBy(fn($periode) => $this->romanToInt($periode->nama))->values()
        ]);
    }
    public function praktikumDetailsPage(Request $request, $id = null)
    {
        if (!$id) {
            abort(404);
        }

        $authAslab = Auth::guard('aslab')->user();
        if (!$authAslab) {
            abort(401);
        }

        $praktikum = Praktikum::with([
            'praktikum_praktikan' => function ($query) use ($authAslab) {
                $query->where('aslab_id', $authAslab->id)
                    ->where('terverifikasi', true)
                    ->with([
                        'praktikan:id,nama,username',
                        'sesi_praktikum:id,nama,hari,waktu_mulai,waktu_selesai',
                        'dosen:id,nama',
                    ]);
            }
        ])
            ->select('id', 'nama', 'tahun', 'periode_praktikum_id')
            ->findOrFail($id);

        return Inertia::render('Aslab/AslabPraktikumDetailsPage', [
            'currentDate' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
            'praktikum' => [
                'id' => $praktikum->id,
                'nama' => $praktikum->nama,
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
