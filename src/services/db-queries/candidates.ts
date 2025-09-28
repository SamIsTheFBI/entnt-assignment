import db from "@/services/db"
import type { Candidate, Stage } from "@/types/candidates"

export async function seedIfEmpty() {
  const count = await db.candidates.count()
  if (count > 0) return
  const now = new Date()
  const toISO = (d: Date) => d.toISOString()
  await db.candidates.bulkAdd([
    {
      id: crypto.randomUUID(),
      email: "jane.doe@example.com",
      name: "Jane Doe",
      jobRole: "Frontend Engineer",
      stage: "applied",
      appliedDate: toISO(now),
      specialNote: "",
    },
    {
      id: crypto.randomUUID(),
      email: "alex.smith@example.com",
      name: "Alex Smith",
      jobRole: "Backend Engineer",
      stage: "screening",
      appliedDate: toISO(new Date(now.getTime() - 86400000)),
      specialNote: "Strong in Node.js",
    },
    {
      id: crypto.randomUUID(),
      email: "riley.lee@example.com",
      name: "Riley Lee",
      jobRole: "Product Manager",
      stage: "rejected",
      appliedDate: toISO(new Date(now.getTime() - 2 * 86400000)),
      specialNote: "",
    },
    {
      id: crypto.randomUUID(),
      email: "sam.kim@example.com",
      name: "Sam Kim",
      jobRole: "Designer",
      stage: "hired",
      appliedDate: toISO(new Date(now.getTime() - 3 * 86400000)),
      specialNote: "Great portfolio",
    },
  ])
}

export async function getAllCandidates(): Promise<Candidate[]> {
  // Order by appliedDate asc for stability
  return await db.candidates.orderBy("appliedDate").toArray()
}

export async function moveCandidateStage(id: string, stage: Stage) {
  await db.candidates.update(id, { stage })
}

export async function updateCandidateNote(id: string, specialNote: string) {
  await db.candidates.update(id, { specialNote })
}

export async function upsertCandidate(c: Candidate) {
  const existing = await db.candidates.where("id").equals(c.id).first()
  if (existing) {
    await db.candidates.update(existing.id!, { ...existing, ...c })
    return existing.id!
  }
  return await db.candidates.add(c)
}

