import { assessmentHandlers } from "./assessment-handlers";
import { jobHandlers } from "./job-handlers";

export const handlers = [
  ...jobHandlers,
  ...assessmentHandlers
]
