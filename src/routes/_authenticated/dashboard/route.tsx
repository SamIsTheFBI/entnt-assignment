import Header from '@/components/Header'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayoutComponent,
})

function DashboardLayoutComponent() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
