import AppLayout from '@/layouts/app-layout'
import { Head, Link, usePage } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types'
import { FileText, Scale } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
]

export default function Dashboard() {
    const { auth, contractCounts, legalCounts } = usePage().props as any

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="space-y-12 px-4 py-6">

                {/* ================= HEADER ================= */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white shadow-lg">
                    <h1 className="text-2xl font-semibold">
                        Welcome back, {auth.user.name}
                    </h1>
                    <p className="mt-1 text-sm text-emerald-100">
                        Here'’'s a summary of your system activity.
                    </p>
                </div>

                {/* ================= CONTRACTS ================= */}
                {contractCounts && (
                    <ModuleSection
                        title="Contracts"
                        icon={<FileText className="h-5 w-5" />}
                    >
                        <DashboardCard
                            label="Total"
                            value={contractCounts.total ?? 0}
                            accent="emerald"
                            href="/contracts"
                        />
                        <DashboardCard
                            label="Pending"
                            value={contractCounts.pending ?? 0}
                            accent="amber"
                            href="/contracts?status=SUBMITTED"
                        />
                        <DashboardCard
                            label="Approved"
                            value={contractCounts.approved ?? 0}
                            accent="green"
                            href="/contracts?status=APPROVED"
                        />
                        <DashboardCard
                            label="Returned"
                            value={contractCounts.returned ?? 0}
                            accent="red"
                            href="/contracts?status=RETURNED"
                        />
                    </ModuleSection>
                )}

                {/* ================= LEGAL ================= */}
                {legalCounts && (
                    <ModuleSection
                        title="Legal Documents"
                        icon={<Scale className="h-5 w-5" />}
                    >
                        <DashboardCard
                            label="Total"
                            value={legalCounts.total ?? 0}
                            accent="emerald"
                            href="/legal-documents"
                        />
                        <DashboardCard
                            label="Pending"
                            value={legalCounts.pending ?? 0}
                            accent="amber"
                            href="/legal-documents?status=SUBMITTED"
                        />
                        <DashboardCard
                            label="Approved"
                            value={legalCounts.approved ?? 0}
                            accent="green"
                            href="/legal-documents?status=APPROVED"
                        />
                        <DashboardCard
                            label="Returned / Rejected"
                            value={legalCounts.returned ?? 0}
                            accent="red"
                            href="/legal-documents?status=RETURNED"
                        />
                    </ModuleSection>
                )}

            </div>
        </AppLayout>
    )
}

/* ================= MODULE SECTION ================= */

function ModuleSection({
    title,
    icon,
    children,
}: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-gray-800">
                <div className="rounded-md bg-emerald-100 p-2 text-emerald-600">
                    {icon}
                </div>
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {children}
            </div>
        </div>
    )
}

/* ================= DASHBOARD CARD ================= */

function DashboardCard({
    label,
    value,
    accent,
    href,
}: {
    label: string
    value: number
    accent: 'emerald' | 'green' | 'amber' | 'red'
    href: string
}) {
    const accentStyles = {
        emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        green: 'border-green-200 bg-green-50 text-green-700',
        amber: 'border-amber-200 bg-amber-50 text-amber-700',
        red: 'border-red-200 bg-red-50 text-red-700',
    }

    return (
        <Link
            href={href}
            className="group rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
        >
            <p className="text-sm text-gray-500">{label}</p>
            <div className="mt-3 flex items-end justify-between">
                <p
                    className={`text-3xl font-bold ${accentStyles[accent]}`}
                >
                    {value}
                </p>
                <span className="text-xs text-gray-400 group-hover:text-gray-600">
                    View →
                </span>
            </div>
        </Link>
    )
}