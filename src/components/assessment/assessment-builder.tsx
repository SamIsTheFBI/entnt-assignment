import React, { useState } from 'react';
import { Plus, Save, Eye, EyeOff, FileText } from 'lucide-react';
import type { Assessment, AssessmentSection, Question } from '@/types/assessment';
import { QuestionBuilder } from './question-builder';
import { AssessmentPreview } from './assessment-preview';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';

interface AssessmentBuilderProps {
  assessmentId?: string;
  onSave?: (assessment: Assessment) => void;
}

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  assessmentId,
}) => {
  const [assessment, setAssessment] = useState<Assessment>({
    id: crypto.randomUUID(),
    jobTitle: '',
    title: '',
    description: '',
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate()

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

  const updateAssessment = (updates: Partial<Assessment>) => {
    setAssessment(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: `Section ${assessment?.sections?.length + 1}`,
      questions: []
    };
    updateAssessment({
      sections: [...assessment.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<AssessmentSection>) => {
    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    updateAssessment({ sections: updatedSections });
  };

  const removeSection = (sectionId: string) => {
    const updatedSections = assessment.sections.filter(section => section.id !== sectionId);
    updateAssessment({ sections: updatedSections });
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'short-text',
      title: 'New Question',
      required: false,
      points: 1
    };

    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId
        ? { ...section, questions: [...section.questions, newQuestion] }
        : section
    );
    updateAssessment({ sections: updatedSections });
  };

  const updateQuestion = (sectionId: string, questionId: string, updatedQuestion: Question) => {
    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId
        ? {
          ...section,
          questions: section.questions.map(q =>
            q.id === questionId ? updatedQuestion : q
          )
        }
        : section
    );
    updateAssessment({ sections: updatedSections });
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    const updatedSections = assessment.sections.map(section =>
      section.id === sectionId
        ? {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        }
        : section
    );
    updateAssessment({ sections: updatedSections });
  };

  const getAllQuestions = (): Question[] => {
    return assessment?.sections?.flatMap(section => section.questions);
  };

  const saveAssessment = async () => {
    if (!assessment.jobTitle || !assessment.title) {
      alert('Please fill in the job title and assessment title');
      return;
    }

    setSaving(true);
    try {
      if (assessmentId) {
        await axios.patch('/api/assessment/' + assessmentId, assessment)
      } else {
        await axios.post('/api/assessment', assessment)
        navigate({ to: "/dashboard/assessments" })
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const getTotalPoints = () => {
    return getAllQuestions()
      ?.filter(q => ['single-choice', 'multi-choice', 'numeric'].includes(q.type))
      ?.reduce((total, q) => total + (q.points || 1), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">Assessment Builder</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Total Points: <span className="font-semibold">{getTotalPoints()}</span>
              </div>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="secondary"
                className={showPreview
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-primary/10 text-primary'
                }
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </Button>
              <Button
                onClick={saveAssessment}
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Assessment'}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={assessment.jobTitle}
                onChange={(e) => updateAssessment({ jobTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Senior Frontend Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => updateAssessment({ title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Technical Skills Assessment"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={assessment.description}
              onChange={(e) => updateAssessment({ description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Provide an overview of what this assessment covers..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Builder Pane */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Sections & Questions</h2>
              <Button
                onClick={addSection}
              >
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
            </div>

            <div className="space-y-6">
              {assessment?.sections?.map((section) => (
                <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="text-lg font-semibold bg-transparent border-0 border-b border-gray-300 focus:border-blue-500 focus:ring-0 px-0"
                    />
                    <Button
                      onClick={() => removeSection(section.id)}
                      variant="destructive"
                    >
                      Remove Section
                    </Button>
                  </div>

                  <textarea
                    value={section.description || ''}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                    rows={2}
                    placeholder="Section description..."
                  />

                  <div className="space-y-4 divide-y divide-muted-foreground/15">
                    {section.questions.map((question) => (
                      <QuestionBuilder
                        key={question.id}
                        question={question}
                        onUpdate={(updatedQuestion) => updateQuestion(section.id, question.id, updatedQuestion)}
                        onDelete={() => removeQuestion(section.id, question.id)}
                        availableQuestions={getAllQuestions().filter(q => q.id !== question.id)}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={() => addQuestion(section.id)}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>
              ))}

              {assessment?.sections?.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No sections yet. Get started by adding your first section.</p>
                  <Button
                    onClick={addSection}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Section</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Pane */}
          {showPreview && (
            <div className="lg:sticky lg:top-6 lg:h-fit">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Preview</h2>
                <AssessmentPreview assessment={assessment} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
