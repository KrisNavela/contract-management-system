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
      <SidebarInset className="min-h-screen bg-background">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        <main className="p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
