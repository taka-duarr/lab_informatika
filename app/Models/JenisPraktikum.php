<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;


class JenisPraktikum extends Model implements AuditableContract
{
    use HasUuids,Auditable;
    protected $table = 'jenis_praktikum';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class, 'laboratorium_id');
    }
    public function praktikum(): HasMany
    {
        return $this->hasMany(Praktikum::class, 'jenis_praktikum_id');
    }
    public function aslab(): BelongsToMany
    {
        return $this->belongsToMany(JenisPraktikum::class, 'aslab_jenis_praktikum', 'aslab_id', 'jenis_praktikum_id');
    }
}