<?php

namespace App\Http\Controllers;

use App\Models\JawabanKuis;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
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

            $jawabanKuis = JawabanKuis::updateOrCreate(
                [
                    'soal_id' => $validated['soal_id'],
                    'kuis_praktikan_id' => $validated['kuis_praktikan_id'],
                ],
                [
                    'jawaban' => $validated['jawaban'],
                ]
            );

            return Response::json([
                'message' => 'Jawaban berhasil disimpan!',
                'data' => $jawabanKuis
            ]);
        } catch (QueryException $exception) {
            return $this->queryExceptionResponse($exception);
        }
    }
}
