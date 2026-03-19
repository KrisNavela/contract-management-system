import { ColumnDef } from '@tanstack/react-table'
import { Link } from '@inertiajs/react'

export type Contract = {
    id: number
    transaction_no: string
    contract_type: 'NEW' | 'RENEWAL'
    status: string
    execution_file_path?: string | null
    created_at: string
    uploader: {
        name: string
        branch?: {
            name: string
        }
    }
}

export const columns: ColumnDef<Contract>[] = [
    {
        accessorKey: 'transaction_no',
        header: 'Transaction',
        cell: ({ row }) => (
            <span className="font-medium">
                {row.original.transaction_no}
            </span>
        ),
    },
    {
        accessorKey: 'contract_type',
        header: 'Type',
        cell: ({ row }) => (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {row.original.contract_type}
            </span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {row.original.status.replace(/_/g, ' ')}
            </span>
        ),
    },
    {
        id: 'execution',
        header: 'Execution',
        cell: ({ row }) =>
            row.original.execution_file_path ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    UPLOADED
                </span>
            ) : (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    NOT UPLOADED
                </span>
            ),
    },
    {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) =>
            new Date(row.original.created_at).toLocaleDateString(),
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <Link
                href={`/contracts/${row.original.id}`}
                className="text-blue-600 hover:underline"
            >
                View
            </Link>
        ),
    },
]
