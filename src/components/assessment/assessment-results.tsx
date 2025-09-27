import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Award, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Assessment, AssessmentResponse } from '@/types/assessment';
import db from '@/services/db';

interface AssessmentResultsProps {
  assessment: Assessment;
  onBack: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  onBack
}) => {
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<AssessmentResponse | null>(null);

  useEffect(() => {
    loadResponses();
  }, [assessment.id]);

  const loadResponses = async () => {
    try {
      const allResponses = await db.responses
        .orderBy('[assessmentId+submittedAt]')
        .filter(response => response.assessmentId === assessment.id)
        .reverse()
        .toArray();
      setResponses(allResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = (questionId: string) => {
    for (const section of assessment.sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  };

  const getOptionLabel = (questionId: string, value: string) => {
    const question = getQuestionById(questionId);
    if (!question || !question.options) return value;

    const option = question.options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const formatResponse = (questionId: string, response: any) => {
    const question = getQuestionById(questionId);
    if (!question) return 'N/A';

    if (question.type === 'multi-choice' && Array.isArray(response)) {
      return response.map(value => getOptionLabel(questionId, value)).join(', ');
    }

    if (question.type === 'single-choice') {
      return getOptionLabel(questionId, response);
    }

    if (question.type === 'file-upload') {
      return response instanceof File ? response.name : 'File uploaded';
    }

    return String(response || 'No answer');
  };

  const isCorrectAnswer = (questionId: string, response: any) => {
    const question = getQuestionById(questionId);
    if (!question || !question.correctAnswer) return null;

    if (question.type === 'single-choice' || question.type === 'numeric') {
      return response === question.correctAnswer;
    }

    if (question.type === 'multi-choice') {
      const userAnswers = Array.isArray(response) ? response.sort() : [];
      const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer.sort() : [];
      return JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
    }

    return null; // For text questions, we don't have automatic grading
  };

  const getAverageScore = () => {
    if (responses.length === 0) return 0;
    const totalScore = responses.reduce((sum, response) => sum + (response.score || 0), 0);
    return Math.round(totalScore / responses.length);
  };

  const getPassRate = () => {
    if (responses.length === 0) return 0;
    const maxScore = assessment.sections
      .flatMap(section => section.questions)
      .filter(q => ['single-choice', 'multi-choice', 'numeric'].includes(q.type))
      .reduce((total, q) => total + (q.points || 1), 0);

    const passThreshold = maxScore * 0.6; // 60% pass rate
    const passedCount = responses.filter(response => (response.score || 0) >= passThreshold).length;
    return Math.round((passedCount / responses.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (selectedResponse) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8 px-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <button
              onClick={() => setSelectedResponse(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Results List</span>
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Detailed Response</h1>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{selectedResponse.candidateName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{selectedResponse.candidateEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedResponse.submittedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedResponse.score}/{selectedResponse.maxScore}
                </div>
                <div className="text-gray-600">
                  {Math.round(((selectedResponse.score || 0) / (selectedResponse.maxScore || 1)) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Responses */}
          <div className="space-y-6">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Section {sectionIndex + 1}: {section.title}
                </h2>

                <div className="space-y-4">
                  {section.questions.map((question, questionIndex) => {
                    const response = selectedResponse.responses[question.id];
                    const isCorrect = isCorrectAnswer(question.id, response);

                    return (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              Q{questionIndex + 1}. {question.title}
                            </h4>
                            {question.description && (
                              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                            )}
                          </div>
                          {isCorrect !== null && (
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${isCorrect
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {isCorrect ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-md p-3">
                          <p className="text-sm text-gray-600 mb-1">Candidate's Answer:</p>
                          <p className="text-gray-900 font-medium">
                            {response ? formatResponse(question.id, response) : 'No answer provided'}
                          </p>
                        </div>

                        {question.correctAnswer && (
                          <div className="mt-3 bg-green-50 rounded-md p-3">
                            <p className="text-sm text-green-600 mb-1">Correct Answer:</p>
                            <p className="text-green-800 font-medium">
                              {formatResponse(question.id, question.correctAnswer)}
                            </p>
                          </div>
                        )}

                        {question.points && (
                          <div className="mt-2 text-sm text-gray-600">
                            Points: {question.points} |
                            Earned: {isCorrect ? question.points : 0}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assessments</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Results</h1>
              <p className="text-gray-600">{assessment.title} - {assessment.jobTitle}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Submissions</div>
              <div className="text-3xl font-bold text-chart-1">{responses.length}</div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-chart-1/15 rounded-lg">
                <FileText className="w-6 h-6 text-chart-1" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-chart-2/15 rounded-lg">
                <Award className="w-6 h-6 text-chart-2" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{getAverageScore()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-chart-3/15 rounded-lg">
                <CheckCircle className="w-6 h-6 text-chart-3" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-gray-900">{getPassRate()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-chart-4/15 rounded-lg">
                <Clock className="w-6 h-6 text-chart-4" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Latest Submission</p>
                <p className="text-sm font-bold text-gray-900">
                  {responses.length > 0
                    ? responses[0].submittedAt.toLocaleDateString()
                    : 'No submissions'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        {responses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h2>
            <p className="text-gray-600">
              Once candidates start taking this assessment, their results will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Candidate Submissions</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.map((response) => {
                    const percentage = Math.round(((response.score || 0) / (response.maxScore || 1)) * 100);

                    return (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {response.candidateName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{response.candidateEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {response.score}/{response.maxScore}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${percentage >= 80
                            ? 'bg-green-100 text-green-800'
                            : percentage >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {response.submittedAt.toLocaleDateString()} at{' '}
                          {response.submittedAt.toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedResponse(response)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
