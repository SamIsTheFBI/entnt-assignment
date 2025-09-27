import { AssessmentTaker } from '@/components/assessment/assessment-taker'
import type { Assessment } from '@/types/assessment'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useState } from 'react'

export const Route = createFileRoute('/take-assessment')({
  component: RouteComponent,
  validateSearch: (search) => {
    return {
      assessmentId: (search.assessmentId as string) || ""
    }
  }
})

function RouteComponent() {
  const { assessmentId } = Route.useSearch()
  const [assessment, setAssessment] = useState<Assessment | null>(null)

  const fetchAssessmentById = async () => {
    const res = await axios.get<Assessment>("/api/assessment/" + assessmentId, {
      params: {
      }
    })

    setAssessment(res.data)
    return res.data
  }

  useQuery({
    queryKey: ['get-assessment-by-id'],
    queryFn: fetchAssessmentById,
    enabled: !!assessmentId
  })
  if (assessment) {
    return (
      <>
        <AssessmentTaker
          assessment={assessment}
        />
      </>
    )
  }
}
