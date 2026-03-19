import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

interface Contract {
    id: number;
    transaction_no: string;
    status: string;
    created_at: string;
}

export default function QueueIndex({
    title,
    contracts,
}: {
    title: string;
    contracts: Contract[];
}) {
    return (
        <AppLayout>
            <Head title={title} />

            <div className="mx-auto max-w-6xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-sm text-gray-600">
                        Contracts waiting for your action
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                    Transaction No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                                    Date Submitted
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {contracts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No contracts waiting for action.
                                    </td>
                                </tr>
                            )}

                            {contracts.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">
                                        {c.transaction_no}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/contracts/${c.id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Open
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
