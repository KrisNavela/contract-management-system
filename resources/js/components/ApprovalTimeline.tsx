interface Props {
    currentStatus: string;
    executionUploaded?: boolean;
}

const STEPS = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'REVIEWED', label: 'Reviewed' },
    { key: 'INITIAL_VERIFICATION', label: 'Initial Verification' },
    { key: 'FINAL_VERIFICATION', label: 'Final Verification' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'EXECUTION_UPLOADED', label: 'Execution Uploaded' },
];

const resolveTimelineStatus = (
    status: string,
    executionUploaded: boolean
) => {
    if (executionUploaded) return 'EXECUTION_UPLOADED';
    return status;
};

export default function ApprovalTimeline({
    currentStatus,
    executionUploaded = false,
}: Props) {
    const timelineStatus = resolveTimelineStatus(
        currentStatus,
        executionUploaded
    );

    const currentIndex = STEPS.findIndex(
        (step) => step.key === timelineStatus
    );
    const hasProgress = currentIndex >= 0;
    const statusLabel = timelineStatus.replaceAll('_', ' ');

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-7">
            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        Workflow
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-900">
                        Approval Progress
                    </h2>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                    timelineStatus === 'REJECTED'
                        ? 'bg-red-50 text-red-700'
                        : timelineStatus === 'RETURNED'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                }`}>
                    {statusLabel}
                </span>
            </div>

            <div className="overflow-x-auto pb-1">
            <ol className="flex min-w-[720px] items-start justify-between">
                {STEPS.map((step, index) => {
                    const completed = hasProgress && index <= currentIndex;
                    const active = hasProgress && index === currentIndex + 1;

                    return (
                        <li
                            key={step.key}
                            className="relative flex flex-1 flex-col items-center text-center"
                        >
                            {index < STEPS.length - 1 && (
                                <span
                                    className={`absolute left-1/2 top-4 h-0.5 w-full ${
                                        hasProgress && index < currentIndex
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-200'
                                    }`}
                                />
                            )}
                            <div
                                className={`relative z-10 mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-white
                                    ${
                                        completed
                                            ? 'bg-emerald-600 text-white'
                                            : active
                                            ? 'bg-white text-emerald-700 ring-emerald-100'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                            >
                                {index + 1}
                            </div>

                            <span
                                className={`max-w-32 text-xs ${
                                    completed
                                        ? 'font-semibold text-emerald-700'
                                        : active
                                        ? 'font-semibold text-emerald-700'
                                        : 'text-slate-500'
                                }`}
                            >
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
            </div>
        </div>
    );
}
