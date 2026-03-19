import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout'
import { type BreadcrumbItem } from '@/types'
import { type ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner' // ✅ ADD THIS

interface AppLayoutProps {
    children: ReactNode
    breadcrumbs?: BreadcrumbItem[]
}

export default ({ children, breadcrumbs }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs}>
        {children}

        {/* ✅ GLOBAL SONNER TOASTER */}
        <Toaster
            position="top-right"
            richColors
            closeButton
        />
    </AppLayoutTemplate>
)
