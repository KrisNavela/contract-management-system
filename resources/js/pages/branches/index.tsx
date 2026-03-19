import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

interface Branch {
    id: number;
    name: string;
    code: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    branch_id: number | null;
    branch?: Branch | null;
}

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Branch Maintenance', href: '/branches' },
];

export default function BranchIndex({ branches }: { branches: Branch[] }) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/branches', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Branch Maintenance" />

            <div className="mx-auto max-w-5xl space-y-6">

                {/* Flash */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        ✅ {flash.success}
                    </div>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Branch Maintenance
                    </h1>
                    <p className="text-sm text-gray-600">
                        Manage system branches
                    </p>
                </div>

                {/* Create Branch */}
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">
                        Add New Branch
                    </h2>

                    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">
                                Branch Name
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Branch Code
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. NCR"
                                className="mt-1 w-full rounded-md border px-3 py-2 text-sm uppercase"
                                value={data.code}
                                onChange={(e) =>
                                    setData('code', e.target.value.toUpperCase())
                                }
                            />
                            {errors.code && (
                                <p className="text-sm text-red-600">
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                            >
                                Add Branch
                            </button>
                        </div>
                    </form>
                </div>

                {/* Branch List */}
                <div className="rounded-xl border bg-white shadow-sm">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                    Code
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {branches.map((branch) => (
                                <tr key={branch.id}>
                                    <td className="px-6 py-3 text-sm font-medium">
                                        {branch.name}
                                    </td>
                                    <td className="px-6 py-3 text-sm">
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                            {branch.code}
                                        </span>
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
