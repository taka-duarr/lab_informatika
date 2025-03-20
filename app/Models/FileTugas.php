<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FileTugas extends Model
{
    use HasUuids;
    protected $table = 'file_tugas';
    protected $primaryKey = 'id';
    protected $guarded = ['id'];

    public function tugas()
    {
        return $this->belongsTo(Tugas::class, 'tugas_id');
    }
}
