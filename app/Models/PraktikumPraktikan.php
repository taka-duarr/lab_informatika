<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PraktikumPraktikan extends Model
{
    use HasUuids;
    protected $table = 'praktikum_praktikan';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function praktikum() {
        return $this->belongsTo(Praktikum::class);
    }
    public function aslab() {
        return $this->belongsTo(Aslab::class);
    }
    public function dosen() {
        return $this->belongsTo(Dosen::class);
    }
    public function praktikan() {
        return $this->belongsTo(Praktikan::class);
    }
    public function sesi_praktikum(): BelongsTo
    {
        return $this->belongsTo(SesiPraktikum::class, 'sesi_praktikum_id');
    }
}
