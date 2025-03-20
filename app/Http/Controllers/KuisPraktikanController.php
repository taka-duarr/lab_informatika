<?php

namespace App\Http\Controllers;

use App\Models\JawabanKuis;
use App\Models\Kuis;
use App\Models\KuisPraktikan;
use App\Models\Soal;
use App\Models\SoalKuis;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;

class KuisPraktikanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'kuis_id' => 'required|exists:kuis,id',
                'praktikan_id' => 'nullable|exists:praktikan,id',
                'kode' => 'nullable',
            ]);

            $authPraktikan = Auth::guard('praktikan')->user();
            $payloadPraktikanId = $validated['praktikan_id'];

            if (is_null($authPraktikan) && is_null($payloadPraktikanId)) {
                return Response::json([
                    'message' => 'Data Praktikan tidak disertakan'
                ], 422);
            }

            $isKuisExists = KuisPraktikan::where('kuis_id', $validated['kuis_id'])
                ->where('praktikan_id', $validated['praktikan_id'])
                ->exists();

            if ($isKuisExists) {
                return Response::json([
                    'message' => 'Kuis sudah dilaksanakan'
                ], 409);
            }

            $kuis = Kuis::find($validated['kuis_id']);

            if ($kuis->kode) {
                if(($validated['kode'] ?? null) !== $kuis->kode) {
                    return Response::json([
                        'message' => 'Kode Kuis tidak valid'
                    ], 401);
                }
            }

            $kuisPraktikan = KuisPraktikan::create([
                'id' => Str::uuid(),
                'kuis_id' => $validated['kuis_id'],
                'praktikan_id' => $validated['praktikan_id'] ?? $authPraktikan->id,
            ]);
            return Response::json([
                'message' => 'Kuis berhasil dimulai',
                'kuis_praktikan_id' => $kuisPraktikan->id,
            ]);
        } catch (QueryException $exception) {
            return $this->queryExceptionResponse($exception);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        //
    }
    public function submitEnd(Request $request)
    {
        $validated = $request->validate([
            'praktikan_id' => 'required|uuid|exists:praktikan,id',
            'kuis_praktikan_id' => 'required|uuid|exists:kuis_praktikan,id',
        ]);

        try {
            DB::beginTransaction();

            $kuisPraktikan = KuisPraktikan::where('id', $validated['kuis_praktikan_id'])
                ->where('praktikan_id', $validated['praktikan_id'])
                ->first();

            if (!$kuisPraktikan) {
                return Response::json(['message' => 'Kuis Praktikan tidak ditemukan'], 404);
            }

            $jawabanKuis = JawabanKuis::query()
                ->join('soal_kuis', 'jawaban_kuis.soal_id', '=', 'soal_kuis.soal_id')
                ->where('soal_kuis.kuis_id', $kuisPraktikan->kuis_id)
                ->where('jawaban_kuis.kuis_praktikan_id', $kuisPraktikan->id)
                ->select('jawaban_kuis.*')
                ->get();

            $jumlahSoal = SoalKuis::where('kuis_id', $kuisPraktikan->kuis_id)->count();

            $soalList = Soal::whereIn('id', $jawabanKuis->pluck('soal_id'))->pluck('kunci_jawaban', 'id');

            $jumlahBenar = 0;
            foreach ($jawabanKuis as $jawaban) {
                $kunci = $soalList[$jawaban->soal_id] ?? null;
                $isCorrect = $kunci && strtolower(trim($jawaban->jawaban)) === strtolower(trim($kunci));

                $jawaban->update(['status' => $isCorrect]);
                if ($isCorrect) {
                    $jumlahBenar++;
                }
            }

            $skor = $jumlahSoal > 0 ? intval(($jumlahBenar / $jumlahSoal) * 100) : 0;

            $kuisPraktikan->update([
                'skor' => $skor,
                'selesai' => true,
            ]);

            DB::commit();

            return Response::json([
                'message' => 'Kuis berhasil diselesaikan dan dikoreksi.',
                'skor' => $kuisPraktikan->skor,
            ]);
        } catch (QueryException $exception) {
            DB::rollBack();
            return $this->queryExceptionResponse($exception);
        }
    }
}
