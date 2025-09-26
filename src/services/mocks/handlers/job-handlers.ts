import { createJob, getAllJobs, updateJob } from '@/services/db-queries/jobs';
import { JobSchema, type Job } from '@/types/jobs';
import { http, HttpResponse } from 'msw'

export const jobHandlers = [
  http.get('/api/jobs', async ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    try {
      const result = await getAllJobs({ search, status, page, pageSize })
      return HttpResponse.json(result);
    } catch (error) {
      return new HttpResponse('Failed to fetch jobs', { status: 500 })
    }
  }),

  http.post('/api/jobs', async ({ request }) => {
    try {
      const jobData = await request.json() as Omit<Job, 'id' | 'slug' | 'status'>;

      const newJob = await createJob(jobData)
      return HttpResponse.json(newJob, { status: 201 })
    } catch (error) {
      return new HttpResponse('Failed to create job', { status: 500 })
    }
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    try {
      const { id } = params;
      const updates = await request.json()
      const validatedUpdates = JobSchema.partial().parse(updates);

      const updatedJob = await updateJob(String(id), validatedUpdates)

      return HttpResponse.json(updatedJob)
    } catch (error) {
      return new HttpResponse("Failed to update job.", { status: 500 })
    }
  }),
];
