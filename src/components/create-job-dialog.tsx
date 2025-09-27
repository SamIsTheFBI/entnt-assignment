import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { z } from "zod/v4"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Controller, useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { TagInput } from "./tag-input"
import { JobStatusSchema, JobTypeSchema } from "@/types/jobs"
import axios from "axios"
import { useQueryClient } from "@tanstack/react-query"

const JobCreateSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string(),
  jobType: JobTypeSchema,
  status: JobStatusSchema,
  tags: z.array(z.string())
})

export function CreateJobDialog() {
  const form = useForm<z.infer<typeof JobCreateSchema>>({
    resolver: zodResolver(JobCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      jobType: "full-time",
      status: "active",
      tags: [],
    },
  })

  const queryClient = useQueryClient()

  async function onSubmit(values: z.infer<typeof JobCreateSchema>) {
    try {
      const res = await axios.post("/api/jobs", values)
      toast(JSON.stringify(res))
      queryClient.invalidateQueries({ queryKey: ['list-jobs'] })
    } catch (e) {
      console.error(e)
      toast(String(e))
    }
  }

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button className="border-2 hover:cursor-pointer">
            <PlusCircle />
            Create Job
          </Button>
        </DialogTrigger>
        <DialogContent className="min-w-3xl">
          <DialogHeader>
            <DialogTitle>Create a new job</DialogTitle>
            <DialogDescription>
              Provide job details. You can adjust the slug and tags before publishing.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Backend Engineer" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the role requirements and responsibilities..." className="min-h-32" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormLabel>Job Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Tags</label>
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <TagInput value={field.value || []} onChange={field.onChange} aria-describedby="tags-help" />
                  )}
                />
                <p id="tags-help" className="text-xs text-muted-foreground">
                  Add keywords like stack, seniority, location, or team (e.g., react, senior, remote).
                </p>
                {form.formState.errors.tags && (
                  <p className="text-sm text-destructive">{form.formState.errors.tags.message as string}</p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </form>
    </Dialog>
  )
}
