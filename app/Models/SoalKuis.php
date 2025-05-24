<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SoalKuis extends Model
{
    use HasUuids;
    protected $table = 'soal_kuis';
    protected $guarded = ['id'];
    public function kuis()
    {
        return $this->belongsTo(Kuis::class, 'kuis_id');
    }
    public function soal()
    {
        return $this->belongsTo(Soal::class, 'soal_id');
    }
}
