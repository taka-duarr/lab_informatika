<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kuis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nama');
            $table->text('deskripsi');
            $table->dateTime('waktu_mulai');
            $table->dateTime('waktu_selesai');
            $table->string('kode')->nullable();

            $table->foreignUuid('pertemuan_id')->constrained('pertemuan');
            $table->foreignUuid('sesi_praktikum_id')->nullable()->constrained('sesi_praktikum');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kuis');
    }
};
