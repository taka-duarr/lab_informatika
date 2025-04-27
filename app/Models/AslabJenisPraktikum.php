<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use OwenIt\Auditing\Auditable;

class AslabJenisPraktikum extends Model implements AuditableContract
{
    use HasUuids;
    use Auditable;
    protected $table = 'aslab_jenis_praktikum';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];
}