<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Aslab;
use App\Models\BanList;
use App\Models\JenisPraktikum;
use App\Models\Kuis;
use App\Models\KuisPraktikan;
use App\Models\Praktikan;
use App\Models\Praktikum;
use App\Models\SoalKuis;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PraktikanPagesController extends Controller
{
    public function loginPage()
    {
        return Inertia::render('Praktikan/PraktikanLoginPage');
    }
    public function registerPage()
    {
        return Inertia::render('Praktikan/PraktikanRegistrationPage');
    }
    public function dashboardPage()
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $now = Carbon::now('Asia/Jakarta');

        return Inertia::render('Praktikan/PraktikanDashboardPage', [
            'aslabs' => fn() => Aslab::select(['aslab.id', 'aslab.nama', 'aslab.avatar', 'aslab.username', 'aslab.jabatan', 'aslab.laboratorium_id'])
                ->where('aslab.aktif', true)
                ->get(),
            'kuis' => fn() => Kuis::select([
                'id',
                'nama',
                'waktu_mulai',
                'waktu_selesai',
                'pertemuan_id'
            ])
                ->where('waktu_mulai', '>', $now)
                ->whereDoesntHave('kuis_praktikan', function ($query) use ($authPraktikan) {
                    $query->where('praktikan_id', $authPraktikan->id)
                        ->where('selesai', true);
                })
                ->with([
                    'pertemuan:id,praktikum_id',
                    'pertemuan.praktikum:id,nama'
                ])
                ->get()
                ->map(function ($kuis) {
                    return [
                        'id' => $kuis->id,
                        'nama' => $kuis->nama,
                        'waktu_mulai' => $kuis->waktu_mulai,
                        'waktu_selesai' => $kuis->waktu_selesai,
                        'praktikum' => [
                            'id' => $kuis->pertemuan->praktikum->id,
                            'nama' => $kuis->pertemuan->praktikum->nama
                        ]
                    ];
                })
        ]);
    }
    public function profilePage()
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $isBanned = BanList::where('praktikan_id', $authPraktikan->id)->latest('created_at')->first();
        $stillBanned = $isBanned && Carbon::parse($isBanned->kadaluarsa, 'Asia/Jakarta')->greaterThan(Carbon::now('Asia/Jakarta'));
        if ($isBanned && $stillBanned) {
            return Inertia::render('BanListPage', [
                'banList' => fn() => $isBanned
            ]);
        } elseif ($isBanned) {
            BanList::where('id', $isBanned->id)->delete();
        }

        return Inertia::render('Praktikan/PraktikanProfilePage', [
            'praktikan' => fn() => Praktikan::select('id','nama','username','jenis_kelamin','avatar')->where('id', $authPraktikan->id)->first(),
        ]);
    }
    public function banListPage()
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $isBanned = BanList::where('praktikan_id', $authPraktikan->id)->latest('created_at')->first();

        if (!$isBanned) {
            abort(403);
        }

        return Inertia::render('BanListPage', [
            'banList' => fn() => $isBanned
        ]);
    }

    public function praktikumIndexPage(Request $request)
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $search = $request->query->get('search');

        return Inertia::render('Praktikan/PraktikanPraktikumIndexPage', [
            'currentDate' => fn() => Carbon::now('Asia/Jakarta'),
            'praktikums' => fn() => Praktikum::select([
                'praktikum.id',
                'praktikum.nama',
                'praktikum_praktikan.terverifikasi',
                'sesi_praktikum.id as sesi_id',
                'sesi_praktikum.nama as sesi_nama',
                'sesi_praktikum.hari',
                'sesi_praktikum.waktu_mulai',
                'sesi_praktikum.waktu_selesai',
                'aslab.id as aslab_id',
                'aslab.nama as aslab_nama',
                'aslab.no_hp as aslab_no_hp',
            ])
                ->join('praktikum_praktikan', 'praktikum.id', '=', 'praktikum_praktikan.praktikum_id')
                ->leftJoin('sesi_praktikum', 'praktikum_praktikan.sesi_praktikum_id', '=', 'sesi_praktikum.id')
                ->leftJoin('aslab', 'praktikum_praktikan.aslab_id', '=', 'aslab.id')
                ->where('praktikum_praktikan.praktikan_id', $authPraktikan->id)
                ->when($search, function ($query, $search) {
                    $query->where('praktikum.nama', 'like', "%{$search}%");
                })
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'nama' => $item->nama,
                        'terverifikasi' => (bool) $item->terverifikasi,
                        'sesi' => $item->sesi_id ? [
                            'id' => $item->sesi_id,
                            'nama' => $item->sesi_nama,
                            'hari' => $item->hari,
                            'waktu_mulai' => $item->waktu_mulai,
                            'waktu_selesai' => $item->waktu_selesai,
                        ] : null,
                        'aslab' => $item->aslab_id ? [
                            'id' => $item->aslab_id,
                            'nama' => $item->aslab_nama,
                            'no_hp' => $item->aslab_no_hp,
                        ] : null,
                    ];
                }),
        ]);
    }
    public function praktikumCreatePage(Request $request)
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        return Inertia::render('Praktikan/PraktikanPraktikumCreatePage', [
            'currentDate' => fn() => Carbon::now('Asia/Jakarta'),
            'jenisPraktikums' => fn() => JenisPraktikum::with([
                'praktikum' => function ($query) use ($authPraktikan) {
                    $query->where('status', true)
                        ->with([
                            'periode',
                            'sesi_praktikum' => function ($sesiQuery) {
                                $sesiQuery->select([
                                    'id',
                                    'nama',
                                    'hari',
                                    'waktu_mulai',
                                    'waktu_selesai',
                                    'kuota',
                                    'praktikum_id',
                                    DB::raw('
                                    (kuota - (
                                        SELECT COUNT(*)
                                        FROM praktikum_praktikan
                                        WHERE praktikum_praktikan.sesi_praktikum_id = sesi_praktikum.id
                                    )) as sisa_kuota
                                ')
                                ]);
                            }
                        ])
                        ->select([
                            'id',
                            'nama',
                            'jenis_praktikum_id',
                            'periode_praktikum_id',
                            'tahun',
                            'status',
                            DB::raw("
                            (NOT EXISTS (
                                SELECT 1
                                FROM praktikum_praktikan
                                WHERE praktikum_praktikan.praktikum_id = praktikum.id
                                AND praktikum_praktikan.praktikan_id = '$authPraktikan->id'
                            )) as available
                        ")
                        ]);
                }
            ])->get(),
        ]);
    }

    public function kuisIndexPage(Request $request)
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $currentTime = Carbon::now('Asia/Jakarta');

        $kuis = Kuis::whereHas('pertemuan.praktikum.praktikan', function ($query) use ($authPraktikan) {
            $query->where('praktikan_id', $authPraktikan->id)
                ->where('terverifikasi', true)
                ->where(function ($subQuery) {
                    $subQuery->whereNull('praktikum_praktikan.sesi_praktikum_id')
                        ->orWhereColumn('praktikum_praktikan.sesi_praktikum_id', 'kuis.sesi_praktikum_id');
                });
        })
            ->where(function ($query) use ($authPraktikan, $currentTime) {
                $query->where('waktu_selesai', '>', $currentTime)
                    ->orWhereHas('kuis_praktikan', function ($subQuery) use ($authPraktikan) {
                        $subQuery->where('praktikan_id', $authPraktikan->id)
                            ->where('selesai', false);
                    });
            })
            ->with(['sesi_praktikum:id,nama'])
            ->withCount('soal')
            ->get();

        return Inertia::render('Praktikan/PraktikanKuisIndexPage', [
            'kuis' => fn() => $kuis->map(fn ($kuis) => [
                'id' => $kuis->id,
                'nama' => $kuis->nama,
                'deskripsi' => $kuis->deskripsi,
                'soal_count' => $kuis->soal_count,
                'has_kode' => !is_null($kuis->kode),
                'waktu_mulai' => $kuis->waktu_mulai,
                'waktu_selesai' => $kuis->waktu_selesai,
                'is_overdue' => $currentTime->greaterThan($kuis->waktu_selesai),
                'kuis_praktikan_id' => optional($kuis->kuis_praktikan()
                    ->select('id', 'selesai')
                    ->where('praktikan_id', $authPraktikan->id)
                    ->first())->id,
                'selesai' => optional($kuis->kuis_praktikan()
                        ->select('selesai')
                        ->where('praktikan_id', $authPraktikan->id)
                        ->first())->selesai ?? false,
                'sesi_praktikum' => $kuis->sesi_praktikum,
            ]),
            'currentDate' => $currentTime->toDateTimeString()
        ]);
    }
    public function kuisHistoryPage()
    {
        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $kuisHistory = KuisPraktikan::select([
            'id as kuis_praktikan_id',
            'kuis_id',
            'praktikan_id',
            'skor'
        ])
            ->where('praktikan_id', $authPraktikan->id)
            ->where('selesai', true)
            ->with([
                'kuis:id,nama,waktu_mulai,waktu_selesai,pertemuan_id',
                'kuis.pertemuan:id,praktikum_id',
                'kuis.pertemuan.praktikum:id,jenis_praktikum_id',
                'kuis.pertemuan.praktikum.jenis:id,nama,laboratorium_id',
                'kuis.pertemuan.praktikum.jenis.laboratorium:id,nama'
            ])
            ->addSelect([
                'soal_count' => SoalKuis::selectRaw('COUNT(*)')
                    ->whereColumn('kuis_id', 'kuis_praktikan.kuis_id')
            ])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->kuis->id,
                    'nama' => $item->kuis->nama,
                    'waktu_mulai' => $item->kuis->waktu_mulai,
                    'waktu_selesai' => $item->kuis->waktu_selesai,
                    'soal_count' => $item->soal_count,
                    'skor' => $item->skor,
                    'jenis_praktikum' => [
                        'id' => $item->kuis->pertemuan->praktikum->jenis->id,
                        'nama' => $item->kuis->pertemuan->praktikum->jenis->nama
                    ],
                    'laboratorium' => [
                        'id' => $item->kuis->pertemuan->praktikum->jenis->laboratorium->id,
                        'nama' => $item->kuis->pertemuan->praktikum->jenis->laboratorium->nama
                    ],
                    'kuis_praktikan_id' => $item->kuis_praktikan_id
                ];
            });

        return Inertia::render('Praktikan/PraktikanKuisHistoryPage', [
            'kuis' => $kuisHistory
        ]);
    }

    public function kuisExamPage(Request $request, $id = null)
    {
        if (!$id) {
            abort(404);
        }

        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $now = Carbon::now('Asia/Jakarta');

        $kuisPraktikan = KuisPraktikan::select(['id', 'kuis_id', 'praktikan_id', 'selesai'])
            ->where('id', $id)
            ->where('praktikan_id', $authPraktikan->id)
            ->with([
                'kuis:id,waktu_mulai,waktu_selesai',
                'kuis.soal_kuis:id,kuis_id,soal_id',
                'kuis.soal_kuis.soal:id,pertanyaan,pilihan_jawaban',
                'jawaban_kuis:id,soal_id,jawaban,kuis_praktikan_id',
            ])
            ->first();

        if (!$kuisPraktikan) {
            abort(403, 'Anda tidak diizinkan mengakses kuis ini.');
        } else if ($kuisPraktikan->selesai) {
            return redirect()->route('praktikan.kuis.result', ['id' => $kuisPraktikan->id]);
        }

        $isOverdue = !($kuisPraktikan->kuis->waktu_mulai <= $now && $kuisPraktikan->kuis->waktu_selesai >= $now);

        if ($kuisPraktikan->selesai) {
            abort(403, 'Kuis ini sudah selesai dan tidak dapat dikerjakan kembali.');
        }

        return Inertia::render('Praktikan/PraktikanKuisExamPage', [
            'serverTime' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
            'kuis_praktikan' => fn() => [
                'id' => $kuisPraktikan->id,
                'waktu_mulai' => $kuisPraktikan->kuis->waktu_mulai,
                'waktu_selesai' => $kuisPraktikan->kuis->waktu_selesai,
                'is_overdue' => $isOverdue,
            ],
            'soals' => fn() => $kuisPraktikan->kuis->soal_kuis->map(fn($soal_kuis) => [
                'id' => $soal_kuis->soal->id,
                'pertanyaan' => $soal_kuis->soal->pertanyaan,
                'pilihan_jawaban' => $soal_kuis->soal->pilihan_jawaban,
            ]),
            'jawabans' => fn() => $kuisPraktikan->jawaban_kuis->map(fn($jawaban) => [
                'id' => $jawaban->id,
                'soal_id' => $jawaban->soal_id,
                'jawaban' => $jawaban->jawaban,
            ]),
        ]);
    }
    public function kuisResultPage(Request $request, $id = null)
    {
        if (!$id) {
            abort(404);
        }

        $authPraktikan = Auth::guard('praktikan')->user();
        if (!$authPraktikan) {
            abort(401);
        }

        $kuisPraktikan = KuisPraktikan::select([
            'id', 'kuis_id', 'praktikan_id', 'skor', 'updated_at'
        ])
            ->where('id', $id)
            ->where('selesai', true)
            ->where('praktikan_id', $authPraktikan->id)
            ->with([
                'kuis:id,nama,waktu_mulai,waktu_selesai,pertemuan_id',
                'kuis.pertemuan:id,praktikum_id',
                'kuis.pertemuan.praktikum:id,jenis_praktikum_id',
                'kuis.pertemuan.praktikum.jenis:id,laboratorium_id',
                'kuis.pertemuan.praktikum.jenis.laboratorium:id,nama'
            ])
            ->withCount([
                'jawaban_kuis as jumlah_benar' => function ($query) {
                    $query->where('status', true);
                }
            ])
            ->addSelect([
                'soal_count' => SoalKuis::selectRaw('COUNT(*)')
                    ->whereColumn('kuis_id', 'kuis_praktikan.kuis_id')
            ])
            ->first();

        if (!$kuisPraktikan) {
            abort(404);
        }

        return Inertia::render('Praktikan/PraktikanKuisResultPage', [
            'kuisPraktikan' => [
                'id' => $kuisPraktikan->id,
                'skor' => $kuisPraktikan->skor,
                'jumlah_benar' => $kuisPraktikan->jumlah_benar,
                'updated_at' => $kuisPraktikan->updated_at->toDateTimeString(),
                'kuis' => [
                    'id' => $kuisPraktikan->kuis->id,
                    'nama' => $kuisPraktikan->kuis->nama,
                    'waktu_mulai' => $kuisPraktikan->kuis->waktu_mulai,
                    'waktu_selesai' => $kuisPraktikan->kuis->waktu_selesai,
                    'soal_count' => $kuisPraktikan->soal_count
                ],
                'laboratorium' => $kuisPraktikan->kuis->pertemuan->praktikum->jenis->laboratorium
            ],
        ]);
    }
}
