import type { Job } from "@/types/jobs";
import db from "../db";

interface GetAllJobsParams {
  search?: string;
  status?: string;
  jobType?: string;
  page?: number;
  pageSize?: number;
}

export const getAllJobs = async ({ search, status, jobType, page, pageSize }: GetAllJobsParams) => {
  let query = db.jobs.orderBy('createdAt');

  if (status) {
    query = query.filter(job => job.status === status);
  }

  if (jobType && jobType !== 'all') {
    query = query.filter(job => job.jobType === jobType);
  }


  if (search) {
    query = query.filter(job =>
      job.title.toLowerCase().includes(search!.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(search!.toLowerCase()))
    );
  }

  const jobs = await query.toArray();

  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: jobs.slice(start, end),
      total: jobs.length,
      page: page,
      pageSize: pageSize
    };
  }

  return { data: jobs, total: jobs.length, page: 1, pageSize: jobs.length };
};

export const createJob = async (jobData: Omit<Job, 'id' | 'slug' | 'status'>) => {
  const newJob: Job = {
    id: crypto.randomUUID(),
    title: jobData.title,
    slug: jobData.title.toLowerCase().replace(/\s+/g, '-').concat(`-${Date.now()}`),
    status: 'active',
    tags: jobData.tags || [],
    description: jobData.description || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    jobType: jobData.jobType
  };

  await db.jobs.add(newJob);
  return newJob
}

export const updateJob = async (id: string, updates: Partial<Job>) => {
  await db.jobs.update(id, updates);
  return db.jobs.get(id);
};

export const deleteJob = async (id: string) => {
  await db.jobs.delete(id);
};
