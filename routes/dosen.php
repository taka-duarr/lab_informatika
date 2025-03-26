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
});
