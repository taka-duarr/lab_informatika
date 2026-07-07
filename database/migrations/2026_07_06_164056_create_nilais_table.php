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
        Schema::create('nilai', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('praktikum_id')->constrained('praktikum');
            $table->foreignUuid('praktikan_id')->constrained('praktikan');
            $table->foreignUuid('modul_id')->constrained('modul');
            $table->float('nilai_pretest')->nullable();
            $table->float('nilai_asistensi')->nullable();
            $table->float('nilai_asdos')->nullable();
            $table->timestamps();

            // A student has exactly one record per module per praktikum
            $table->unique(['praktikum_id', 'praktikan_id', 'modul_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nilai');
    }
};
