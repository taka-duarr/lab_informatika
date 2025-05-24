<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Tugas extends Model
{
    use HasUuids;
    protected $table = 'tugas';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function jawaban_tugas()
    {
        return $this->hasMany(JawabanTugas::class, 'jawaban_tugas_id');
    }
}
