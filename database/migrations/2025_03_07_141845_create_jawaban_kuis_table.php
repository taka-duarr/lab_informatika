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
        Schema::create('jawaban_kuis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('soal_id')->constrained('soal')->cascadeOnDelete();
            $table->foreignUuid('kuis_praktikan_id')->constrained('kuis_praktikan')->cascadeOnDelete();
            $table->string('jawaban');
            $table->boolean('status')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jawaban_kuis');
    }
};
