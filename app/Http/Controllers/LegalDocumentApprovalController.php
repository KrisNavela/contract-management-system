<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use App\Models\LegalDocumentRemark;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\LegalDocumentNotification;

class LegalDocumentApprovalController extends Controller
{   

    /* =====================================================
     | DEPARTMENT QUEUE
     ===================================================== */
    public function departmentIndex()
    {
        $user = auth()->user();

        $this->allowRoles(['DEPARTMENT_HEAD']);

        $query = LegalDocument::with(['department','creator','files'])
            ->where('status', 'SUBMITTED');

        if ($user->isDepartmentHead()) {
            $query->where('department_id', $user->department_id);
        }

        $documents = $query->latest()->paginate(10);

        return inertia('legal-documents/department-index', [
            'documents' => $documents,
        ]);
    }

    /* =====================================================
     | DEPARTMENT APPROVE → Notify LEGAL
     ===================================================== */
    public function departmentApprove(Request $request, LegalDocument $document)
    {
        $user = $request->user();

        abort_if($user->legal_role !== 'DEPARTMENT_HEAD', 403);
        abort_if($document->department_id !== $user->department_id, 403);
        abort_if($document->status !== 'SUBMITTED', 403);

        $request->validate([
            'remarks' => 'required|string|min:3',
        ]);

        $document->update(['status' => 'DEPARTMENT_APPROVED']);

        LegalDocumentRemark::create([
            'legal_document_id' => $document->id,
            'user_id' => $user->id,
            'action' => 'APPROVE',
            'remarks' => $request->remarks,
        ]);

        // Notify Legal Officers
        $legalOfficers = User::where('legal_role', 'LEGAL_OFFICER')->get();

        foreach ($legalOfficers as $officer) {
            if ($officer->email) {
                Mail::to($officer->email)
                    ->queue(new LegalDocumentNotification(
                        $document,
                        "A document has been approved by the Department Head and is pending Legal review."
                    ));
            }
        }

        return back()->with('success', 'Document approved and sent to Legal.');
    }

    /* =====================================================
     | DEPARTMENT RETURN → Notify CREATOR
     ===================================================== */
    public function departmentReturn(Request $request, LegalDocument $document)
    {
        $user = $request->user();

        abort_if($user->legal_role !== 'DEPARTMENT_HEAD', 403);
        abort_if($document->department_id !== $user->department_id, 403);
        abort_if($document->status !== 'SUBMITTED', 403);

        $request->validate([
            'remarks' => 'required|string',
        ]);

        $document->update(['status' => 'RETURNED']);

        LegalDocumentRemark::create([
            'legal_document_id' => $document->id,
            'user_id' => $user->id,
            'action' => 'RETURN',
            'remarks' => $request->remarks,
        ]);

        // Notify Creator
        $creator = $document->creator;

        if ($creator && $creator->email) {
            Mail::to($creator->email)
                ->queue(new LegalDocumentNotification(
                    $document,
                    "Your legal document has been returned by the Department Head."
                ));
        }

        return back()->with('success', 'Document returned to creator.');
    }

    /* =====================================================
     | DEPARTMENT REJECT → Notify CREATOR
     ===================================================== */
    public function departmentReject(Request $request, LegalDocument $document)
    {
        $request->validate([
            'remarks' => 'required|string',
        ]);

        $document->update(['status' => 'REJECTED']);

        $document->remarks()->create([
            'user_id' => auth()->id(),
            'action' => 'REJECT',
            'remarks' => $request->remarks,
        ]);

        $creator = $document->creator;

        if ($creator && $creator->email) {
            Mail::to($creator->email)
                ->queue(new LegalDocumentNotification(
                    $document,
                    "Your legal document has been rejected by the Department Head."
                ));
        }

        return back()->with('success', 'Document rejected.');
    }

    /* =====================================================
     | LEGAL QUEUE
     ===================================================== */
    public function legalIndex()
    {
        $this->allowRoles(['LEGAL_OFFICER']);

        $documents = LegalDocument::with(['department','creator','files'])
            ->where('status', 'DEPARTMENT_APPROVED')
            ->latest()
            ->paginate(10);

        return inertia('legal-documents/legal-index', [
            'documents' => $documents,
        ]);
    }

    /* =====================================================
     | LEGAL APPROVE → Notify CREATOR
     ===================================================== */
    public function legalApprove(Request $request, LegalDocument $document)
    {
        $user = $request->user();

        abort_if($user->legal_role !== 'LEGAL_OFFICER', 403);
        abort_if($document->status !== 'DEPARTMENT_APPROVED', 403);

        $request->validate([
            'remarks' => 'required|string|min:3',
        ]);

        $document->update(['status' => 'APPROVED']);

        LegalDocumentRemark::create([
            'legal_document_id' => $document->id,
            'user_id' => $user->id,
            'action' => 'APPROVE',
            'remarks' => $request->remarks,
        ]);

        $creator = $document->creator;

        if ($creator && $creator->email) {
            Mail::to($creator->email)
                ->queue(new LegalDocumentNotification(
                    $document,
                    "Your legal document has been fully approved by Legal."
                ));
        }

        return back()->with('success', 'Legal document approved.');
    }

    /* =====================================================
     | LEGAL RETURN → Notify DEPARTMENT HEAD
     ===================================================== */
    public function legalReturn(Request $request, LegalDocument $document)
    {
        $request->validate([
            'remarks' => 'required|string',
        ]);

        $document->update(['status' => 'RETURNED']);

        $document->remarks()->create([
            'user_id' => auth()->id(),
            'action' => 'LEGAL_RETURN',
            'remarks' => $request->remarks,
        ]);

        $departmentHeads = User::where('legal_role', 'DEPARTMENT_HEAD')
            ->where('department_id', $document->department_id)
            ->get();

        foreach ($departmentHeads as $head) {
            if ($head->email) {
                Mail::to($head->email)
                    ->queue(new LegalDocumentNotification(
                        $document,
                        "A legal document has been returned by Legal for correction."
                    ));
            }
        }

        return back()->with('success', 'Document returned to department.');
    }

    /* =====================================================
     | LEGAL REJECT → Notify CREATOR
     ===================================================== */
    public function legalReject(Request $request, LegalDocument $document)
    {
        $user = $request->user();

        abort_if($user->legal_role !== 'LEGAL_OFFICER', 403);
        abort_if($document->status !== 'DEPARTMENT_APPROVED', 403);

        $request->validate([
            'remarks' => ['required', 'string'],
        ]);

        $document->update(['status' => 'REJECTED']);

        LegalDocumentRemark::create([
            'legal_document_id' => $document->id,
            'user_id' => $user->id,
            'action' => 'REJECT',
            'remarks' => $request->remarks,
        ]);

        $creator = $document->creator;

        if ($creator && $creator->email) {
            Mail::to($creator->email)
                ->queue(new LegalDocumentNotification(
                    $document,
                    "Your legal document has been rejected by Legal."
                ));
        }

        return back()->with('success', 'Legal document rejected.');
    }

    /* =====================================================
     | RESUBMIT → Notify DEPARTMENT HEAD
     ===================================================== */
    public function resubmit(Request $request, LegalDocument $document)
    {
        $request->validate([
            'remarks' => 'required|string|min:3',
        ]);

        abort_if(auth()->id() !== $document->created_by, 403);

        DB::transaction(function () use ($request, $document) {

            $document->update(['status' => 'SUBMITTED']);

            $document->remarks()->create([
                'user_id' => auth()->id(),
                'action' => 'RESUBMIT',
                'remarks' => $request->remarks,
            ]);
        });

        $departmentHeads = User::where('legal_role', 'DEPARTMENT_HEAD')
            ->where('department_id', $document->department_id)
            ->get();

        foreach ($departmentHeads as $head) {
            if ($head->email) {
                Mail::to($head->email)
                    ->queue(new LegalDocumentNotification(
                        $document,
                        "A legal document has been resubmitted for department approval."
                    ));
            }
        }

        return redirect()
            ->route('legal-documents.show', $document)
            ->with('success', 'Document resubmitted successfully.');
    }

    private function allowRoles(array $roles)
    {
        $user = auth()->user();

        // Allow system ADMIN always
        if ($user->role === 'ADMIN') {
            return;
        }

        // Otherwise check legal role
        if (!in_array($user->legal_role, $roles)) {
            abort(403);
        }
    }
}
