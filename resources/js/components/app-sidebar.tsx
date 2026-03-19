import { NavFooter } from '@/components/nav-footer'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import {
    Folder,
    LayoutGrid,
    CheckCircle,
    FileText,
    Home,
    Scale,
    Users,
    UserCog,
} from 'lucide-react'
import AppLogo from './app-logo'

export function AppSidebar() {
    const { auth } = usePage().props as any

    const role = auth?.user?.role
    const legalRole = auth?.user?.legal_role

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ]

    /* ================= CONTRACTS (COLLAPSIBLE FOR ALL) ================= */

    const contractChildren: NavItem[] = []

    if (role === 'BRANCH') {
        contractChildren.push(
            { title: 'List of Contracts', href: '/contracts' },
            { title: 'Create Contract', href: '/contracts/create' }
        )
    }

    if (role === 'REVIEWER') {
        contractChildren.push(
            { title: 'All Contracts', href: '/contracts/all' },
            { title: 'Reviewer Queue', href: '/queue/reviewer' }
            
        )
    }

    if (role === 'INITIAL_VERIFIER') {
        contractChildren.push(
            { title: 'All Contracts', href: '/contracts/all' },
            { title: 'Initial Verification', href: '/queue/initial-verifier' } 
        )
    }

    if (role === 'FINAL_VERIFIER') {
        contractChildren.push(
            { title: 'All Contracts', href: '/contracts/all' },
            { title: 'Final Verification', href: '/queue/final-verifier' }
        )
    }

    if (role === 'INITIAL_APPROVER') {
        contractChildren.push(
            { title: 'All Contracts', href: '/contracts/all' },
            { title: 'Initial Approval', href: '/queue/initial-approver' }
        )
    }

    if (role === 'FINAL_APPROVER') {
        contractChildren.push(
            { title: 'All Contracts', href: '/contracts/all' },
            { title: 'Final Approval', href: '/queue/final-approver' }
        )
    }

    if (role === 'ADMIN') {
        contractChildren.push(
            { title: 'All Contracts', href: '/contracts/all' },
            { title: 'Reviewer Queue', href: '/queue/reviewer' },
            { title: 'Initial Verification', href: '/queue/initial-verifier' },
            { title: 'Final Verification', href: '/queue/final-verifier' },
            { title: 'Initial Approval', href: '/queue/initial-approver' },
            { title: 'Final Approval', href: '/queue/final-approver' }
            
        )
    }

    if (contractChildren.length > 0) {
        mainNavItems.push({
            title: 'Contracts',
            icon: FileText,
            children: contractChildren,
        })
    }

    /* ================= LEGAL (COLLAPSIBLE FOR LEGAL ROLES + ADMIN) ================= */

    if (legalRole || role === 'ADMIN') {
        const legalChildren: NavItem[] = [
            {
                title: 'All Legal Documents',
                href: '/legal-documents',
            },
        ]

        if (legalRole === 'DEPARTMENT_HEAD' || role === 'ADMIN') {
            legalChildren.push({
                title: 'Department Approvals',
                href: '/legal/department-approvals',
            })
        }

        if (legalRole === 'LEGAL_OFFICER' || role === 'ADMIN') {
            legalChildren.push({
                title: 'Legal Officer Review',
                href: '/legal/legal-approvals',
            })
        }

        mainNavItems.push({
            title: 'Legal Documents',
            icon: Scale,
            children: legalChildren,
        })
    }


    /* ================= ADMIN EXTRAS ================= */

    if (role === 'ADMIN') {
        mainNavItems.push(
            {
                title: 'User Management',
                href: '/users',
                icon: Users,
            },
            {
                title: 'Branch Maintenance',
                href: '/branches',
                icon: UserCog ,
            }
        )
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
