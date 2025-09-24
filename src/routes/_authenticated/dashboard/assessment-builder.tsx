import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/dashboard/assessment-builder')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hey assessment
    </div>
  )
}
