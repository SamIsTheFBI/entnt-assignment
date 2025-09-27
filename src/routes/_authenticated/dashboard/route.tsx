import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayoutComponent,
})

function DashboardLayoutComponent() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="px-1">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
