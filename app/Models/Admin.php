<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class Admin extends Authenticatable implements AuditableContract
{
    use HasUuids, Auditable;
    protected $table = 'admin';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public static function getKeeUsername()
    {
        return 'superADM';
    }
    public function laboratorium(): BelongsTo
    {
        return $this->belongsTo(Laboratorium::class, 'laboratorium_id');
    }
}
