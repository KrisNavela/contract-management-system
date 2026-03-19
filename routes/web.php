<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\ContractController;
use App\Http\Controllers\ContractApprovalController;
use App\Http\Controllers\ApprovalQueueController;
use App\Http\Controllers\ReviewerQueueController;
use App\Http\Controllers\InitialVerifierQueueController;
use App\Http\Controllers\FinalVerifierQueueController;
use App\Http\Controllers\InitialApproverQueueController;
use App\Http\Controllers\FinalApproverQueueController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LegalDocumentController;
use App\Http\Controllers\LegalDocumentApprovalController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    /*Route::get('/dashboard', fn () => Inertia::render('dashboard'))
        ->name('dashboard');*/

    Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | CONTRACTS
    |--------------------------------------------------------------------------
    */

    Route::get('/contracts/all', [ContractController::class, 'all'])
        ->name('contracts.all');

    Route::get('/contracts', [ContractController::class, 'index'])
        ->name('contracts.index');

    Route::get('/contracts/create', [ContractController::class, 'create'])
        ->name('contracts.create');

    Route::post('/contracts', [ContractController::class, 'store'])
        ->name('contracts.store');

    Route::get('/contracts/{contract}', [ContractController::class, 'show'])
        ->name('contracts.show');

    Route::get('/contracts/{contract}/edit', [ContractController::class, 'edit'])
        ->name('contracts.edit');

    Route::put('/contracts/{contract}', [ContractController::class, 'update'])
        ->name('contracts.update');

    Route::delete(
        '/contracts/files/{contractFile}',
        [ContractController::class, 'destroyFile']
    )->name('contracts.files.destroy');

    Route::post(
        '/contracts/{contract}/files',
        [ContractController::class, 'uploadFile']
    )->name('contracts.files.store');

    /*
    |--------------------------------------------------------------------------
    | CONTRACT APPROVAL (🔥 FIXED — ONLY ONE ROUTE)
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/contracts/{contract}/approval',
        [ContractApprovalController::class, 'action']
    )->name('contracts.approval.action');


    /*
    |--------------------------------------------------------------------------
    | APPROVAL QUEUES
    |--------------------------------------------------------------------------
    */

    Route::get('/queue/reviewer',
        [ReviewerQueueController::class, 'index']
    )->middleware('role:REVIEWER,ADMIN')->name('queue.reviewer');

    Route::get('/queue/initial-verifier',
        [InitialVerifierQueueController::class, 'index']
    )->middleware('role:INITIAL_VERIFIER,ADMIN')
     ->name('queue.initial-verifier');

    Route::get('/queue/final-verifier',
        [FinalVerifierQueueController::class, 'index']
    )->middleware('role:FINAL_VERIFIER,ADMIN')
     ->name('queue.final-verifier');

    Route::get('/queue/initial-approver',
        [InitialApproverQueueController::class, 'index']
    )->middleware('role:INITIAL_APPROVER,ADMIN')
     ->name('queue.initial-approver');

    Route::get('/queue/final-approver',
        [FinalApproverQueueController::class, 'index']
    )->middleware('role:FINAL_APPROVER,ADMIN')
     ->name('queue.final-approver');


    /*
    |--------------------------------------------------------------------------
    | EXECUTION DOCUMENT
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/contracts/{contract}/execution-document',
        [ContractController::class, 'uploadExecutionDocument']
    )->name('contracts.execution.upload');


    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    Route::middleware(['role:ADMIN'])->group(function () {

        Route::get('/branches', [BranchController::class, 'index'])
            ->name('branches.index');

        Route::post('/branches', [BranchController::class, 'store'])
            ->name('branches.store');

        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');

        Route::put('/users/{user}/role',
            [UserController::class, 'updateRole']
        )->name('users.role.update');

        Route::put('/users/{user}/legal-role',
            [UserController::class, 'updateLegalRole']
        )->name('users.legal-role.update');

        Route::put('/users/{user}/branch',
            [UserController::class, 'updateBranch']
        )->name('users.branch.update');

        Route::put('/users/{user}/department',
            [UserController::class, 'updateDepartment']
        )->name('users.department.update');
    });


    /*
    |--------------------------------------------------------------------------
    | LEGAL DOCUMENTS
    |--------------------------------------------------------------------------
    */

    Route::get('/legal-documents',
        [LegalDocumentController::class, 'index']
    )->name('legal-documents.index');

    Route::get('/legal-documents/create',
        [LegalDocumentController::class, 'create']
    )->name('legal-documents.create');

    Route::post('/legal-documents',
        [LegalDocumentController::class, 'store']
    )->name('legal-documents.store');

    Route::get('/legal-documents/{legalDocument}',
        [LegalDocumentController::class, 'show']
    )->name('legal-documents.show');

    Route::get('/legal-documents/{document}/edit',
        [LegalDocumentController::class, 'edit']);

    Route::post('/legal-documents/{document}/update',
        [LegalDocumentController::class, 'update']);


    /*
    |--------------------------------------------------------------------------
    | LEGAL APPROVALS
    |--------------------------------------------------------------------------
    */

    Route::get('/legal/department-approvals',
        [LegalDocumentApprovalController::class, 'departmentIndex']
    )->name('legal.department.index');

    Route::post('/legal-documents/{document}/department-approve',
        [LegalDocumentApprovalController::class, 'departmentApprove']);

    Route::post('/legal-documents/{document}/department-return',
        [LegalDocumentApprovalController::class, 'departmentReturn']);

    Route::post('/legal-documents/{document}/department-reject',
        [LegalDocumentApprovalController::class, 'departmentReject']);

    Route::get('/legal/legal-approvals',
        [LegalDocumentApprovalController::class, 'legalIndex']
    )->name('legal.legal.index');

    Route::post('/legal-documents/{document}/legal-approve',
        [LegalDocumentApprovalController::class, 'legalApprove']);

    Route::post('/legal-documents/{document}/legal-return',
        [LegalDocumentApprovalController::class, 'legalReturn']);

    Route::post('/legal-documents/{document}/legal-reject',
        [LegalDocumentApprovalController::class, 'legalReject']);

    Route::post('/legal-documents/{document}/resubmit',
        [LegalDocumentApprovalController::class, 'resubmit']);

    Route::post('/legal-documents/{document}/execution',
        [LegalDocumentController::class, 'uploadExecution'])
        ->name('legal.execution.upload');

});


require __DIR__.'/settings.php';
