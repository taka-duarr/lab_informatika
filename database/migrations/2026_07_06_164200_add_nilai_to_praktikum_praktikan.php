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
        Schema::table('praktikum_praktikan', function (Blueprint $table) {
            $table->float('nilai_ta')->nullable()->after('lulus');
            $table->float('nilai_total')->nullable()->after('nilai_ta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('praktikum_praktikan', function (Blueprint $table) {
            $table->dropColumn(['nilai_ta', 'nilai_total']);
        });
    }
};
