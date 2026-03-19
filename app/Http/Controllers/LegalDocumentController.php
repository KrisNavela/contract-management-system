<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use App\Models\LegalDocumentFile;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LegalDocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = LegalDocument::with([
            'department',
            'creator',
            'files',
            'remarks.user',
        ])->latest();

        /* ================= ROLE SCOPING ================= */

        if (in_array($user->legal_role, ['USER', 'DEPARTMENT_HEAD'])) {

            $query->where('department_id', $user->department_id);

            // USER only sees own docs
            if ($user->legal_role === 'USER') {
                $query->where('created_by', $user->id);
            }

            // 🔒 force department filter value
            $request->merge([
                'department_id' => $user->department_id,
            ]);
        }

        // LEGAL_OFFICER sees all departments (no restriction)

        /* ================= FILTERS ================= */

        $query
            ->when($request->reference_no, fn ($q, $v) =>
                $q->where('reference_no', 'like', "%{$v}%")
            )
            ->when($request->title, fn ($q, $v) =>
                $q->where('title', $v)
            )
            ->when(
                $user->legal_role === 'LEGAL_OFFICER' && $request->department_id,
                fn ($q) =>
                    $q->where('department_id', $request->department_id)
            )
            ->when($request->status, fn ($q, $v) =>
                $q->where('status', $v)
            );

        return inertia('legal-documents/index', [
            'documents' => $query->paginate(10)->withQueryString(),

            'filters' => $request->only([
                'reference_no',
                'title',
                'department_id',
                'status',
            ]),

            // Only LEGAL_OFFICER gets department list
            'departments' =>
                $user->legal_role === 'LEGAL_OFFICER'
                    ? Department::select('id', 'name')->get()
                    : [],
        ]);
    }



    public function create()
    {
        return inertia('legal-documents/create');
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'department_id' => ['required', 'exists:departments,id'],
            'files' => ['nullable', 'array'],
            'files.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png,webp|max:5120',
        ]);

        $document = LegalDocument::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'department_id' => $data['department_id'],
            'created_by' => $user->id,
            'status' => 'SUBMITTED', // 👈 auto-submit
        ]);

        // Save files
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('legal-documents');

                $document->files()->create([
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(), // ✅ REQUIRED
                    'file_type' => $file->getClientMimeType(),     // ✅ GOOD PRACTICE
                ]);
            }
        }

        // Audit trail
        $document->remarks()->create([
            'action' => 'SUBMITTED',
            'remarks' => 'Document submitted to Department Head',
            'user_id' => $user->id,
        ]);

        /* =====================================================
        | NOTIFY DEPARTMENT HEAD(S)
        ===================================================== */

        $departmentHeads = \App\Models\User::where('legal_role', 'DEPARTMENT_HEAD')
            ->where('department_id', $document->department_id)
            ->get();

        foreach ($departmentHeads as $head) {
            if ($head->email) {
                \Mail::to($head->email)
                    ->queue(new \App\Mail\LegalDocumentNotification(
                        $document,
                        "A new legal document has been submitted and requires your department approval."
                    ));
            }
        }

        return redirect()
            ->route('legal-documents.show', $document)
            ->with('success', 'Legal document submitted to Department Head.');
    }



    public function show(LegalDocument $legalDocument)
    {
        $legalDocument->load([
            'department',
            'creator',
            'files',
            'remarks.user',
        ]);

        return inertia('legal-documents/show', [
            'document' => $legalDocument,
        ]);
    }

    public function edit(LegalDocument $document)
    {
        abort_if(
            auth()->user()->legal_role !== 'USER' ||
            $document->status !== 'RETURNED',
            403
        );

        return inertia('legal-documents/edit', [
            'document' => $document->load('files'),
        ]);
    }

    public function update(Request $request, LegalDocument $document)
    {
        abort_if(
            auth()->user()->legal_role !== 'USER' ||
            $document->status !== 'RETURNED',
            403
        );

        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'files.*' => 'file|max:10240',
            'remarks' => 'required|string|min:3',
        ]);

        $document->update([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => 'SUBMITTED',
        ]);

        $document->remarks()->create([
            'user_id' => auth()->id(),
            'action' => 'RESUBMIT',
            'remarks' => $request->remarks,
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {

                $path = $file->store(
                    'legal-documents',
                    'public'
                );

                LegalDocumentFile::create([
                    'legal_document_id' => $document->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientMimeType(),
                ]);
            }
        }

        return redirect('/legal-documents/' . $document->id)
            ->with('success', 'Document resubmitted successfully.');
    }

    public function uploadExecution(Request $request, LegalDocument $document)
    {
        $user = auth()->user();

        // Only creator can upload
        if ($document->created_by != auth()->id()) {
            abort(403, 'Only the document creator can upload execution.');
        }

        // Must be approved
        if (trim($document->status) !== 'APPROVED') {
            abort(403, 'Execution upload is allowed only when approved.');
        }

        // 🔐 Prevent duplicate
        abort_if($document->execution_file_path, 403);

        $request->validate([
            'execution_file' => 'required|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $path = $request->file('execution_file')
            ->store('legal-documents/execution', 'public');

        $document->update([
            'execution_file_path' => $path,
            'execution_uploaded_at' => now(),
            'execution_uploaded_by' => $user->id,
        ]);

        $document->remarks()->create([
            'user_id' => $user->id,
            'action' => 'EXECUTION_UPLOADED',
            'remarks' => 'Execution document uploaded.',
        ]);

        return back()->with('success', 'Execution document uploaded successfully.');
    }


}
