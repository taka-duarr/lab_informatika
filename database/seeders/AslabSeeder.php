<?php

namespace Database\Seeders;

use App\Models\Aslab;
use App\Models\Laboratorium;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class AslabSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Aslab::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $faker = Faker::create('id_ID');

        $labJarkom = Laboratorium::where('nama', 'Jaringan Komputer')->first();
        $labRpl = Laboratorium::where('nama', 'Rekayasa Perangkat Lunak')->first();

        $data = [
            // Aslab Jaringan Komputer
            ['nama' => 'Mochamad Luthfan Rianda Putra', 'npm' => '06.2021.1.07397', 'jabatan' => 'Koordinator', 'lab' => $labJarkom->id],
            ['nama' => 'Indy Adira Khalfani', 'npm' => '06.2021.1.07434', 'jabatan' => 'Admin', 'lab' => $labJarkom->id],
            ['nama' => 'Latiful Sirri', 'npm' => '06.2021.1.07461', 'jabatan' => 'Hardware-Software', 'lab' => $labJarkom->id],
            ['nama' => 'Chatarina Natassya Putri', 'npm' => '06.2021.1.07482', 'jabatan' => 'Sekretaris', 'lab' => $labJarkom->id],
            ['nama' => 'Afzal Musyaffa Lathif Ashrafil Adam', 'npm' => '06.2022.1.07587', 'jabatan' => 'Koordinator', 'lab' => $labJarkom->id],
            ['nama' => 'Windi Nitasya Lubis', 'npm' => '06.2022.1.07590', 'jabatan' => 'Admin', 'lab' => $labJarkom->id],
            ['nama' => 'Marikh Kasiful Izzat', 'npm' => '06.2022.1.07610', 'jabatan' => 'Koordinator', 'lab' => $labJarkom->id],
            ['nama' => 'Gregoria Stefania Kue Siga', 'npm' => '06.2022.1.07626', 'jabatan' => 'Bendahara', 'lab' => $labJarkom->id],

            // Aslab Rekayasa Perangkat Lunak
            ['nama' => 'Luthfi Shidqi Habibulloh', 'npm' => '06.2023.1.07702', 'jabatan' => 'Admin', 'lab' => $labRpl->id],
            ['nama' => 'Annas Tasya Esti Aryus Jannah', 'npm' => '06.2022.1.07599', 'jabatan' => 'Bendahara', 'lab' => $labRpl->id],
            ['nama' => 'Melani Dwi Anggraini', 'npm' => '06.2022.1.07608', 'jabatan' => 'Bendahara', 'lab' => $labRpl->id],
            ['nama' => 'R. Abiyyu Ardi Lian Permadi', 'npm' => '06.2023.1.07661', 'jabatan' => 'Sekretaris', 'lab' => $labRpl->id],
            ['nama' => 'Aditya Minantoko Putra', 'npm' => '06.2022.1.07542', 'jabatan' => 'Anggota', 'lab' => $labRpl->id],
            ['nama' => 'Mujahid Muda A', 'npm' => '06.2023.1.07740', 'jabatan' => 'Batman', 'lab' => $labRpl->id],
            ['nama' => 'Ahmad Maulana Ismaindra', 'npm' => '06.2023.1.07659', 'jabatan' => 'Admin', 'lab' => $labRpl->id],
        ];

        $aslabs = array_map(function ($aslab) use ($faker) {
            return [
                'id' => Str::uuid(),
                'nama' => $aslab['nama'],
                'no_hp' => $faker->randomElement(['0857', '0812', '0858', '0898', '0838']) . $faker->numerify('########'),
                'username' => $aslab['npm'],
                'password' => Hash::make($aslab['npm'], ['rounds' => 12]),
                'jabatan' => $aslab['jabatan'],
                'laboratorium_id' => $aslab['lab'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }, $data);

        Aslab::insert($aslabs);
    }
}
