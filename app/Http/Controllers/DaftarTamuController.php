<?php

namespace App\Http\Controllers;

use App\Models\DaftarTamu;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DaftarTamuController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama_tamu' => 'required|string|max:255',
            'jumlah_tamu' => 'required|integer|min:1',
            'tujuan_aktivitas' => 'required|string|max:255',
            'kondisi_lab' => 'required|string|max:255',
        ]);

        DaftarTamu::create([
            'nama_tamu' => $request->nama_tamu,
            'jumlah_tamu' => $request->jumlah_tamu,
            'tanggal' => Carbon::now()->toDateString(),
            'jam_mulai' => Carbon::now()->toTimeString(),
            'jam_selesai' => null,
            'tujuan_aktivitas' => $request->tujuan_aktivitas,
            'kondisi_lab' => $request->kondisi_lab,
        ]);

        return redirect()->back()->with('success', 'Berhasil mengisi daftar tamu!');
    }

    public function checkout($id)
    {
        $daftarTamu = DaftarTamu::findOrFail($id);
        $daftarTamu->update([
            'jam_selesai' => Carbon::now()->toTimeString(),
        ]);

        return redirect()->back()->with('success', 'Berhasil melakukan checkout!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_tamu' => 'required|string|max:255',
            'jumlah_tamu' => 'required|integer|min:1',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:H:i:s',
            'jam_selesai' => 'nullable|date_format:H:i:s',
            'tujuan_aktivitas' => 'required|string|max:255',
            'kondisi_lab' => 'required|string|max:255',
        ]);

        $daftarTamu = DaftarTamu::findOrFail($id);
        $daftarTamu->update($request->only([
            'nama_tamu', 'jumlah_tamu', 'tanggal', 'jam_mulai', 'jam_selesai', 'tujuan_aktivitas', 'kondisi_lab'
        ]));

        return redirect()->back()->with('success', 'Berhasil memperbarui data!');
    }

    public function import(Request $request)
    {
        $request->validate([
            'data'                       => 'required|array',
            'data.*.tanggal'             => 'required|date',
            'data.*.jam_mulai'           => 'required|string',
            'data.*.jam_selesai'         => 'nullable|string',
            'data.*.tujuan_aktivitas'    => 'required|string|max:500',
            'data.*.kondisi_lab'         => 'nullable|string|max:255',
            'data.*.nama_tamu'           => 'nullable|string|max:255',
            'data.*.jumlah_tamu'         => 'nullable|integer|min:1',
        ]);

        foreach ($request->data as $item) {
            DaftarTamu::create([
                'nama_tamu'       => $item['nama_tamu'] ?? '-',
                'jumlah_tamu'     => $item['jumlah_tamu'] ?? 1,
                'tanggal'         => $item['tanggal'],
                'jam_mulai'       => $item['jam_mulai'],
                'jam_selesai'     => $item['jam_selesai'] ?? null,
                'tujuan_aktivitas'=> $item['tujuan_aktivitas'],
                'kondisi_lab'     => $item['kondisi_lab'] ?? '-',
            ]);
        }

        return redirect()->back()->with('success', 'Berhasil mengimport data!');
    }

    public function destroy($id)
    {
        $daftarTamu = DaftarTamu::findOrFail($id);
        $daftarTamu->delete();

        return redirect()->back()->with('success', 'Berhasil menghapus data!');
    }
}
