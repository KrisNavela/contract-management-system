import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { Eye } from "lucide-react"

/* ================= TYPES ================= */

type ContractStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'INITIAL_VERIFICATION'
    | 'FINAL_VERIFICATION'
    | 'INITIAL_APPROVAL'
    | 'FINAL_APPROVAL'
    | 'APPROVED'
    | 'REJECTED'
    | 'RETURNED';

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface User {
    name: string;
    branch?: Branch | null;
}

interface Contract {
    id: number;
    transaction_no: string;
    contract_type: 'NEW' | 'RENEWAL';
    status: ContractStatus;
    created_at: string;
    uploader: User;
}

interface Props {
    contracts: Contract[];
}

/* ================= STATUS COLORS ================= */

const statusColor: Record<ContractStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    INITIAL_VERIFICATION: 'bg-indigo-100 text-indigo-700',
    FINAL_VERIFICATION: 'bg-purple-100 text-purple-700',
    INITIAL_APPROVAL: 'bg-yellow-100 text-yellow-700',
    FINAL_APPROVAL: 'bg-orange-100 text-orange-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    RETURNED: 'bg-gray-200 text-gray-700',
};

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Initial Verifier Queue', href: '/queue/initial-verifier' },
];

/* ================= PAGE ================= */

export default function InitialVerifierQueue({ contracts }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Initial Verifier Queue" />

            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-6">
                {/* ================= HEADER ================= */}
                <div>
                    <h1 className="text-2xl font-semibold">
                        Initial Verification Queue
                    </h1>
                    <p className="text-sm text-gray-600">
                        Contracts awaiting initial verification
                    </p>
                </div>

                {/* ================= TABLE ================= */}
                <div className="relative w-full overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Transaction No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Contract Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Submitted By
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Branch
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {contracts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-gray-500"
                                    >
                                        No contracts pending verification.
                                    </td>
                                </tr>
                            )}

                            {contracts.map((contract) => (
                                <tr
                                    key={contract.id}
                                    className="hover:bg-gray-50"
                                >
                                    {/* Transaction No */}
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {contract.transaction_no}
                                    </td>

                                    {/* Contract Type */}
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold
                                                ${
                                                    contract.contract_type === 'NEW'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-green-100 text-green-700'
                                                }`}
                                        >
                                            {contract.contract_type}
                                        </span>
                                    </td>

                                    {/* Submitted By */}
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {contract.uploader.name}
                                    </td>

                                    {/* Branch */}
                                    <td className="px-6 py-4 text-sm">
                                        {contract.uploader.branch ? (
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {contract.uploader.branch.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {contract.uploader.branch.code}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="italic text-gray-400">
                                                No branch
                                            </span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium
                                                ${statusColor[contract.status]}`}
                                        >
                                            {contract.status}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {new Date(contract.created_at).toLocaleDateString()}
                                    </td>

                                    {/* Action */}
                                    <td className="px-6 py-4 text-right text-sm">
                                        <Link
                                            href={`/contracts/${contract.id}`}
                                            className="inline-flex items-center gap-1 rounded-md border border-emerald-600 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 transition"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
