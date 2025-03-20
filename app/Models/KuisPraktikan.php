<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class KuisPraktikan extends Model
{
    use HasUuids;
    protected $table = 'kuis_praktikan';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function kuis()
    {
        return $this->belongsTo(Kuis::class);
    }
    public function praktikan()
    {
        return $this->belongsTo(Praktikan::class);
    }
    public function jawaban_kuis()
    {
        return $this->hasMany(JawabanKuis::class, 'kuis_praktikan_id');
    }

}
