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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_no')->unique();
            $table->string('contract_type')->comment('New | Renewal');
            $table->unsignedBigInteger('uploaded_by');
            $table->string('status')->default('DRAFT');
            $table->foreign('uploaded_by')->references('id')->on('users');
            $table->string('execution_file_path')->nullable();
            $table->timestamp('execution_uploaded_at')->nullable();
            $table->foreignId('execution_uploaded_by')
                ->nullable()
                ->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
