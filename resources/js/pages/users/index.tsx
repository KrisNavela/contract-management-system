import AppLayout from '@/layouts/app-layout'
import { Head, usePage, router } from '@inertiajs/react'
import type { BreadcrumbItem } from '@/types'

/* ================= TYPES ================= */

interface Branch {
    id: number
    name: string
    code: string
}

interface Department {
    id: number
    name: string
}

interface User {
    id: number
    name: string
    email: string

    // CONTRACT APPROVAL ROLE
    role: string

    // LEGAL DOCUMENT ROLE
    legal_role: string | null

    branch_id: number | null
    department_id: number | null

    branch?: Branch | null
    department?: Department | null
}

interface Props {
    users: User[]
    branches: Branch[]
    departments: Department[]
}

/* ================= BREADCRUMBS ================= */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'User Management', href: '/users' },
]

/* ================= PAGE ================= */

export default function UsersIndex({
    users = [],
    branches = [],
    departments = [],
}: Props) {
    const page = usePage<any>()
    const authUser = page.props?.auth?.user ?? null

    /* ================= ROLE OPTIONS ================= */

    // CONTRACT APPROVAL ROLES (UNCHANGED)
    const contractRoles = [
        'BRANCH',
        'REVIEWER',
        'INITIAL_VERIFIER',
        'FINAL_VERIFIER',
        'INITIAL_APPROVER',
        'FINAL_APPROVER',
        'ADMIN',
    ]

    // LEGAL DOCUMENT ROLES (NEW)
    const legalRoles = [
        'USER',
        'DEPARTMENT_HEAD',
        'LEGAL_OFFICER',
    ]

    /* ================= ACTIONS ================= */

    const updateRole = (userId: number, role: string) => {
        router.put(`/users/${userId}/role`, { role }, { preserveScroll: true })
    }

    const updateLegalRole = (userId: number, legalRole: string | null) => {
        router.put(
            `/users/${userId}/legal-role`,
            { legal_role: legalRole },
            { preserveScroll: true }
        )
    }

    const updateBranch = (userId: number, branchId: number | null) => {
        router.put(
            `/users/${userId}/branch`,
            { branch_id: branchId },
            { preserveScroll: true }
        )
    }

    const updateDepartment = (userId: number, departmentId: number | null) => {
        router.put(
            `/users/${userId}/department`,
            { department_id: departmentId },
            { preserveScroll: true }
        )
    }

    /* ================= RENDER ================= */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">User Management</h1>
                    <p className="text-sm text-gray-600">
                        Manage contract roles, legal roles, branches, and departments
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-sm font-medium text-left">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-sm font-medium text-left">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-sm font-medium text-left">
                                    Contract Role
                                </th>
                                <th className="px-6 py-3 text-sm font-medium text-left">
                                    Legal Role
                                </th>
                                <th className="px-6 py-3 text-sm font-medium text-left">
                                    Branch
                                </th>
                                <th className="px-6 py-3 text-sm font-medium text-left">
                                    Department
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {users.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-6 text-center text-sm text-gray-500"
                                    >
                                        No users found
                                    </td>
                                </tr>
                            )}

                            {users.map((user) => {
                                const isSelf = authUser?.id === user.id

                                return (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 font-medium">
                                            {user.name}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.email}
                                        </td>

                                        {/* CONTRACT ROLE */}
                                        <td className="px-6 py-4">
                                            <select
                                                disabled={isSelf}
                                                value={user.role}
                                                onChange={(e) =>
                                                    updateRole(
                                                        user.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                                            >
                                                <option value="">
                                                    — None —
                                                </option>
                                                
                                                {contractRoles.map((role) => (
                                                    <option
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* LEGAL ROLE */}
                                        <td className="px-6 py-4">
                                            <select
                                                disabled={isSelf}
                                                value={user.legal_role ?? ''}
                                                onChange={(e) =>
                                                    updateLegalRole(
                                                        user.id,
                                                        e.target.value || null
                                                    )
                                                }
                                                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                                            >
                                                <option value="">
                                                    — None —
                                                </option>

                                                {legalRoles.map((role) => (
                                                    <option
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* BRANCH */}
                                        <td className="px-6 py-4">
                                            <select
                                                disabled={isSelf}
                                                value={user.branch_id ?? ''}
                                                onChange={(e) =>
                                                    updateBranch(
                                                        user.id,
                                                        e.target.value
                                                            ? Number(
                                                                  e.target.value
                                                              )
                                                            : null
                                                    )
                                                }
                                                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                                            >
                                                <option value="">
                                                    — No Branch —
                                                </option>

                                                {branches.map((branch) => (
                                                    <option
                                                        key={branch.id}
                                                        value={branch.id}
                                                    >
                                                        {branch.code} –{' '}
                                                        {branch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* DEPARTMENT */}
                                        <td className="px-6 py-4">
                                            <select
                                                disabled={isSelf}
                                                value={user.department_id ?? ''}
                                                onChange={(e) =>
                                                    updateDepartment(
                                                        user.id,
                                                        e.target.value
                                                            ? Number(
                                                                  e.target.value
                                                              )
                                                            : null
                                                    )
                                                }
                                                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                                            >
                                                <option value="">
                                                    — No Department —
                                                </option>

                                                {departments.map(
                                                    (department) => (
                                                        <option
                                                            key={department.id}
                                                            value={department.id}
                                                        >
                                                            {department.name}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
