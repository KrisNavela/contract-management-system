interface Remark {
    id: number;
    action: string;
    remarks: string | null;
    created_at: string;
    user: {
        name: string;
        role: string;
    };
}

interface Props {
    remarks: Remark[];
}

export default function RemarksHistory({ remarks }: Props) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
                Remarks & History
            </h2>

            {remarks.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No remarks available.
                </p>
            ) : (
                <ul className="space-y-4">
                    {remarks.map((remark) => (
                        <li
                            key={remark.id}
                            className="rounded-md border px-4 py-3"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {remark.user.name}
                                        <span className="ml-2 text-xs text-gray-500">
                                            ({remark.user.role})
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            remark.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                    {remark.action.toUpperCase()}
                                </span>
                            </div>

                            {remark.remarks && (
                                <p className="mt-3 text-sm text-gray-700">
                                    {remark.remarks}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
