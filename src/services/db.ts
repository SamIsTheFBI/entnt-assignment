import type { Assessment, AssessmentResponse } from "@/types/assessment";
import type { Job } from "@/types/jobs";
import Dexie, { type Table } from "dexie";

class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>
  assessments!: Table<Assessment>;
  responses!: Table<AssessmentResponse>;

  constructor() {
    super('TalentFlowDB')
    this.version(1).stores({
      jobs: 'id, &slug, title, jobType, description, status, *tags, createdAt, updatedAt',
      assessments: 'id, jobTitle, title, createdAt, updatedAt',
      responses: 'id, assessmentId, candidateName, candidateEmail, submittedAt, [assessmentId+submittedAt]'
    })
  }
}

const db = new TalentFlowDB()

export default db
