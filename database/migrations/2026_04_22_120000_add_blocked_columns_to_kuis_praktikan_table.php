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
        Schema::table('kuis_praktikan', function (Blueprint $table) {
            $table->boolean('blocked')->default(false)->after('selesai');
            $table->timestamp('blocked_at')->nullable()->after('blocked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kuis_praktikan', function (Blueprint $table) {
            $table->dropColumn(['blocked', 'blocked_at']);
        });
    }
};
