import AppLayout from '@/layouts/app-layout'
import { Head, Link } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types'

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from '@/components/ui/pagination'
import { Eye } from "lucide-react"

/* ================= TYPES ================= */

interface Department {
    id: number
    name: string
}

interface User {
    id: number
    name: string
}

interface LegalDocument {
    id: number
    reference_no: string
    title: string
    status: string
    created_at: string
    department?: Department
    creator?: User
}

interface PaginationLinkType {
    url: string | null
    label: string
    active: boolean
}

interface PaginatedDocuments {
    data: LegalDocument[]
    links: PaginationLinkType[]
}

interface Props {
    documents: PaginatedDocuments
}

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Legal', href: '/legal-documents' },
    { title: 'Department Approvals', href: '/legal/department-approvals' },
]

/* ================= STATUS BADGE ================= */

const statusColor = (status: string) => {
    switch (status) {
        case 'SUBMITTED':
            return 'bg-blue-100 text-blue-700'
        case 'DEPARTMENT_APPROVED':
            return 'bg-yellow-100 text-yellow-700'
        case 'REJECTED':
            return 'bg-red-100 text-red-700'
        case 'RETURNED':
            return 'bg-orange-100 text-orange-700'
        default:
            return 'bg-gray-100 text-gray-700'
    }
}

/* ================= PAGE ================= */

export default function DepartmentIndex({ documents }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Approvals" />

            {/* SAME WIDTH AS CONTRACT QUEUES */}
            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-6">

                {/* ================= HEADER ================= */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Department Approvals
                    </h1>
                    <p className="text-sm text-gray-600">
                        Review and approve legal documents submitted by your department
                    </p>
                </div>

                {/* ================= TABLE ================= */}
                <div className="relative w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-gray-50">
                            <TableRow>
                                <TableHead>Reference No</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Submitted By</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Submitted</TableHead>
                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {documents.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-10 text-center text-sm text-gray-500"
                                    >
                                        No documents pending department approval.
                                    </TableCell>
                                </TableRow>
                            )}

                            {documents.data.map((doc) => (
                                <TableRow
                                    key={doc.id}
                                    className="hover:bg-gray-50"
                                >
                                    <TableCell className="font-medium">
                                        {doc.reference_no}
                                    </TableCell>

                                    <TableCell className="font-medium">
                                        {doc.title}
                                    </TableCell>

                                    <TableCell>
                                        {doc.department?.name ?? (
                                            <span className="italic text-gray-400">
                                                —
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {doc.creator?.name ?? '—'}
                                    </TableCell>

                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColor(
                                                doc.status
                                            )}`}
                                        >
                                            {doc.status}
                                        </span>
                                    </TableCell>

                                    <TableCell className="text-sm text-gray-600">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Link
                                            href={`/legal-documents/${doc.id}`}
                                            className="inline-flex items-center gap-1 rounded-md border border-emerald-600 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 transition"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* ================= PAGINATION ================= */}
                <div className="flex justify-center pt-4">
                    <Pagination>
                        <PaginationContent>
                            {documents.links.map((link, index) => {
                                if (link.label.includes('Previous')) {
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationPrevious
                                                href={link.url ?? '#'}
                                                className={
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                }
                                            />
                                        </PaginationItem>
                                    )
                                }

                                if (link.label.includes('Next')) {
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationNext
                                                href={link.url ?? '#'}
                                                className={
                                                    !link.url
                                                        ? 'pointer-events-none opacity-50'
                                                        : ''
                                                }
                                            />
                                        </PaginationItem>
                                    )
                                }

                                return (
                                    <PaginationItem key={index}>
                                        <PaginationLink
                                            href={link.url ?? '#'}
                                            isActive={link.active}
                                            className={
                                                !link.url
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        >
                                            {link.label}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}
                        </PaginationContent>
                    </Pagination>
                </div>

            </div>
        </AppLayout>
    )
}
