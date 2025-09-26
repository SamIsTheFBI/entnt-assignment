import type { Job } from "@/types/jobs";
import Dexie, { type Table } from "dexie";

class TalentFlowDB extends Dexie {
  jobs!: Table<Job, string>

  constructor() {
    super('TalentFlowDB')
    this.version(1).stores({
      jobs: 'id, &slug, title, status, *tags, order',
    })
  }
}

const db = new TalentFlowDB()

export default db
