import { getAllCandidatesFiltered } from "@/services/db-queries/candidates";
import { http, HttpResponse } from "msw";

export const candidateHandlers = [
  http.get('/api/candidates', async ({ request }) => {
    const url = new URL(request.url)
    const stage = url.searchParams.get('stage') || '';
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    try {
      const result = await getAllCandidatesFiltered({
        search,
        stage,
        page,
        pageSize
      })
      return HttpResponse.json(result);
    } catch (error) {
      return new HttpResponse('Failed to fetch assessments.', { status: 500 })
    }
  })
]
