<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AslabJenisPraktikum extends Model
{
    use HasUuids;
    protected $table = 'aslab_jenis_praktikum';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];
}
