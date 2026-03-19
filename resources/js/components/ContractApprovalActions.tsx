import { router, useForm, usePage } from '@inertiajs/react'
import { toast } from 'sonner'

/* ================= TYPES ================= */

type Role =
    | 'BRANCH'
    | 'REVIEWER'
    | 'INITIAL_VERIFIER'
    | 'FINAL_VERIFIER'
    | 'INITIAL_APPROVER'
    | 'FINAL_APPROVER'

type ActionType = 'forward' | 'approve' | 'return' | 'reject'

interface Props {
    contract: {
        id: number
    }
}

/* ================= COMPONENT ================= */

export default function ContractApprovalActions({ contract }: Props) {
    const { auth } = usePage().props as any
    const role: Role = auth.user.role

    const form = useForm<{
        remarks: string
    }>({
        remarks: '',
    })

    /* ================= RETURN TARGETS ================= */

    const returnTargets: Partial<
    Record<Role, { label: string; value: Role }[]>
    > = {
        REVIEWER: [
            { label: 'Return to Branch', value: 'BRANCH' },
        ],
        INITIAL_VERIFIER: [
            { label: 'Return to Branch', value: 'BRANCH' },
            { label: 'Return to Reviewer', value: 'REVIEWER' },
        ],
        FINAL_VERIFIER: [
            { label: 'Return to Branch', value: 'BRANCH' },
            { label: 'Return to Reviewer', value: 'REVIEWER' },
            { label: 'Return to Initial Verifier', value: 'INITIAL_VERIFIER' },
        ],
        INITIAL_APPROVER: [
            { label: 'Return to Branch', value: 'BRANCH' },
            { label: 'Return to Reviewer', value: 'REVIEWER' },
            { label: 'Return to Initial Verifier', value: 'INITIAL_VERIFIER' },
            { label: 'Return to Final Verifier', value: 'FINAL_VERIFIER' },
        ],
        FINAL_APPROVER: [
            { label: 'Return to Branch', value: 'BRANCH' },
            { label: 'Return to Reviewer', value: 'REVIEWER' },
            { label: 'Return to Initial Verifier', value: 'INITIAL_VERIFIER' },
            { label: 'Return to Final Verifier', value: 'FINAL_VERIFIER' },
            { label: 'Return to Initial Approver', value: 'INITIAL_APPROVER' },
        ],
    }

    /* ================= SUBMIT FUNCTION ================= */

    const submit = (action: ActionType, returnTo?: Role) => {
        // Require remarks for return/reject
        if ((action === 'return' || action === 'reject') && !form.data.remarks.trim()) {
            toast.error('Remarks Required', {
                description:
                    'Please enter remarks before returning or rejecting.',
            })
            return
        }

        router.post(
            `/contracts/${contract.id}/approval`,
            {
                action,
                return_to: returnTo ?? null,
                remarks: form.data.remarks,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    const messages: Record<
                        ActionType,
                        { title: string; desc: string }
                    > = {
                        forward: {
                            title: 'Forwarded',
                            desc: 'The contract has been forwarded to the next stage.',
                        },
                        approve: {
                            title: 'Approved',
                            desc: 'The contract has been approved successfully.',
                        },
                        return: {
                            title: 'Returned',
                            desc: returnTo
                                ? `The contract was returned to ${returnTo.replace(
                                      '_',
                                      ' '
                                  )}.`
                                : 'The contract was returned.',
                        },
                        reject: {
                            title: 'Rejected',
                            desc: 'The contract has been rejected.',
                        },
                    }

                    const msg = messages[action]

                    toast.success(msg.title, {
                        description: msg.desc,
                        id: `approval-${contract.id}-${action}-${returnTo ?? 'default'}`,
                    })

                    form.reset('remarks')
                },

                onError: () => {
                    toast.error('Action Failed', {
                        description:
                            'Please check your remarks and try again.',
                    })
                },
            }
        )
    }

    const isFinalApprover = role === 'FINAL_APPROVER'

    /* ================= UI ================= */

    return (
        <div className="space-y-4">
            {/* ===== REMARKS ===== */}
            <div>
                <label className="block text-sm font-medium">
                    Remarks / Comments
                </label>
                <textarea
                    rows={3}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    value={form.data.remarks}
                    onChange={(e) =>
                        form.setData('remarks', e.target.value)
                    }
                    placeholder="Enter remarks (required for return or reject)"
                />
            </div>

            {/* ===== ACTION BUTTONS ===== */}
            <div className="flex flex-wrap gap-3">
                {/* APPROVE (Final Approver Only) */}
                {isFinalApprover && (
                    <button
                        type="button"
                        onClick={() => submit('approve')}
                        disabled={form.processing}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm text-white 
                        hover:bg-green-700 cursor-pointer disabled:opacity-50"
                    >
                        Approve
                    </button>
                )}

                {/* FORWARD (Everyone Except Final Approver) */}
                {!isFinalApprover && (
                    <button
                        type="button"
                        onClick={() => submit('forward')}
                        disabled={form.processing}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white 
                        hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                    >
                        Forward
                    </button>
                )}

                {/* DYNAMIC RETURN BUTTONS */}
                {returnTargets[role]?.map((target) => (
                    <button
                        key={target.value}
                        type="button"
                        onClick={() => submit('return', target.value)}
                        disabled={form.processing}
                        className="rounded-md bg-yellow-500 px-4 py-2 text-sm text-white 
                        hover:bg-yellow-600 cursor-pointer disabled:opacity-50"
                    >
                        {target.label}
                    </button>
                ))}

                {/* REJECT */}
                <button
                    type="button"
                    onClick={() => submit('reject')}
                    disabled={form.processing}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm text-white 
                    hover:bg-red-700 cursor-pointer disabled:opacity-50"
                >
                    Reject
                </button>
            </div>
        </div>
    )
}