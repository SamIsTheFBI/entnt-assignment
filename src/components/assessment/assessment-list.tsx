import React from 'react';
import { Eye, Edit, Trash2, Calendar, FileText, BarChart3 } from 'lucide-react';
import type { Assessment } from '@/types/assessment';
import { Button } from '../ui/button';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

interface AssessmentListProps {
  onPreview: (assessment: Assessment) => void;
  onViewResults: (assessment: Assessment) => void;
}

export interface AssessmentsReceived {
  data: Assessment[];
  total: number;
  page: number;
  pageSize: number;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({
  onPreview,
  onViewResults
}) => {
  const fetchAssessments = async () => {
    const res = await axios.get<AssessmentsReceived>("/api/assessment", {
      params: {
      }
    })

    return res.data
  }

  const { data, isLoading } = useQuery({
    queryKey: ['list-assessments'],
    queryFn: fetchAssessments
  })

  const queryClient = useQueryClient()

  const deleteAssessment = async (assessment: Assessment) => {
    if (window.confirm(`Are you sure you want to delete "${assessment.title}"?`)) {
      try {
        await axios.delete('/api/assessment/' + assessment.id)
        queryClient.invalidateQueries({ queryKey: ['list-assessments'] })
        toast.success("Successfully deleted assessment")
      } catch (error) {
        console.error('Error deleting assessment:', error);
        alert('Failed to delete assessment');
        toast.error("Failed to delete assessment")
      }
    }
  };

  const getQuestionCount = (assessment: Assessment): number => {
    return assessment.sections.reduce((total, section) => total + section.questions.length, 0);
  };

  const getTotalPoints = (assessment: Assessment): number => {
    return assessment.sections
      .flatMap(section => section.questions)
      .filter(q => ['single-choice', 'multi-choice', 'numeric'].includes(q.type))
      .reduce((total, q) => total + (q.points || 1), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-chart-1/15 rounded-lg">
              <FileText className="w-6 h-6 text-chart-1" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{data && data.data?.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-chart-2/15 rounded-lg">
              <Calendar className="w-6 h-6 text-chart-2" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {data && data.data && data.data.filter(a => {
                  const thisMonth = new Date();
                  thisMonth.setDate(1);
                  return new Date(a.createdAt) >= thisMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-chart-3/15 rounded-lg">
              <FileText className="w-6 h-6 text-chart-3" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Questions</p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.data && data.data.length > 0
                  ? Math.round(data.data.reduce((total, a) => total + getQuestionCount(a), 0) / data.data.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {data && data.data?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Yet</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Get started by creating your first assessment. Build comprehensive evaluations
            with multiple question types and automatic scoring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {data && data.data && data.data.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {assessment.title}
                    </h3>
                    <p className="text-primary font-medium text-sm">{assessment.jobTitle}</p>
                  </div>
                </div>

                {assessment.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {assessment.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{assessment.sections.length} section{assessment.sections.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{getQuestionCount(assessment)} question{getQuestionCount(assessment) !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{getTotalPoints(assessment)} pts</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Updated {new Date(assessment.updatedAt).toLocaleDateString()}</span>
                  <span>Created {new Date(assessment.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link to={"/take-assessment" + "?assessmentId=" + assessment.id}>
                    <Button>
                      Take Assessment
                    </Button>
                  </Link>
                  <Button
                    onClick={() => onViewResults(assessment)}
                    variant="ghost"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onPreview(assessment)}
                    variant="ghost"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Link to={"/dashboard/edit-assessment" + "?assessmentId=" + assessment.id}>
                    <Button
                      variant="ghost"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link >
                  <Button
                    onClick={() => deleteAssessment(assessment)}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
