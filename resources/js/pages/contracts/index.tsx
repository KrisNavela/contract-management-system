import AppLayout from '@/layouts/app-layout'
import { Head, Link, router, usePage } from '@inertiajs/react'
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
import { useState, useEffect } from 'react'

/* ================= TYPES ================= */

type ContractStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'REVIEWED'
    | 'INITIAL_VERIFICATION'
    | 'FINAL_VERIFICATION'
    | 'INITIAL_APPROVAL'
    | 'FINAL_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'RETURNED'

interface Branch {
    id: number
    name: string
    code: string
}

interface User {
    id: number
    name: string
    branch?: Branch | null
}

interface Remark {
    id: number
    action: string
    created_at: string
    user?: {
        name: string
    }
}

interface Contract {
    id: number
    transaction_no: string
    contract_type: 'NEW' | 'RENEWAL'
    status: ContractStatus
    execution_file_path?: string | null
    created_at: string
    uploader: User

    last_action?: {
        action: string
        user?: string
    } | null
}

interface PaginationLinkType {
    url: string | null
    label: string
    active: boolean
}

interface PaginatedContracts {
    data: Contract[]
    links: PaginationLinkType[]
}

interface Props {
    contracts: PaginatedContracts
    filters: {
        transaction_no?: string
        status?: string
        execution?: string
        branch_id?: string
    }
    branches: {
        id: number
        name: string
    }[]
}

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contracts', href: '/contracts' },
]

/* ================= STATUS COLORS ================= */

const statusColor: Record<ContractStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    REVIEWED: 'bg-indigo-100 text-indigo-700',
    INITIAL_VERIFICATION: 'bg-indigo-100 text-indigo-700',
    FINAL_VERIFICATION: 'bg-purple-100 text-purple-700',
    INITIAL_APPROVAL: 'bg-yellow-100 text-yellow-700',
    FINAL_APPROVAL: 'bg-orange-100 text-orange-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    RETURNED: 'bg-gray-200 text-gray-700',
}

/* ================= PAGE ================= */

export default function Index({
    contracts,
    branches,
    filters,
}: Props) {
    const page = usePage<any>()
    const authUser = page.props?.auth?.user
    const isBranch = authUser?.role === 'BRANCH'
    const [search, setSearch] = useState(filters?.transaction_no ?? '')

    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                '/contracts',
                {
                    ...filters,
                    transaction_no: search || undefined,
                },
                {
                    preserveState: true,
                    replace: true,
                }
            )
        }, 500) // 500ms debounce

        return () => clearTimeout(delay)
    }, [search])

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contracts" />

            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-6">

                {/* ================= HEADER ================= */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Contracts
                        </h1>
                        <p className="text-sm text-gray-600">
                            List of uploaded contracts for review and approval
                        </p>
                    </div>

                    {isBranch && (
                        <Link
                            href="/contracts/create"
                            className="inline-flex items-center rounded-md 
                                bg-blue-600 px-4 py-2 text-sm font-medium text-white 
                                hover:bg-blue-700"
                        >
                            Upload Contract
                        </Link>
                    )}
                </div>

                {/* ================= FILTER BAR ================= */}
                <div className="grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-5">

                    {/* Transaction No */}
                    <input
                        type="text"
                        placeholder="Search Transaction No"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                    />

                    {/* Status */}
                    <select
                        value={filters?.status ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/contracts',
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
                        <option value="DRAFT">Draft</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="REVIEWED">Reviewed</option>
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
                        value={filters?.execution ?? ''}
                        onChange={(e) =>
                            router.get(
                                '/contracts',
                                {
                                    ...filters,
                                    execution: e.target.value || undefined,
                                },
                                { preserveState: true, replace: true }
                            )
                        }
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">Execution</option>
                        <option value="uploaded">Uploaded</option>
                        <option value="pending">Pending</option>
                    </select>

                    {/* Branch (Admin Only) */}
                    {authUser?.role === 'ADMIN' && (
                        <select
                            value={filters?.branch_id ?? ''}
                            onChange={(e) =>
                                router.get(
                                    '/contracts',
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
                            {branches?.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Clear Button */}
                    <button
                        onClick={() =>
                            router.get('/contracts', {}, { replace: true })
                        }
                        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Clear
                    </button>
                </div>

                {/* ================= TABLE ================= */}
                <div className="relative w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Transaction No</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Execution</TableHead>
                                <TableHead>Last Action</TableHead>
                                <TableHead>Date Uploaded</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {contracts.data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="py-10 text-center text-sm text-gray-500"
                                    >
                                        No contracts found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {contracts.data.map((contract) => {

                                return (
                                    <TableRow
                                        key={contract.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <TableCell className="font-medium">
                                            {contract.transaction_no}
                                        </TableCell>

                                        <TableCell>
                                            {contract.uploader?.branch ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            contract.uploader
                                                                .branch.name
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            contract.uploader
                                                                .branch.code
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="italic text-gray-400">
                                                    No branch
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    contract.contract_type ===
                                                    'NEW'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}
                                            >
                                                {contract.contract_type}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusColor[contract.status]}`}
                                            >
                                                {contract.status}
                                            </span>
                                        </TableCell>

                                        {/* ================= EXECUTION ================= */}
                                        <TableCell>
                                            {contract.execution_file_path ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    Uploaded
                                                </span>
                                            ) : contract.status ===
                                              'APPROVED' ? (
                                                <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* ================= LAST ACTION ================= */}
                                        <TableCell className="text-sm text-gray-600">
                                            {contract.last_action ? (
                                                <>
                                                    {contract.last_action.action
                                                        .replaceAll('_', ' ')
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, l => l.toUpperCase())}
                                                    {contract.last_action.user && (
                                                        <> by {contract.last_action.user}</>
                                                    )}
                                                </>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>


                                        <TableCell className="text-sm text-gray-600">
                                            {new Date(
                                                contract.created_at
                                            ).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Link
                                                href={`/contracts/${contract.id}`}
                                                className="text-sm font-medium text-blue-600 hover:underline"
                                            >
                                                View
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* ================= PAGINATION ================= */}
                <div className="flex justify-center pt-4">
                    <Pagination>
                        <PaginationContent>
                            {contracts.links.map((link, index) => {
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
