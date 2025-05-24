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
        Schema::create('aslab_jenis_praktikum', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('aslab_id')->constrained('aslab')->cascadeOnDelete();
            $table->foreignUuid('jenis_praktikum_id')->constrained('jenis_praktikum')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aslab_jenis_praktikum');
    }
};
