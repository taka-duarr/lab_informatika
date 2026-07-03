<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daftar_tamus', function (Blueprint $table) {
            $table->string('nama_tamu')->nullable()->change();
            $table->integer('jumlah_tamu')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('daftar_tamus', function (Blueprint $table) {
            $table->string('nama_tamu')->nullable(false)->change();
            $table->integer('jumlah_tamu')->nullable(false)->change();
        });
    }
};
