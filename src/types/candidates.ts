export type Stage = "applied" | "screening" | "rejected" | "hired"
export type ColumnId = Stage

export type Candidate = {
  id: string
  email: string
  name: string
  jobRole: string
  stage: Stage
  appliedDate: string
  specialNote?: string
}
