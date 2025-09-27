import { createFileRoute } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import axios from "axios"
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Job } from '@/types/jobs'
import { CreateJobDialog } from '@/components/create-job-dialog'
import { Filter } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard/jobs')({
  component: RouteComponent,
})

interface JobResponse {
  data: Job[]
  total: number
  page: number
  pageSize: number
}

function RouteComponent() {
  const fetchJobs = async () => {
    const res = await axios.get<JobResponse>("/api/jobs", {
      params: {
      }
    })

    return res.data
  }

  const { data } = useQuery({
    queryKey: ['list-jobs'],
    queryFn: fetchJobs
  })

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Jobs</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex gap-3">
            <Input type="search" placeholder="Search jobs" className="min-w-96" />
            <Button type="button" variant="secondary" className="border-dashed border-2 border-secondary-foreground/20 hover:cursor-pointer">
              <Filter />Status
            </Button>
          </div>
          <div>
            <CreateJobDialog />
          </div>
        </div>
        <div className="pt-4 space-y-3">
          {data && data.data?.length > 0 && data.data.map((job) => (
            <Card className="@container/card" key={job.id}>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {job.title}
                </CardTitle>
                <div className="flex gap-2">
                  {job.tags.length > 0 && job.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))
                  }
                </div>
                {job.description &&
                  <CardDescription>{job.description}</CardDescription>
                }
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
