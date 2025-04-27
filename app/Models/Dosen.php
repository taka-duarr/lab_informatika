<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;



class Dosen extends Authenticatable implements AuditableContract
{
    use HasUuids,Auditable;
    protected $table = 'dosen';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function laboratorium(): BelongsToMany
    {
        return $this->belongsToMany(Laboratorium::class, 'dosen_laboratorium', 'dosen_id', 'laboratorium_id');
    }
}