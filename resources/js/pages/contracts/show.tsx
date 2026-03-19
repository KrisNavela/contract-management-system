import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import ContractApprovalActions from '@/components/ContractApprovalActions';
import ApprovalTimeline from '@/components/ApprovalTimeline';
import { useEffect, useState } from 'react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner'

/* ================= TYPES ================= */

interface ContractFile {
    id: number;
    file_path: string;
    file_type: string;
}

interface Remark {
    id: number;
    action: string;
    remarks: string | null;
    created_at: string;
    user: {
        name: string;
        role: string;
    };
}

interface Contract {
    id: number;
    transaction_no: string;
    status: string;
    contract_type: string;
    created_at: string;
    execution_file_path?: string | null;
    execution_uploaded_at?: string | null;
    files: ContractFile[];
    remarks: Remark[];
}

interface Props {
    contract: Contract;
}

/* ================= PAGE ================= */

export default function Show({ contract }: Props) {
    const { auth, flash } = usePage().props as any;
    const [showFlash, setShowFlash] = useState(true);

    const BREADCRUMB_BY_ROLE: Record<
        string,
        { title: string; href: string }
    > = {
        REVIEWER: {
            title: 'Reviewer Queue',
            href: '/queue/reviewer',
        },
        INITIAL_VERIFIER: {
            title: 'Initial Verifier Queue',
            href: '/queue/initial-verifier',
        },
        FINAL_VERIFIER: {
            title: 'Final Verifier Queue',
            href: '/queue/final-verifier',
        },
        INITIAL_APPROVER: {
            title: 'Initial Approver Queue',
            href: '/queue/initial-approver',
        },
        FINAL_APPROVER: {
            title: 'Final Approver Queue',
            href: '/queue/final-approver',
        },
        BRANCH: {
            title: 'Contracts',
            href: '/contracts',
        },
    };
    
    const roleBreadcrumb =
        BREADCRUMB_BY_ROLE[auth?.user?.role] ?? {
            title: 'Dashboard',
            href: '/dashboard',
        };

    const breadcrumbs: BreadcrumbItem[] = [
        roleBreadcrumb,
        {
            title: contract.transaction_no,
            href: `/contracts/${contract.id}`,
        },
];

    const executionForm = useForm<{ execution_file: File | null }>({
        execution_file: null,
    });

    /* ================= APPROVAL PERMISSION ================= */
    const ROLE_CAN_APPROVE: Record<string, string> = {
        REVIEWER: 'SUBMITTED',
        INITIAL_VERIFIER: 'REVIEWED',
        FINAL_VERIFIER: 'INITIAL_VERIFICATION',
        INITIAL_APPROVER: 'FINAL_VERIFICATION',
        FINAL_APPROVER: 'INITIAL_APPROVAL',
    };

    const canApprove =
        !!auth?.user?.role &&
        ROLE_CAN_APPROVE[auth.user.role] === contract.status;

    /**
     * ✅ NEW: unified action permission
     * - Branch → when RETURNED
     * - Approvers → when status matches their stage
     */
    const canAct =
        (contract.status === 'RETURNED' &&
            auth?.user?.role === 'BRANCH') ||
        canApprove;

    useEffect(() => {
        if (flash?.success) {
            toast.success('Transaction Successful', {
                description: flash.success,
                id: 'transaction-success',
            })
        }
    }, [flash])

    const BACK_LINK_BY_ROLE: Record<string, string> = {
        REVIEWER: '/queue/reviewer',
        INITIAL_VERIFIER: '/queue/initial-verifier',
        FINAL_VERIFIER: '/queue/final-verifier',
        INITIAL_APPROVER: '/queue/initial-approver',
        FINAL_APPROVER: '/queue/final-approver',
        BRANCH: '/contracts',
    };

    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Contract ${contract.transaction_no}`} />

            {/* ✅ WIDE CONTAINER */}
            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-8">

                {/* ================= FLASH ================= 
                {flash?.success && showFlash && (
                    <Alert className="border-green-200 bg-green-50 text-green-900">
                        <AlertTitle className="flex items-center justify-between">
                            Success
                            <button
                                onClick={() => setShowFlash(false)}
                                className="text-green-700 hover:text-green-900"
                            >
                                ✕
                            </button>
                        </AlertTitle>
                        <AlertDescription>
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )} */}

                {/* ================= HEADER ================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Contract Details
                        </h1>
                        <p className="text-sm text-gray-600">
                            Review contract information and take action
                        </p>
                    </div>

                    <Link
                        href={
                            BACK_LINK_BY_ROLE[auth?.user?.role] ?? '/dashboard'
                        }
                        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Back
                    </Link>

                </div>

                <ApprovalTimeline
                    currentStatus={contract.status}
                    executionUploaded={!!contract.execution_file_path}
                />

                {/* ================= MAIN GRID ================= */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ================= SUMMARY ================= */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Transaction Number
                                </dt>
                                <dd className="text-lg font-semibold">
                                    {contract.transaction_no}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Status
                                </dt>
                                <dd>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold
                                            ${
                                                contract.status === 'APPROVED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : contract.status === 'REJECTED'
                                                    ? 'bg-red-100 text-red-700'
                                                    : contract.status === 'RETURNED'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {contract.status.replace('_', ' ')}
                                    </span>
                                </dd>
                            </div>


                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Contract Type
                                </dt>
                                <dd className="text-sm font-medium">
                                    {contract.contract_type}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Date Uploaded
                                </dt>
                                <dd className="text-sm">
                                    {new Date(
                                        contract.created_at
                                    ).toLocaleString()}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* ================= APPROVAL ACTION ================= */}
                    {canAct ? (
                        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
                            <h2 className="mb-3 text-sm font-semibold">
                                {auth?.user?.role === 'BRANCH'
                                    ? 'Resubmit Contract'
                                    : 'Approval Action'}
                            </h2>

                            <ContractApprovalActions contract={contract} />
                        </div>
                    ) : (
                        <div className="rounded-xl border bg-gray-50 p-6 text-sm text-gray-500 lg:col-span-2">
                            Approval details will appear here when this contract
                            reaches your stage.
                        </div>
                    )}
                </div>

                {/* ================= REMARKS ================= */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            Remarks & History
                        </h2>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    View Remarks
                                </Button>
                            </SheetTrigger>

                            <SheetContent side="right" className="w-[520px] p-0">
                                {/* Sticky Header */}
                                <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white px-6 py-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Remarks & Approval History
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Complete audit trail of actions taken on this contract
                                        </p>
                                    </div>

                                    {/* Close Button */}
                                    <SheetClose asChild>
                                        <button
                                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                            aria-label="Close"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </SheetClose>
                                </div>

                                <ScrollArea className="h-[calc(100vh-120px)] px-6 py-6">
                                    {contract.remarks.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                            No remarks or actions recorded yet.
                                        </div>
                                    ) : (
                                        <ol className="relative space-y-8 border-l border-gray-200 pl-6">
                                            {contract.remarks.map((r) => {
                                                const actionStyles =
                                                    r.action === 'APPROVE'
                                                        ? 'border-green-500 bg-green-100 text-green-700'
                                                        : r.action === 'REJECT'
                                                        ? 'border-red-500 bg-red-100 text-red-700'
                                                        : r.action === 'RETURN'
                                                        ? 'border-yellow-500 bg-yellow-100 text-yellow-700'
                                                        : 'border-blue-500 bg-blue-100 text-blue-700'

                                                return (
                                                    <li key={r.id} className="relative">
                                                        {/* Timeline Dot */}
                                                        <span
                                                            className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full border ${actionStyles}`}
                                                        />

                                                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {r.user.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {r.user.role}
                                                                    </p>
                                                                </div>

                                                                {/* Action Badge */}
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${actionStyles}`}
                                                                >
                                                                    {r.action.replace('_', ' ')}
                                                                </span>
                                                            </div>

                                                            {/* Timestamp */}
                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {new Date(r.created_at).toLocaleString()}
                                                            </p>

                                                            {/* Remarks */}
                                                            {r.remarks && (
                                                                <div className="mt-4 border-l-4 border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                                                    {r.remarks}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ol>
                                    )}

                                    {/* Bottom Close Button */}
                                    <div className="mt-8 flex justify-end">
                                        <SheetClose asChild>
                                            <Button variant="outline">
                                                Close
                                            </Button>
                                        </SheetClose>
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>



                {/* ================= FILES ================= */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Uploaded Files
                    </h2>

                    <ul className="divide-y">

                        {/* 📎 Regular contract files */}
                        {contract.files.map((file) => (
                            <li
                                key={`file-${file.id}`}
                                className="flex items-center justify-between py-3"
                            >
                                <span className="text-sm">
                                    {file.file_path.split('/').pop()}
                                </span>

                                <a
                                    href={`/storage/${file.file_path}`}
                                    target="_blank"
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                    Download
                                </a>
                            </li>
                        ))}

                        {/* 🈳 Empty state */}
                        {contract.files.length === 0 &&
                            !contract.execution_file_path && (
                                <li className="py-3 text-sm text-gray-500">
                                    No files uploaded.
                                </li>
                            )}
                    </ul>
                </div>


                {/* ================= EXECUTION DISPLAY ================= */}
                {contract.execution_file_path && (
                    <div className="rounded-xl border bg-green-50 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-green-900">
                            Execution Document
                        </h2>

                        {contract.execution_uploaded_at && (
                            <p className="mb-3 text-sm text-green-700">
                                Uploaded on{' '}
                                {new Date(
                                    contract.execution_uploaded_at
                                ).toLocaleString()}
                            </p>
                        )}

                        <a
                            href={`/storage/${contract.execution_file_path}`}
                            target="_blank"
                            className="text-sm font-medium text-green-700 underline"
                        >
                            View Execution Document
                        </a>
                    </div>
                )}

                {/* ================= EXECUTION UPLOAD ================= */}
                {auth?.user?.role === 'BRANCH' &&
                    contract.status === 'APPROVED' &&
                    !contract.execution_file_path && (
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-2 text-lg font-semibold">
                                Upload Execution Document
                            </h2>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    executionForm.post(
                                        `/contracts/${contract.id}/execution-document`
                                    );
                                }}
                                className="space-y-4"
                            >
                                <input
                                    type="file"
                                    required
                                    onChange={(e) =>
                                        executionForm.setData(
                                            'execution_file',
                                            e.target.files?.[0] ?? null
                                        )
                                    }
                                    className="block w-full rounded-md border px-3 py-2 text-sm"
                                />

                                {executionForm.errors.execution_file && (
                                    <p className="text-sm text-red-600">
                                        {executionForm.errors.execution_file}
                                    </p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={executionForm.processing}
                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {executionForm.processing
                                            ? 'Uploading…'
                                            : 'Upload Execution Document'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                   
            </div>
        </AppLayout>
    );
}
