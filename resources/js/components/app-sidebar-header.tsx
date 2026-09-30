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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 shadow-sm backdrop-blur md:px-6">
            {/* LEFT */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" />
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* RIGHT */}
            <div ref={ref} className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="relative rounded-xl border border-transparent p-2 text-slate-500 transition hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700"
                >
                    <Bell className="h-5 w-5" />

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
                    <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                        <div className="border-b bg-slate-50/80 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900">
                                Pending Actions
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Items that need your attention
                            </p>
                        </div>

                        <ul className="max-h-64 overflow-auto divide-y">

                            {pendingApprovals?.map((item: any) => (
                                <li key={`${item.type}-${item.id}`}>
                                    <Link
                                        href={item.url}
                                        className="block px-4 py-3 transition hover:bg-emerald-50/60"
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
                        <div className="border-t bg-slate-50/50 px-4 py-3 text-center">
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
