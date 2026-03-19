import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

/* ================= TYPES ================= */

interface ContractFile {
    id: number;
    file_path: string;
}

interface Contract {
    id: number;
    transaction_no: string;
    contract_type: 'NEW' | 'RENEWAL';
    files: ContractFile[];
    status: string;
}

interface Props {
    contract: Contract;
}

/* ================= BREADCRUMBS ================= */

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Contracts', href: '/contracts' },
    { title: 'Edit Contract', href: `/contracts/${id}/edit` },
];

/* ================= PAGE ================= */

export default function Edit({ contract }: Props) {
    const contractForm = useForm<{
        transaction_no: string;
        contract_type: 'NEW' | 'RENEWAL';
        _method: string;
    }>({
        transaction_no: contract.transaction_no,
        contract_type: contract.contract_type,
        _method: 'put',
    });

    const submitContract = (e: FormEvent) => {
        e.preventDefault();
        contractForm.post(`/contracts/${contract.id}`, {
            preserveScroll: true,
        });
    };

    const fileForm = useForm<{ file: File | null }>({
        file: null,
    });

    const submitFile = (e: FormEvent) => {
        e.preventDefault();
        fileForm.post(`/contracts/${contract.id}/files`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => fileForm.reset(),
        });
    };

    const deleteFile = (fileId: number) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;

        router.delete(`/contracts/files/${fileId}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs(contract.id)}>
            <Head title="Edit Contract" />

            {/* ✅ SAME CONTAINER AS SHOW PAGE */}
            <div className="mx-auto w-full max-w-screen-xl px-4 space-y-8">

                {/* ================= HEADER ================= */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Edit Contract
                        </h1>
                        <p className="text-sm text-gray-600">
                            Update contract details and manage attachments
                        </p>
                    </div>

                    <Link
                        href={`/contracts/${contract.id}`}
                        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        Back to Details
                    </Link>
                </div>

                {/* ================= GRID (same visual weight as Show) ================= */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* ================= CONTRACT DETAILS ================= */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">
                            Contract Details
                        </h2>

                        <form onSubmit={submitContract} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Transaction Number
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm
                                               focus:border-blue-500 focus:ring-blue-500"
                                    value={contractForm.data.transaction_no}
                                    onChange={(e) =>
                                        contractForm.setData(
                                            'transaction_no',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contract Type
                                </label>
                                <select
                                    value={contractForm.data.contract_type}
                                    onChange={(e) =>
                                        contractForm.setData(
                                            'contract_type',
                                            e.target.value as 'NEW' | 'RENEWAL'
                                        )
                                    }
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                    disabled={
                                        contract.status !== 'DRAFT' &&
                                        contract.status !== 'RETURNED'
                                    }
                                >
                                    <option value="NEW">New</option>
                                    <option value="RENEWAL">Renewal</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-4">
                                <button
                                    type="submit"
                                    disabled={contractForm.processing}
                                    className="rounded-md bg-blue-600 px-5 py-2
                                               text-sm font-medium text-white
                                               hover:bg-blue-700"
                                >
                                    {contractForm.processing
                                        ? 'Saving…'
                                        : 'Update Contract'}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* ================= ATTACHMENTS ================= */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Attachments
                            </h2>
                            <p className="text-sm text-gray-600">
                                Upload or remove supporting contract documents
                            </p>
                        </div>

                        <form onSubmit={submitFile} className="space-y-4">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                className="block w-full text-sm"
                                onChange={(e) =>
                                    fileForm.setData(
                                        'file',
                                        e.target.files?.[0] || null
                                    )
                                }
                            />

                            <button
                                type="submit"
                                disabled={
                                    fileForm.processing || !fileForm.data.file
                                }
                                className="rounded-md bg-green-600 px-5 py-2
                                           text-sm font-medium text-white
                                           hover:bg-green-700"
                            >
                                Upload File
                            </button>
                        </form>

                        {contract.files.length > 0 && (
                            <ul className="divide-y rounded-md border">
                                {contract.files.map((file) => (
                                    <li
                                        key={file.id}
                                        className="flex items-center justify-between px-4 py-3"
                                    >
                                        <a
                                            href={`/storage/${file.file_path}`}
                                            target="_blank"
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            {file.file_path.split('/').pop()}
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => deleteFile(file.id)}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
