import AppLayout from '@/layouts/app-layout'
import { Head, Link, router, usePage, useForm } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types'
import { useEffect } from 'react'
import { toast } from 'sonner'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

/* ================= TYPES ================= */

interface Department {
    id: number
    name: string
}

interface User {
    id: number
    name: string
    legal_role?: string
}

interface Remark {
    id: number
    action: string
    remarks?: string | null
    created_at: string
    user?: User
}

interface DocumentFile {
    id: number
    file_path: string
}

interface LegalDocument {
    id: number
    reference_no: string
    title: string
    description?: string | null
    status: string
    created_at: string
    department?: Department | null
    creator?: User | null
    files?: DocumentFile[]
    remarks?: Remark[]
    execution_file_path?: string | null
    execution_uploaded_at?: string | null
}

interface Props {
    document: LegalDocument
}

/* ================= STATUS BADGE ================= */

const statusBadge = (status: string) => {
    const base = 'inline-flex rounded-full px-3 py-1 text-xs font-semibold'

    switch (status) {
        case 'SUBMITTED':
            return `${base} bg-blue-100 text-blue-700`
        case 'DEPARTMENT_APPROVED':
            return `${base} bg-yellow-100 text-yellow-700`
        case 'APPROVED':
            return `${base} bg-green-100 text-green-700`
        case 'REJECTED':
            return `${base} bg-red-100 text-red-700`
        case 'RETURNED':
            return `${base} bg-orange-100 text-orange-700`
        default:
            return `${base} bg-gray-100 text-gray-700`
    }
}

/* ================= REMARKS SHEET ================= */

function RemarksSheet({ remarks = [] }: { remarks: Remark[] }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    View Remarks & History
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[520px]">
                <SheetHeader className="border-b pb-3">
                    <SheetTitle>
                        Remarks & Approval History
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="mt-4 h-[calc(100vh-140px)] pr-4">
                    {remarks.length ? (
                        <ol className="space-y-4">
                            {remarks.map((r) => (
                                <li
                                    key={r.id}
                                    className="rounded-lg border bg-white p-4 shadow-sm"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {r.user?.name ?? 'System'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(r.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                                            {r.action}
                                        </span>
                                    </div>

                                    {r.remarks && (
                                        <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm">
                                            {r.remarks}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-sm text-gray-500">
                            No remarks recorded.
                        </p>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}

/* ================= PAGE ================= */

export default function Show({ document }: Props) {
    const { auth, flash } = usePage<any>().props
    const user = auth?.user

    /* ================= TOAST ================= */
    useEffect(() => {
        if (!flash) return

        if (flash.success) {
            toast.success(flash.success, { id: 'success-toast' })
        }

        if (flash.error) {
            toast.error(flash.error, { id: 'error-toast' })
        }
    }, [flash?.success, flash?.error])

    /* ================= FORM ================= */
    const { data, setData, post, processing, errors } = useForm({
        remarks: '',
    })

    const executionForm = useForm<{
        execution_file: File | null
    }>({
        execution_file: null,
    })

    /* ================= ROLE LOGIC ================= */

    const isDepartmentHead =
        user?.legal_role === 'DEPARTMENT_HEAD' &&
        document.status === 'SUBMITTED'

    const isLegalOfficer =
        user?.legal_role === 'LEGAL_OFFICER' &&
        document.status === 'DEPARTMENT_APPROVED'

    const isReturnedUser =
        user?.legal_role === 'USER' &&
        document.status === 'RETURNED' &&
        document.creator?.id === user.id

    const canUploadExecution =
        document.status === 'APPROVED' &&
        !document.execution_file_path &&
        document.creator?.id === user?.id


    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Legal Documents', href: '/legal-documents' },
        { title: document.reference_no, href: '#' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Legal Document ${document.reference_no}`} />

            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-6">

                {/* HEADER */}
                <div className="flex justify-between">
                    <Link
                        href="/legal-documents"
                        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Back
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* SUMMARY */}
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Type
                                </dt>
                                <dd className="text-sm font-medium">
                                    {document.title}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Reference No
                                </dt>
                                <dd className="text-sm">
                                    {document.reference_no}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Status
                                </dt>
                                <dd>
                                    <span className={statusBadge(document.status)}>
                                        {document.status}
                                    </span>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs uppercase text-gray-500">
                                    Department
                                </dt>
                                <dd className="text-sm">
                                    {document.department?.name ?? '—'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* DESCRIPTION */}
                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-2 text-sm font-semibold">
                                Description
                            </h2>

                            {document.description ? (
                                <p className="whitespace-pre-line text-sm">
                                    {document.description}
                                </p>
                            ) : (
                                <p className="text-sm italic text-gray-400">
                                    No description provided.
                                </p>
                            )}
                        </div>

                        {/* USER RESUBMIT */}
                        {isReturnedUser && (
                            <div className="rounded-xl border bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-sm font-semibold">
                                    Action Required
                                </h2>

                                <textarea
                                    value={data.remarks}
                                    onChange={(e) =>
                                        setData('remarks', e.target.value)
                                    }
                                    rows={4}
                                    required
                                    placeholder="Explain the changes you made…"
                                    className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
                                />

                                {errors.remarks && (
                                    <p className="mb-2 text-sm text-red-600">
                                        {errors.remarks}
                                    </p>
                                )}

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(
                                                `/legal-documents/${document.id}/edit`
                                            )
                                        }
                                    >
                                        Edit Document
                                    </Button>

                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            post(
                                                `/legal-documents/${document.id}/resubmit`
                                            )
                                        }
                                    >
                                        Resubmit
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* APPROVAL ACTIONS */}
                        {(isDepartmentHead || isLegalOfficer) && (
                            <div className="rounded-xl border bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-sm font-semibold">
                                    Approval Action
                                </h2>

                                <textarea
                                    value={data.remarks}
                                    onChange={(e) =>
                                        setData('remarks', e.target.value)
                                    }
                                    rows={4}
                                    required
                                    placeholder="Remarks (required)"
                                    className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
                                />

                                {errors.remarks && (
                                    <p className="mb-2 text-sm text-red-600">
                                        {errors.remarks}
                                    </p>
                                )}

                                <div className="flex justify-end gap-3">
                                    {isDepartmentHead && (
                                        <>
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                                onClick={() =>
                                                    post(
                                                        `/legal-documents/${document.id}/department-return`
                                                    )
                                                }
                                            >
                                                Return
                                            </Button>

                                            <Button
                                                disabled={processing}
                                                onClick={() =>
                                                    post(
                                                        `/legal-documents/${document.id}/department-approve`
                                                    )
                                                }
                                            >
                                                Approve & Send to Legal
                                            </Button>
                                        </>
                                    )}

                                    {isLegalOfficer && (
                                        <>
                                            <Button
                                                variant="outline"
                                                disabled={processing}
                                                onClick={() =>
                                                    post(
                                                        `/legal-documents/${document.id}/legal-return`
                                                    )
                                                }
                                            >
                                                Return
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                disabled={processing}
                                                onClick={() =>
                                                    post(
                                                        `/legal-documents/${document.id}/legal-reject`
                                                    )
                                                }
                                            >
                                                Reject
                                            </Button>

                                            <Button
                                                disabled={processing}
                                                onClick={() =>
                                                    post(
                                                        `/legal-documents/${document.id}/legal-approve`
                                                    )
                                                }
                                            >
                                                Final Approve
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FILES */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Attached Files
                    </h2>

                    <ul className="divide-y">
                        {document.files?.length ? (
                            document.files.map((file) => (
                                <li
                                    key={file.id}
                                    className="flex items-center justify-between py-3"
                                >
                                    <span className="text-sm truncate">
                                        {file.file_path.split('/').pop()}
                                    </span>

                                    <a
                                        href={`/storage/${file.file_path}`}
                                        target="_blank"
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        View
                                    </a>
                                </li>
                            ))
                        ) : (
                            <li className="py-3 text-sm text-gray-500">
                                No files uploaded.
                            </li>
                        )}
                    </ul>
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
                                            Complete audit trail of actions taken on this legal document
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
                                    {!document.remarks || document.remarks.length === 0 ? (
                                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                                            No remarks or actions recorded yet.
                                        </div>
                                    ) : (
                                        <ol className="relative space-y-8 border-l border-gray-200 pl-6">
                                            {document.remarks.map((r) => {
                                                const actionStyle =
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
                                                            className={`absolute -left-[7px] top-2 h-3 w-3 rounded-full border ${actionStyle}`}
                                                        />

                                                        <div className="rounded-lg border bg-white p-4 shadow-sm">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-900">
                                                                        {r.user?.name ?? 'System'}
                                                                    </p>
                                                                    {r.user?.legal_role && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {r.user.legal_role}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Action Badge */}
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${actionStyle}`}
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

                                    {/* Bottom Close Button (optional but UX-friendly) */}
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

                {/* ================= EXECUTION DOCUMENT ================= */}
                {document.execution_file_path && (
                    <div className="rounded-xl border bg-green-50 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-green-900">
                            Execution Document
                        </h2>

                        {document.execution_uploaded_at && (
                            <p className="mb-3 text-sm text-green-700">
                                Uploaded on{' '}
                                {new Date(
                                    document.execution_uploaded_at
                                ).toLocaleString()}
                            </p>
                        )}

                        <a
                            href={`/storage/${document.execution_file_path}`}
                            target="_blank"
                        >
                            View Execution Document
                        </a>
                    </div>
                )}

                {/* ================= EXECUTION UPLOAD ================= */}
                {canUploadExecution && (
                    <div className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-2 text-lg font-semibold">
                            Upload Execution Document
                        </h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                executionForm.post(
                                    `/legal-documents/${document.id}/execution`
                                )
                            }}
                            className="space-y-4"
                        >
                            <input
                                type="file"
                                required
                                onChange={(e) => {
                                    const target = e.currentTarget
                                    executionForm.setData(
                                        'execution_file',
                                        target.files ? target.files[0] : null
                                    )
                                }}
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
    )
}
