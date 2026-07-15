<?php

use App\Http\Controllers\Pages\AslabPagesController;
use Illuminate\Support\Facades\Route;

Route::prefix('aslab')->name('aslab.')->middleware('guard:aslab')->group(function () {
    Route::get('/dashboard', [AslabPagesController::class, 'dashboardPage'])->name('dashboard');
    Route::get('/profile', [AslabPagesController::class, 'profilePage'])->name('profile');

    Route::prefix('praktikum')->name('praktikum.')->group(function () {
        Route::get('/', [AslabPagesController::class, 'praktikumIndexPage'])->name('index');
        Route::get('/create', [AslabPagesController::class, 'praktikumCreatePage'])->name('create');
        Route::get('/details/{id}', [AslabPagesController::class, 'praktikumDetailsPage'])->name('details');
    });

    Route::prefix('nilai-praktikum')->name('nilai-praktikum.')->group(function () {
        Route::get('/', [\App\Http\Controllers\NilaiController::class, 'listPraktikum'])->name('index');
        Route::get('/{praktikum_id}', [\App\Http\Controllers\NilaiController::class, 'index'])->name('details');
        Route::post('/{praktikum_id}/update-cell', [\App\Http\Controllers\NilaiController::class, 'updateCell'])->name('update-cell');
        Route::get('/{praktikum_id}/export', [\App\Http\Controllers\NilaiController::class, 'exportExcel'])->name('export');
        Route::post('/{praktikum_id}/import', [\App\Http\Controllers\NilaiController::class, 'importExcel'])->name('import');
    });
});
