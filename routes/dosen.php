<?php

use App\Http\Controllers\Pages\DosenPagesController;
use Illuminate\Support\Facades\Route;

Route::prefix('dosen')->name('dosen.')->middleware('guard:dosen')->group(function () {
    Route::get('/dashboard', [DosenPagesController::class, 'dashboardPage'])->name('dashboard');
    Route::get('/profil', [DosenPagesController::class, 'profilePage'])->name('profile');

    Route::prefix('praktikum')->name('praktikum.')->group(function () {
        Route::get('/', [DosenPagesController::class, 'praktikumIndexPage'])->name('index');
        Route::get('/details/{id}', [DosenPagesController::class, 'praktikumDetailsPage'])->name('details');
    });

    Route::prefix('nilai-praktikum')->name('nilai-praktikum.')->group(function () {
        Route::get('/', [\App\Http\Controllers\NilaiController::class, 'listPraktikum'])->name('index');
        Route::get('/{praktikum_id}', [\App\Http\Controllers\NilaiController::class, 'index'])->name('details');
        Route::post('/{praktikum_id}/update-cell', [\App\Http\Controllers\NilaiController::class, 'updateCell'])->name('update-cell');
        Route::get('/{praktikum_id}/export', [\App\Http\Controllers\NilaiController::class, 'exportExcel'])->name('export');
        Route::post('/{praktikum_id}/import', [\App\Http\Controllers\NilaiController::class, 'importExcel'])->name('import');
    });
});