<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Aslab;
use App\Models\Berita;
use App\Models\Laboratorium;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UniversalPagesController extends Controller
{
    public function welcome()
    {
        return Inertia::render('Welcome' , [
            'aslabs' => fn() => Aslab::select(['id', 'nama', 'username', 'jabatan', 'avatar', 'laboratorium_id'])->with('laboratorium:id,nama')->where('aktif', true)->orderBy('username', 'asc')->get(),
            'laboratoriums' => fn() => Laboratorium::select(['id', 'nama'])
                ->with([
                    'aslab' => function ($query) {
                        $query->select(['id','nama','username','jabatan','avatar','laboratorium_id']);
                        $query->where('aktif', true);
                        $query->orderBy('username', 'asc');
                    }
                ])
                ->get()
                ->map(function ($lab) {
                    return [
                        'id' => $lab->id,
                        'nama' => $lab->nama,
                        'aslabs' => $lab->aslab,
                    ];
                }),
            'beritas' => fn() => Berita::select(['id', 'judul', 'slug', 'deskripsi', 'updated_at', 'admin_id', 'laboratorium_id'])->with(['admin:id,nama', 'laboratorium:id,nama'])->orderBy('updated_at', 'desc')->get()
        ]);
    }
}
