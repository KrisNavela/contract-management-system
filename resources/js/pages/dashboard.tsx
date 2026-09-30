import AppLayout from '@/layouts/app-layout'
import { Head, Link, usePage } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types'
import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    FileCheck2,
    FileText,
    Plus,
    RotateCcw,
    Scale,
    Sparkles,
} from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
]

export default function Dashboard() {
    const { auth, contractCounts, legalCounts } = usePage().props as any

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="mx-auto w-full max-w-screen-2xl space-y-8">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-800 p-6 text-white shadow-xl shadow-emerald-950/10 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-100">
                                <Sparkles className="size-3.5" />
                                Operations overview
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                                Welcome back, {auth.user.name}
                            </h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/80">
                                Keep your contract and legal document workflows moving with a clear view of today&apos;s activity.
                            </p>
                        </div>

                        {auth.user.role === 'BRANCH' && (
                            <Link
                                href="/contracts/create"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-lg shadow-black/10 transition hover:bg-emerald-50"
                            >
                                <Plus className="size-4" />
                                New contract
                            </Link>
                        )}
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <WorkflowHint
                            icon={<Clock3 className="size-4" />}
                            label="Pending review"
                            value={contractCounts?.pending ?? 0}
                        />
                        <WorkflowHint
                            icon={<CheckCircle2 className="size-4" />}
                            label="Contracts approved"
                            value={contractCounts?.approved ?? 0}
                        />
                        <WorkflowHint
                            icon={<FileCheck2 className="size-4" />}
                            label="Total contracts"
                            value={contractCounts?.total ?? 0}
                        />
                    </div>
                </div>

                {contractCounts && (
                    <ModuleSection
                        title="Contracts"
                        description="Track submissions, verification, and execution readiness."
                        icon={<FileText className="h-5 w-5" />}
                    >
                        <DashboardCard label="Total" value={contractCounts.total ?? 0} accent="emerald" icon={<FileText className="size-5" />} href="/contracts" />
                        <DashboardCard label="Pending" value={contractCounts.pending ?? 0} accent="amber" icon={<Clock3 className="size-5" />} href="/contracts?pending=1" />
                        <DashboardCard label="Approved" value={contractCounts.approved ?? 0} accent="green" icon={<CheckCircle2 className="size-5" />} href="/contracts?status=APPROVED" />
                        <DashboardCard label="Returned / Rejected" value={contractCounts.returned ?? 0} accent="red" icon={<RotateCcw className="size-5" />} href="/contracts?outcome=returned" />
                    </ModuleSection>
                )}

                {legalCounts && (
                    <ModuleSection
                        title="Legal Documents"
                        description="Monitor department and legal review activity."
                        icon={<Scale className="h-5 w-5" />}
                    >
                        <DashboardCard label="Total" value={legalCounts.total ?? 0} accent="emerald" icon={<Scale className="size-5" />} href="/legal-documents" />
                        <DashboardCard label="Pending" value={legalCounts.pending ?? 0} accent="amber" icon={<Clock3 className="size-5" />} href="/legal-documents?status=SUBMITTED" />
                        <DashboardCard label="Approved" value={legalCounts.approved ?? 0} accent="green" icon={<CheckCircle2 className="size-5" />} href="/legal-documents?status=APPROVED" />
                        <DashboardCard label="Returned / Rejected" value={legalCounts.returned ?? 0} accent="red" icon={<RotateCcw className="size-5" />} href="/legal-documents?status=RETURNED" />
                    </ModuleSection>
                )}
            </div>
        </AppLayout>
    )
}

function ModuleSection({ title, description, icon, children }: {
    title: string
    description: string
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">{icon}</div>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
                    <p className="mt-0.5 text-sm text-slate-500">{description}</p>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
        </section>
    )
}

function DashboardCard({ label, value, accent, icon, href }: {
    label: string
    value: number
    accent: 'emerald' | 'green' | 'amber' | 'red'
    icon: React.ReactNode
    href: string
}) {
    const accentStyles = {
        emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        green: 'bg-green-50 text-green-700 ring-green-100',
        amber: 'bg-amber-50 text-amber-700 ring-amber-100',
        red: 'bg-red-50 text-red-700 ring-red-100',
    }

    return (
        <Link href={href} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
                </div>
                <span className={`rounded-xl p-2.5 ring-1 ${accentStyles[accent]}`}>{icon}</span>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-slate-400 transition group-hover:text-emerald-700">
                <span>View details</span>
                <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
        </Link>
    )
}

function WorkflowHint({ icon, label, value }: {
    icon: React.ReactNode
    label: string
    value: number
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="rounded-lg bg-white/10 p-2 text-emerald-100">{icon}</span>
            <div>
                <p className="text-lg font-semibold leading-none">{value}</p>
                <p className="mt-1 text-xs text-emerald-100/70">{label}</p>
            </div>
        </div>
    )
}
