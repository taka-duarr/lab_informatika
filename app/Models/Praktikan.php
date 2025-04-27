<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class Praktikan extends Authenticatable implements AuditableContract
{
    use HasUuids,Auditable;
    protected $table = 'praktikan';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];
    public function praktikum(): BelongsToMany
    {
        return $this->belongsToMany(Praktikum::class, 'praktikum_praktikan', 'praktikan_id', 'praktikum_id')
            ->withPivot(['krs', 'pembayaran', 'modul', 'terverifikasi', 'sesi_praktikum_id', 'aslab_id']);
    }
    public function sesi(): BelongsTo
    {
        return $this->belongsTo(SesiPraktikum::class, 'sesi_praktikum_id');
    }
    public function aslab(): BelongsTo
    {
        return $this->belongsTo(Aslab::class, 'aslab_id');
    }
    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }
    public function praktikum_praktikan(): HasMany
    {
        return $this->hasMany(PraktikumPraktikan::class, 'praktikan_id');
    }
}