import AppLayout from '@/layouts/app-layout'
import { Head, Link, router, usePage } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types'
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

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'All Contracts', href: '/contracts/all' },
]

/* ================= TYPES ================= */

interface Branch {
    id: number
    name: string
}

interface Contract {
    id: number
    transaction_no: string
    contract_type: string
    status: string
    execution_file_path?: string | null
    created_at: string
    uploader: {
        name: string
        branch?: Branch | null
    }
}

interface Props {
    contracts: {
        data: Contract[]
        links: any[]
    }
    filters: {
        transaction_no?: string
        status?: string
        execution?: string
        branch_id?: string
    }
    branches: Branch[]
}

/* ================= PAGE ================= */

export default function All({ contracts, filters, branches }: Props) {
    const { auth } = usePage().props as any
    const isBranch = auth?.user?.role === 'BRANCH'
    const [search, setSearch] = useState(filters?.transaction_no ?? '')

    const handleSearch = () => {
        router.get(
            '/contracts/all',
            {
                transaction_no: search || undefined,
                page: 1, // always reset page when searching
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Contracts" />

            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-6">

                {/* ================= HEADER ================= */}
                <div>
                    <h1 className="text-2xl font-semibold">All Contracts</h1>
                    <p className="text-sm text-gray-600">
                        View all contracts across all statuses
                    </p>
                </div>

                {/* ================= FILTER BAR ================= */}
                <div
                    className={`grid gap-3 rounded-lg border bg-white p-4 shadow-sm
                        ${isBranch ? 'md:grid-cols-3' : 'md:grid-cols-4'}
                    `}
                >
                    {/* Transaction No */}
                    <input
                        type="text"
                        placeholder="Search Transaction No"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                    />

                    {/* Branch (hidden for BRANCH role) */}
                    {!isBranch && (
                        <select
                            value={filters.branch_id ?? ''}
                            onChange={(e) =>
                                router.get(
                                    '/contracts/all',
                                    {
                                        ...filters,
                                        branch_id: e.target.value || undefined,
                                    },
                                    { preserveState: true, replace: true }
                                )
                            }
                            className="rounded-md border px-3 py-2 text-sm"
                        >
                            <option value="">All Branches</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Contract Status */}
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/contracts/all',
                                {
                                    ...filters,
                                    status: e.target.value || undefined,
                                },
                                { preserveState: true, replace: true }
                            )
                        }
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="INITIAL_VERIFICATION">Initial Verification</option>
                        <option value="FINAL_VERIFICATION">Final Verification</option>
                        <option value="INITIAL_APPROVAL">Initial Approval</option>
                        <option value="FINAL_APPROVAL">Final Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="RETURNED">Returned</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    {/* Execution Status */}
                    <select
                        value={filters.execution ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/contracts/all',
                                {
                                    ...filters,
                                    execution: e.target.value || undefined,
                                },
                                { preserveState: true, replace: true }
                            )
                        }
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All Execution</option>
                        <option value="uploaded">Execution Uploaded</option>
                        <option value="not_uploaded">Execution Not Uploaded</option>
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
                            router.get('/contracts/all', {}, { replace: true })
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
                                <tr className="text-left text-gray-600">
                                    <th className="px-4 py-3">Transaction</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Contract Status</th>
                                    <th className="px-4 py-3">Execution</th>
                                    <th className="px-4 py-3">Uploaded By</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">
                                {contracts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                            No contracts found.
                                        </td>
                                    </tr>
                                ) : (
                                    contracts.data.map((contract) => (
                                        <tr key={contract.id}>
                                            <td className="px-4 py-3 font-medium">
                                                {contract.transaction_no}
                                            </td>

                                            <td className="px-4 py-3">
                                                {contract.contract_type}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    {contract.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                {contract.execution_file_path ? (
                                                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                        UPLOADED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                                        NOT UPLOADED
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {contract.uploader.name}
                                                {contract.uploader.branch && (
                                                    <div className="text-xs text-gray-500">
                                                        {contract.uploader.branch.name}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-gray-600">
                                                {new Date(contract.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/contracts/${contract.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md border border-emerald-600 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 transition"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ================= PAGINATION ================= */}
                <div className="flex justify-center pt-4">
                    <Pagination>
                        <PaginationContent>
                            {contracts.links.map((link, index) => (
                                <PaginationItem key={index}>
                                    <PaginationLink
                                        href={link.url ?? '#'}
                                        isActive={link.active}
                                        className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                    </Pagination>
                </div>

            </div>
        </AppLayout>
    )
}
