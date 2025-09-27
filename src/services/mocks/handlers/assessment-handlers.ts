import { createAssessment, deleteAssessment, getAllAssessments, getAssessmentById, updateAssessment } from "@/services/db-queries/assessment";
import type { Assessment } from "@/types/assessment";
import { http, HttpResponse } from "msw";

export const assessmentHandlers = [
  http.get('/api/assessment', async ({ request }) => {
    const url = new URL(request.url)
    const jobTitle = url.searchParams.get('jobTitle') || '';
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    try {
      const result = await getAllAssessments({
        search,
        jobTitle,
        page,
        pageSize
      })
      return HttpResponse.json(result);
    } catch (error) {
      return new HttpResponse('Failed to fetch assessments.', { status: 500 })
    }
  }),

  http.get('/api/assessment/:id', async ({ params }) => {
    try {
      const { id } = params;
      if (!id) {
        throw new Error("ID not passed")
      }

      const assessment = await getAssessmentById(String(id))

      return HttpResponse.json(assessment)
    } catch (error) {
      return new HttpResponse("Failed to get assessment.", { status: 500 })
    }
  }),

  http.post('/api/assessment', async ({ request }) => {
    try {
      const assessment = await request.json() as Assessment

      const newJob = await createAssessment(assessment)
      return HttpResponse.json(newJob, { status: 201 })
    } catch (error) {
      return new HttpResponse('Failed to create assessment', { status: 500 })
    }
  }),

  http.patch('/api/assessment/:id', async ({ request, params }) => {
    try {
      const { id } = params
      const assessment = await request.json() as Partial<Assessment>

      if (!id) {
        throw new Error("ID not passed")
      }

      const newAssessment = await updateAssessment(String(id), assessment)
      return HttpResponse.json(newAssessment, { status: 200 })
    } catch (error) {
      return new HttpResponse('Failed to create assessment', { status: 500 })
    }
  }),

  http.delete('/api/assessment/:id', async ({ params }) => {
    try {
      const { id } = params;
      if (!id) {
        throw new Error("ID not passed")
      }

      await deleteAssessment(String(id))
      return new HttpResponse("Successfully deleted assessment.", { status: 204 })
    } catch (error) {
      return new HttpResponse("Failed to update assessment. " + String(error), { status: 500 })
    }
  })
]
