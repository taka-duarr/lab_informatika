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
        Schema::create('kuis_praktikan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kuis_id')->constrained('kuis')->cascadeOnDelete();
            $table->foreignUuid('praktikan_id')->constrained('praktikan')->cascadeOnDelete();
            $table->integer('skor')->default(0);
            $table->boolean('selesai')->default(false);

            $table->timestamps();
            $table->unique(['kuis_id', 'praktikan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kuis_praktikan');
    }
};
