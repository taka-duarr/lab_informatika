<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Laboratorium;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $laboratoriums = Laboratorium::select('id', 'nama')->get();

        foreach ($laboratoriums as $laboratorium) {
            if ($laboratorium->nama === 'Bahasa Pemrograman') {
                Admin::updateOrCreate(
                    ['username' => 'adminbasprog1'],
                    [
                        'id' => Str::uuid(),
                        'nama' => 'Admin Basprog 1',
                        'password' => Hash::make('123456', ['rounds' => 12]),
                        'laboratorium_id' => $laboratorium->id,
                    ]
                );
                Admin::updateOrCreate(
                    ['username' => 'adminbasprog2'],
                    [
                        'id' => Str::uuid(),
                        'nama' => 'Admin Basprog 2',
                        'password' => Hash::make('123456', ['rounds' => 12]),
                        'laboratorium_id' => $laboratorium->id,
                    ]
                );
            } elseif ($laboratorium->nama === 'Rekayasa Perangkat Lunak') {
                Admin::updateOrCreate(
                    ['username' => 'adminrpl1'],
                    [
                        'id' => Str::uuid(),
                        'nama' => 'Admin RPL 1',
                        'password' => Hash::make('123456', ['rounds' => 12]),
                        'laboratorium_id' => $laboratorium->id,
                    ]
                );
                Admin::updateOrCreate(
                    ['username' => 'adminrpl2'],
                    [
                        'id' => Str::uuid(),
                        'nama' => 'Admin RPL 2',
                        'password' => Hash::make('123456', ['rounds' => 12]),
                        'laboratorium_id' => $laboratorium->id,
                    ]
                );
            } elseif ($laboratorium->nama === 'Jaringan Komputer') {
                Admin::updateOrCreate(
                    ['username' => 'adminjarkom1'],
                    [
                        'id' => Str::uuid(),
                        'nama' => 'Admin Jarkom 1',
                        'password' => Hash::make('123456', ['rounds' => 12]),
                        'laboratorium_id' => $laboratorium->id,
                    ]
                );
                Admin::updateOrCreate(
                    ['username' => 'adminjarkom2'],
                    [
                        'id' => Str::uuid(),
                        'nama' => 'Admin Jarkom 2',
                        'password' => Hash::make('123456', ['rounds' => 12]),
                        'laboratorium_id' => $laboratorium->id,
                    ]
                );
            }
        }
        Admin::updateOrCreate(
            ['username' => 'shadow1'],
            [
                'id' => Str::uuid(),
                'nama' => 'Shadow 1',
                'password' => Hash::make('123456', ['rounds' => 12]),
                'laboratorium_id' => null,
            ]
        );
    }
}
