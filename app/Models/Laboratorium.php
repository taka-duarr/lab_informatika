<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class Laboratorium extends Model implements AuditableContract
{
    use HasUuids,Auditable;
    protected $table = 'laboratorium';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function admin(): HasMany
    {
        return $this->hasMany(Admin::class, 'laboratorium_id');
    }
    public function aslab(): HasMany
    {
        return $this->hasMany(Aslab::class, 'laboratorium_id');
    }
    public function dosen(): BelongsToMany
    {
        return $this->belongsToMany(Dosen::class, 'dosen_laboratorium', 'laboratorium_id', 'dosen_id');
    }

    public function jenis_praktikum() : HasMany {
        return $this->hasMany(JenisPraktikum::class, 'laboratorium_id');
    }
    public function jenis_nilai(): HasMany
    {
        return $this->hasMany(JenisNilai::class, 'laboratorium_id');
    }
}