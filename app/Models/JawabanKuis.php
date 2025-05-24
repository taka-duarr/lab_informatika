<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class JawabanKuis extends Model
{
    use HasUuids;
    protected $table = 'jawaban_kuis';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];
    public function soal()
    {
        return $this->belongsTo(Soal::class, 'soal_id');
    }
    public function praktikan()
    {
        return $this->belongsTo(Praktikan::class, 'praktikan_id');
    }
}
