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
        Schema::table('legal_documents', function (Blueprint $table) {
            $table->string('execution_file_path')->nullable();
            $table->timestamp('execution_uploaded_at')->nullable();
            $table->foreignId('execution_uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('legal_documents', function (Blueprint $table) {
            //
        });
    }
};
