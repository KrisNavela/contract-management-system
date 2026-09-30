import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import { type BreadcrumbItem } from "@/types"
import { type PropsWithChildren } from "react"

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-slate-50/70">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
