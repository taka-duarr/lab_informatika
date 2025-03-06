<?php

namespace App\Http\Controllers;

use App\Models\JenisNilai;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;

class JenisNilaiController extends Controller
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
                'jenis_nilai' => ['required', 'array'],
                'jenis_nilai.*.id' => ['required', 'uuid'],
                'jenis_nilai.*.nama' => ['required', 'string', 'max:255'],
                'jenis_nilai.*.urutan' => ['required', 'integer'],
                'jenis_nilai.*.aktif' => ['nullable', 'boolean'],
                'jenis_nilai.*.laboratorium_id' => ['required', 'uuid'],
            ]);

            DB::beginTransaction();

            $laboratoriumId = $validated['jenis_nilai'][0]['laboratorium_id'];

            $newIds = collect($validated['jenis_nilai'])->pluck('id');

            JenisNilai::where('laboratorium_id', $laboratoriumId)
                ->whereNotIn('id', $newIds)
                ->delete();

            foreach ($validated['jenis_nilai'] as $data) {
                JenisNilai::updateOrCreate(['id' => $data['id']], $data);
            }

            DB::commit();

            return Response::json([
                'message' => 'Jenis Nilai Berhasil Disimpan',
            ]);
        } catch (QueryException $queryException) {
            DB::rollBack();
            return $this->queryExceptionResponse($queryException);
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
}
