<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DaftarTamu extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_tamu',
        'jumlah_tamu',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'tujuan_aktivitas',
        'kondisi_lab',
    ];
}
