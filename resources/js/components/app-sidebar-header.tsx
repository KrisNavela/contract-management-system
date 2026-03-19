import { Breadcrumbs } from '@/components/breadcrumbs'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types'
import { usePage, Link } from '@inertiajs/react'
import { Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[]
}) {
    const { auth, pendingApprovalCount, pendingApprovals } =
        usePage().props as any

    const role = auth?.user?.role

    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    /* ================= CONTRACT QUEUE LINK ================= */
    const contractQueueLink =
        role === 'REVIEWER'
            ? '/queue/reviewer'
            : role === 'INITIAL_VERIFIER'
            ? '/queue/initial-verifier'
            : role === 'FINAL_VERIFIER'
            ? '/queue/final-verifier'
            : role === 'INITIAL_APPROVER'
            ? '/queue/initial-approver'
            : role === 'FINAL_APPROVER'
            ? '/queue/final-approver'
            : '/contracts'

    /* ================= CLOSE ON OUTSIDE CLICK ================= */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <header className="flex h-16 items-center justify-between border-b px-6 md:px-4">
            {/* LEFT */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* RIGHT */}
            <div ref={ref} className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="relative rounded-md p-1 hover:bg-gray-100"
                >
                    <Bell className="h-6 w-6 text-muted-foreground hover:text-foreground" />

                    {pendingApprovalCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px]
                            items-center justify-center rounded-full bg-red-600
                            px-1 text-[10px] font-semibold text-white ring-2 ring-white">
                            {pendingApprovalCount > 99
                                ? '99+'
                                : pendingApprovalCount}
                        </span>
                    )}
                </button>

                {/* ================= DROPDOWN ================= */}
                {open && (
                    <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white shadow-lg z-50">
                        <div className="border-b px-4 py-2 text-sm font-semibold">
                            Pending Actions
                        </div>

                        <ul className="max-h-64 overflow-auto divide-y">

                            {pendingApprovals?.map((item: any) => (
                                <li key={`${item.type}-${item.id}`}>
                                    <Link
                                        href={item.url}
                                        className="block px-4 py-3 hover:bg-gray-50"
                                        onClick={() => setOpen(false)}
                                    >
                                        <p className="text-sm font-medium">
                                            {item.type === 'contract'
                                                ? '📄 Contract'
                                                : '⚖️ Legal'}{' '}
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.created_at}
                                        </p>
                                    </Link>
                                </li>
                            ))}

                            {!pendingApprovals?.length && (
                                <li className="px-4 py-3 text-sm text-gray-500">
                                    No pending actions.
                                </li>
                            )}
                        </ul>

                        {/* ================= FOOTER ================= */}
                        <div className="border-t px-4 py-2 text-center">
                            <Link
                                href={contractQueueLink}
                                className="text-sm font-medium text-blue-600 hover:underline"
                                onClick={() => setOpen(false)}
                            >
                                View all
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
