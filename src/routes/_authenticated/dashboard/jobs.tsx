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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from "axios"
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Job } from '@/types/jobs'
import { Archive, ArchiveRestore, Filter, Trash } from 'lucide-react'
import { seedJobsIfEmpty } from '@/services/db-queries/jobs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { JobDialog } from '@/components/job-dialog'
import { useDebounceValue } from 'usehooks-ts'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useState } from 'react'

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
  const [debouncedValue, setValue] = useDebounceValue('', 500)
  const [jobType, setJobType] = useState("")

  const queryClient = useQueryClient()
  const fetchJobs = async () => {
    await seedJobsIfEmpty()
    const res = await axios.get<JobResponse>("/api/jobs", {
      params: {
        search: debouncedValue,
        jobType: jobType
      }
    })

    return res.data
  }

  const unarchiveJob = async (job: Job) => {
    const id = job.id
    const obj: Job = { ...job, status: 'active' }
    try {
      await axios.patch("/api/jobs/" + id, obj)
      toast.success("Successfully updated the job.")
      queryClient.invalidateQueries({ queryKey: ['list-jobs'] })
    } catch (e) {
      console.error(e)
      toast.error("An unknown error occurred.")
    }
  }

  const archiveJob = async (job: Job) => {
    const id = job.id
    const obj: Job = { ...job, status: 'archived' }
    try {
      await axios.patch("/api/jobs/" + id, obj)
      toast.success("Successfully updated the job.")
      queryClient.invalidateQueries({ queryKey: ['list-jobs'] })
    } catch (e) {
      console.error(e)
      toast.error("An unknown error occurred.")
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await axios.delete("/api/jobs/" + id)
      toast.success("Successfully deleted the job.")
      queryClient.invalidateQueries({ queryKey: ['list-jobs'] })
    } catch (e) {
      console.error(e)
      toast.error("An unknown error occurred.")
    }
  }

  const { data } = useQuery({
    queryKey: ['list-jobs', debouncedValue, jobType],
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
            <Input type="search" placeholder="Search jobs" defaultValue="" onChange={(e) => setValue(e.target.value)} className="min-w-96" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="secondary" className="border-dashed border-2 border-secondary-foreground/20 hover:cursor-pointer gap-x-2">
                  <Filter />Job Type
                  {jobType !== '' &&
                    <Badge className="capitalize">{jobType}</Badge>
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={jobType} onValueChange={setJobType}>
                  <DropdownMenuRadioItem value="">Any</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="full-time">Full-time</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="remote">Remote</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="part-time">Part-time</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <JobDialog />
          </div>
        </div>
        <div className="pt-4 space-y-3">
          {data && data.data?.length > 0 ? data.data.map((job) => (
            <Card className={cn("@container/card", job.status === "archived" && "bg-gray-400/30 saturate-50 border-2 border-dashed border-primary")} key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {job.title}
                  </CardTitle>
                  <div className="inline-flex gap-2">
                    {job.status === "active" ?
                      <Button title="Archive this job" onClick={() => archiveJob(job)} size="icon" variant="ghost">
                        <Archive className="size-4" />
                      </Button>
                      :
                      <Button title="Unarchive this job" onClick={() => unarchiveJob(job)} size="icon" variant="ghost">
                        <ArchiveRestore className="size-4" />
                      </Button>
                    }
                    <JobDialog job={job} />
                    <Button title="Delete this job" onClick={() => deleteJob(job.id)} size="icon" variant="destructive">
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </div>
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
          )) :
            <div className="text-center py-6 px-12 mx-auto w-fit text-muted-foreground border-2 border-dashed rounded-md">
              We could not find what you were looking for.
            </div>}
        </div>
      </div>
    </>
  )
}
