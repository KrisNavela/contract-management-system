<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Alice Branch',
                'email' => 'branch@demo.com',
                'role' => 'BRANCH',
            ],
            [
                'name' => 'Bob Reviewer',
                'email' => 'reviewer@demo.com',
                'role' => 'REVIEWER',
            ],
            [
                'name' => 'Charlie Initial Verifier',
                'email' => 'init.verifier@demo.com',
                'role' => 'INITIAL_VERIFIER',
            ],
            [
                'name' => 'Diana Final Verifier',
                'email' => 'final.verifier@demo.com',
                'role' => 'FINAL_VERIFIER',
            ],
            [
                'name' => 'Evan Initial Approver',
                'email' => 'init.approver@demo.com',
                'role' => 'INITIAL_APPROVER',
            ],
            [
                'name' => 'Fiona Final Approver',
                'email' => 'final.approver@demo.com',
                'role' => 'FINAL_APPROVER',
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@demo.com',
                'role' => 'ADMIN',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'role' => $user['role'],
                ]
            );
        }
    }
}
