interface Props {
    currentStatus: string;
    executionUploaded?: boolean;
}

const STEPS = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'REVIEWED', label: 'Reviewed' },
    { key: 'INITIAL_VERIFICATION', label: 'Initial Verification' },
    { key: 'FINAL_VERIFICATION', label: 'Final Verification' },
    { key: 'INITIAL_APPROVAL', label: 'Initial Approval' },
    { key: 'FINAL_APPROVAL', label: 'Final Approval' },
    { key: 'EXECUTION_UPLOADED', label: 'Execution Uploaded' },
];

const resolveTimelineStatus = (
    status: string,
    executionUploaded: boolean
) => {
    if (executionUploaded) return 'EXECUTION_UPLOADED';
    if (status === 'APPROVED') return 'FINAL_APPROVAL';
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

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
                Approval Progress
            </h2>

            <ol className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const completed = index <= currentIndex;
                    const active = index === currentIndex + 1;

                    return (
                        <li
                            key={step.key}
                            className="flex flex-1 flex-col items-center text-center"
                        >
                            <div
                                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                                    ${
                                        completed
                                            ? 'bg-green-600 text-white'
                                            : active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {index + 1}
                            </div>

                            <span
                                className={`text-xs ${
                                    completed
                                        ? 'font-semibold text-green-700'
                                        : active
                                        ? 'font-semibold text-blue-700'
                                        : 'text-gray-600'
                                }`}
                            >
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
