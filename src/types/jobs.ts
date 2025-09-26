export type JobStatus = 'active' | 'archived';

export type Job = {
  id: string
  title: string
  slug: string
  status: JobStatus
  tags: string[]
  order: number
}
