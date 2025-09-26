import { z } from "zod";

export const JobStatusSchema = z.enum(["active", "archived"]);
export const JobTypeSchema = z.enum(["full-time", "remote", "part-time"]);

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().default(""),
  jobType: JobTypeSchema,
  slug: z.string(),
  status: JobStatusSchema,
  tags: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Job = z.infer<typeof JobSchema>;
export type JobStatus = z.infer<typeof JobStatusSchema>;
export type JobType = z.infer<typeof JobTypeSchema>;
