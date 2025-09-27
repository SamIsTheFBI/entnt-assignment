import type { Assessment } from "@/types/assessment";
import db from "../db";

export interface GetAllAssessmentsParams {
  search?: string;
  jobTitle?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'jobTitle';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface GetAllAssessmentsResult {
  data: Assessment[];
  total: number;
  page: number;
  pageSize: number;
}

export const createAssessment = async (assessment: Assessment) => {
  return await db.assessments.add(assessment);
}

export const getAssessmentById = async (id: string) => {
  return await db.assessments.get(id);
}

export const getAllAssessments = async ({
  search,
  jobTitle,
  page,
  pageSize,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  dateFrom,
  dateTo
}: GetAllAssessmentsParams) => {

  let query = db.assessments.orderBy(sortBy);

  let assessments = await query.toArray();

  if (jobTitle && jobTitle !== 'all') {
    assessments = assessments.filter(assessment =>
      assessment.jobTitle === jobTitle
    );
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    assessments = assessments.filter(assessment =>
      assessment.title.toLowerCase().includes(searchTerm) ||
      assessment.jobTitle.toLowerCase().includes(searchTerm) ||
      assessment.description?.toLowerCase().includes(searchTerm)
    );
  }

  if (dateFrom || dateTo) {
    assessments = assessments.filter(assessment => {
      const createdAt = new Date(assessment.createdAt);
      const isAfterFrom = !dateFrom || createdAt >= dateFrom;
      const isBeforeTo = !dateTo || createdAt <= dateTo;
      return isAfterFrom && isBeforeTo;
    });
  }

  assessments.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'createdAt':
      case 'updatedAt':
        aValue = new Date(a[sortBy]).getTime();
        bValue = new Date(b[sortBy]).getTime();
        break;
      case 'title':
      case 'jobTitle':
        aValue = a[sortBy].toLowerCase();
        bValue = b[sortBy].toLowerCase();
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }

    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    } else {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
  });

  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: assessments.slice(start, end),
      total: assessments.length,
      page: page,
      pageSize: pageSize
    };
  }

  return {
    data: assessments,
    total: assessments.length,
    page: 1,
    pageSize: assessments.length
  };
};

export const updateAssessment = async (id: string, updates: Partial<Omit<Assessment, 'id' | 'createdAt'>>) => {
  await db.assessments.update(id, {
    ...updates,
    updatedAt: new Date(),
  });

  return db.assessments.get(id);
}

export const deleteAssessment = async (id: string) => {
  await db.transaction('rw', [db.assessments, db.responses], async () => {
    await db.responses.where('assessmentId').equals(id).delete();
    await db.assessments.delete(id);
  });
}
