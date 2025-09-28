import db from "@/services/db"
import type { Candidate, Stage } from "@/types/candidates"
import { generateFakeCandidate } from "../seed";

export async function seedIfEmpty() {
  const count = await db.candidates.count()
  if (count > 0) return

  let i = 50
  while (i -= 1) {
    const candidate = generateFakeCandidate()
    await db.candidates.add(candidate)
  }
}

export interface GetAllCandidatesParams {
  search?: string;
  stage?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'id' | 'email' | 'stage' | 'appliedDate';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface GetAllCandidatesResult {
  data: Candidate[];
  total: number;
  page: number;
  pageSize: number;
}

export const getAllCandidatesFiltered = async ({
  search,
  stage,
  page,
  pageSize,
  sortBy = 'appliedDate',
  dateFrom,
  dateTo
}: GetAllCandidatesParams) => {

  let query = db.candidates.orderBy(sortBy);
  let candidates = await query.toArray();

  if (stage && stage !== 'all') {
    candidates = candidates.filter(candidate =>
      candidate.stage === stage
    );
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    candidates = candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm)
    );
  }

  if (dateFrom || dateTo) {
    candidates = candidates.filter(candidate => {
      const appliedDate = new Date(candidate.appliedDate);
      const isAfterFrom = !dateFrom || appliedDate >= dateFrom;
      const isBeforeTo = !dateTo || appliedDate <= dateTo;
      return isAfterFrom && isBeforeTo;
    });
  }

  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: candidates.slice(start, end),
      total: candidates.length,
      page: page,
      pageSize: pageSize
    };
  }

  return {
    data: candidates,
    total: candidates.length,
    page: 1,
    pageSize: candidates.length
  };
};

export async function getAllCandidates(): Promise<Candidate[]> {
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

