<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;


class Kuis extends Model implements AuditableContract
{
    use HasUuids, Auditable;

    protected $table = 'kuis';
    protected $guarded = ['id'];

    public function pertemuan()
    {
        return $this->belongsTo(Pertemuan::class, 'pertemuan_id');
    }
    public function soal()
    {
        return $this->belongsToMany(Soal::class, 'soal_kuis', 'kuis_id', 'soal_id');
    }
    public function praktikum()
    {
        return $this->hasOneThrough(Praktikum::class, Pertemuan::class, 'id', 'id', 'pertemuan_id', 'praktikum_id');
    }
    public function kuis_praktikan(): HasMany
    {
        return $this->hasMany(KuisPraktikan::class);
    }
    public function sesi_praktikum(): BelongsTo
    {
        return $this->belongsTo(SesiPraktikum::class, 'sesi_praktikum_id');
    }
    public function soal_kuis()
    {
        return $this->hasMany(SoalKuis::class, 'kuis_id');
    }
}