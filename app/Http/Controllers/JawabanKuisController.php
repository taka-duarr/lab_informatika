<?php

namespace App\Http\Controllers;

use App\Models\JawabanKuis;
use App\Models\KuisPraktikan;
use App\Models\SoalKuis;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

class JawabanKuisController extends Controller
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
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function upsert(Request $request)
    {
        $authPraktikan = Auth::guard('praktikan')->user();

        if (!$authPraktikan) {
            return Response::json([
                'message' => 'Unauthorized man..'
            ], 401);
        }

        try {
            $validated = $request->validate([
                'soal_id' => 'required|uuid|exists:soal,id',
                'jawaban' => 'required|string',
                'kuis_praktikan_id' => 'required|uuid|exists:kuis_praktikan,id',
            ]);

            $kuisPraktikan = KuisPraktikan::with('kuis:id,waktu_mulai,waktu_selesai')
                ->where('id', $validated['kuis_praktikan_id'])
                ->where('praktikan_id', $authPraktikan->id)
                ->firstOrFail();

            if ($kuisPraktikan->selesai) {
                return Response::json([
                    'message' => 'Are you. Sure...?'
                ], 403);
            }

            $now = Carbon::now('Asia/Jakarta');

            if (
                $kuisPraktikan->kuis->waktu_mulai > $now ||
                $kuisPraktikan->kuis->waktu_selesai < $now
            ) {
                return Response::json([
                    'message' => 'Kuis sedang tidak berlangsung.'
                ], 403);
            }

            $soalAda = SoalKuis::where('kuis_id', $kuisPraktikan->kuis_id)
                ->where('soal_id', $validated['soal_id'])
                ->exists();

            if (!$soalAda) {
                return Response::json([
                    'message' => 'Soal ini tidak termasuk dalam kuis yang sedang dikerjakan.'
                ], 403);
            }

            $jawaban = JawabanKuis::updateOrCreate(
                [
                    'soal_id' => $validated['soal_id'],
                    'kuis_praktikan_id' => $kuisPraktikan->id,
                ],
                [
                    'jawaban' => $validated['jawaban'],
                ]
            );

            return Response::json([
                'message' => 'Jawaban berhasil disimpan!',
                'data' => $jawaban
            ]);
        } catch (ModelNotFoundException $modelNotFoundException) {
            return Response::json([
                'message' => 'Kuis tidak ditemukan atau bukan milikmu.'
            ], 403);
        } catch (QueryException $queryException) {
            return $this->queryExceptionResponse($queryException);
        }
    }
}
