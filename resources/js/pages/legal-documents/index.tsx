import AppLayout from '@/layouts/app-layout'
import { Head, Link, usePage, router } from '@inertiajs/react'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { useState, useEffect, useRef } from 'react'
import { Eye } from "lucide-react"

/* ================= TYPES ================= */

interface Department {
    id: number
    name: string
}

interface User {
    id: number
    name: string
    legal_role: string
}

interface Remark {
    id: number
    action: string
    created_at: string
    user?: User
}

interface File {
    id: number
}

interface LegalDocument {
    id: number
    reference_no: string
    title: string
    status: string
    created_at: string
    department?: Department
    creator?: User
    files?: File[]
    remarks?: Remark[]
    execution_file_path?: string | null
}

interface PaginationLinkType {
    url: string | null
    label: string
    active: boolean
}

interface PaginatedLegalDocuments {
    data: LegalDocument[]
    links: PaginationLinkType[]
}

interface Filters {
    reference_no?: string
    title?: string
    department_id?: number | string
    status?: string
}

interface Props {
    documents: PaginatedLegalDocuments
    filters?: Filters
    departments?: Department[]
}

/* ================= PAGE ================= */

export default function LegalDocumentsIndex({
    documents,
    filters,
    departments,
}: Props) {
    const page = usePage<any>()
    const authUser = page.props?.auth?.user as User

    const isDepartmentLocked =
        authUser?.legal_role === 'USER' ||
        authUser?.legal_role === 'DEPARTMENT_HEAD'
        const [search, setSearch] = useState(filters?.reference_no ?? '')
        
        const handleSearch = () => {
            router.get(
                '/legal-documents',
                {
                    reference_no: search || undefined,
                    page: 1, // always reset page when searching
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            )
        }

    /* ================= STATUS BADGE ================= */

    const statusBadge = (status: string) => {
        const base =
            'inline-flex rounded-full px-3 py-1 text-xs font-medium'

        switch (status) {
            case 'DRAFT':
                return `${base} bg-gray-100 text-gray-700`
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

    return (
        <AppLayout breadcrumbs={[{ title: 'Legal', href: '/legal-documents' }]}>
            <Head title="Legal Documents" />

            <div className="mx-auto w-full max-w-screen-xl space-y-6 px-4">

                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Legal Documents
                        </h1>
                        <p className="text-sm text-gray-600">
                            Track legal document submissions and approvals
                        </p>
                    </div>

                    {authUser?.legal_role === 'USER' && (
                        <Link
                            href="/legal-documents/create"
                            className="rounded-md bg-black px-4 py-2 text-sm text-white"
                        >
                            New Legal Document
                        </Link>
                    )}
                </div>

                {/* ================= FILTER BAR ================= */}
                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-5">

                    {/* Reference No */}
                    <input
                        type="text"
                        placeholder="Search Reference No"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                    />

                    {/* Title */}
                    <select
                        value={filters?.title ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/legal-documents',
                                {
                                    ...filters,
                                    title:
                                        e.target.value || undefined,
                                },
                                { preserveState: true, replace: true }
                            )
                        }
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All Titles</option>
                        <option value="Non-Disclosure Agreement">
                            Non-Disclosure Agreement
                        </option>
                        <option value="Service Agreement">
                            Service Agreement
                        </option>
                        <option value="Other Documents">
                            Other Documents
                        </option>
                    </select>

                    {/* Department (LEGAL OFFICER ONLY) */}
                    {!isDepartmentLocked && (
                        <select
                            value={filters?.department_id ?? ''}
                            onChange={(e) =>
                                router.get(
                                    '/legal-documents',
                                    {
                                        ...filters,
                                        department_id:
                                            e.target.value || undefined,
                                    },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    }
                                )
                            }
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">
                                All Departments
                            </option>
                            {departments?.map((dept) => (
                                <option
                                    key={dept.id}
                                    value={dept.id}
                                >
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Status */}
                    <select
                        value={filters?.status ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/legal-documents',
                                {
                                    ...filters,
                                    status:
                                        e.target.value || undefined,
                                },
                                { preserveState: true, replace: true }
                            )
                        }
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="DEPARTMENT_APPROVED">
                            Department Approved
                        </option>
                        <option value="APPROVED">Approved</option>
                        <option value="RETURNED">Returned</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    {/* Search */}
                    <button
                        onClick={handleSearch}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
                    >
                        Search
                    </button>

                    {/* Clear */}
                    <button
                        onClick={() =>
                            router.get(
                                '/legal-documents',
                                {},
                                { replace: true }
                            )
                        }
                        className="rounded-md border border-emerald-600 text-emerald-600 px-3 py-2 text-sm hover:bg-emerald-50"
                    >
                        Clear
                    </button>
                </div>

                {/* ================= TABLE ================= */}
                <div className="rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Reference
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium">
                                        Files
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium">
                                        Last Action
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium">
                                        Execution
                                    </th>
                                    <th className="px-6 py-3 text-right text-sm font-medium">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {documents.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-6 text-center text-sm text-gray-500"
                                        >
                                            No legal documents found
                                        </td>
                                    </tr>
                                )}

                                {documents.data.map((doc) => {
                                    const lastRemark =
                                        doc.remarks?.[0] ?? null

                                    return (
                                        <tr key={doc.id}>
                                            <td className="px-6 py-4 font-medium">
                                                {doc.reference_no}
                                            </td>

                                            <td className="px-6 py-4 font-medium">
                                                {doc.title}
                                            </td>

                                            <td className="px-6 py-4 text-sm">
                                                {doc.department?.name ?? '—'}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={statusBadge(
                                                        doc.status
                                                    )}
                                                >
                                                    {doc.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center text-sm">
                                                {doc.files?.length ?? 0}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {lastRemark
                                                    ? `${lastRemark.action} by ${lastRemark.user?.name ?? ''}`
                                                    : '—'}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                {doc.execution_file_path ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        Uploaded
                                                    </span>
                                                ) : doc.status === 'APPROVED' ? (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                        Pending
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                                                        —
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/legal-documents/${doc.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-600 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 transition"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
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
