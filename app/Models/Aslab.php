<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class Aslab extends Authenticatable implements AuditableContract
{
    use HasUuids,Auditable;
    
    protected $table = 'aslab';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];
    protected $casts = [
        'status' => 'boolean',
    ];
    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class, 'laboratorium_id');
    }
    public function jenis_praktikum(): BelongsToMany
    {
        return $this->belongsToMany(JenisPraktikum::class, 'aslab_jenis_praktikum', 'aslab_id', 'jenis_praktikum_id');
    }



}