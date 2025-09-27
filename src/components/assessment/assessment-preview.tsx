import React, { useState } from 'react';
import { FileText, Clock } from 'lucide-react';
import type { Assessment, Question } from '@/types/assessment';

interface AssessmentPreviewProps {
  assessment: Assessment;
  readOnly?: boolean;
}

export const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  assessment,
  readOnly = true
}) => {
  const [responses, setResponses] = useState<{ [questionId: string]: string | string[] | number }>({});

  const updateResponse = (questionId: string, value: string | string[] | number) => {
    if (!readOnly) {
      setResponses(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;

    let dependentResponse, targetValue
    if (question.conditionalLogic.dependsOn) {
      dependentResponse = responses[question.conditionalLogic.dependsOn];
    }
    const condition = question.conditionalLogic.condition;
    if (question.conditionalLogic.value) {
      targetValue = question.conditionalLogic.value;
    }

    if (dependentResponse === undefined) return false;

    switch (condition) {
      case 'equals':
        return dependentResponse === targetValue;
      case 'not-equals':
        return dependentResponse !== targetValue;
      case 'contains':
        return String(dependentResponse).includes(String(targetValue));
      default:
        return true;
    }
  };

  const renderQuestion = (question: Question) => {
    const isVisible = shouldShowQuestion(question);
    if (!isVisible) return null;

    return (
      <div key={question.id} className="mb-8">
        <div className="mb-3">
          <h4 className="text-lg font-medium text-gray-900">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
            {question.points && (
              <span className="ml-2 text-sm text-gray-500">({question.points} point{question.points > 1 ? 's' : ''})</span>
            )}
          </h4>
          {question.description && (
            <p className="text-sm text-gray-600 mt-1">{question.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {question.type === 'single-choice' && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={responses[question.id] === option.value}
                    onChange={(e) => updateResponse(question.id, e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                    disabled={readOnly}
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'multi-choice' && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={(responses[question.id] as string[] || []).includes(option.value)}
                    onChange={(e) => {
                      const current = responses[question.id] as string[] || [];
                      const newValue = e.target.checked
                        ? [...current, option.value]
                        : current.filter(v => v !== option.value);
                      updateResponse(question.id, newValue);
                    }}
                    className="mr-3 rounded text-blue-600 focus:ring-blue-500"
                    disabled={readOnly}
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'short-text' && (
            <input
              type="text"
              value={responses[question.id] as string || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your answer..."
              maxLength={question.validation?.maxLength}
              minLength={question.validation?.minLength}
              disabled={readOnly}
            />
          )}

          {question.type === 'long-text' && (
            <textarea
              value={responses[question.id] as string || ''}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              placeholder="Enter your detailed answer..."
              maxLength={question.validation?.maxLength}
              minLength={question.validation?.minLength}
              disabled={readOnly}
            />
          )}

          {question.type === 'numeric' && (
            <input
              type="number"
              value={responses[question.id] as number || ''}
              onChange={(e) => updateResponse(question.id, parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a number..."
              min={question.validation?.min}
              max={question.validation?.max}
              disabled={readOnly}
            />
          )}

          {question.type === 'file-upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">File upload functionality</p>
              <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
              <input
                type="file"
                className="hidden"
                disabled={readOnly}
              />
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={readOnly}
              >
                Choose File
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTotalQuestions = () => {
    return assessment.sections.reduce((total, section) => total + section.questions.length, 0);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/65 rounded-t-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{assessment.title}</h1>
        <p className="mb-4">Job Position: {assessment.jobTitle}</p>
        {assessment.description && (
          <p className="text-lg">{assessment.description}</p>
        )}

        <div className="flex items-center space-x-6 mt-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{getTotalQuestions()} Questions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>~{Math.ceil(getTotalQuestions() * 2)} Minutes</span>
          </div>
        </div>
      </div>

      {/* Assessment Content */}
      <div className="bg-white rounded-b-lg border border-gray-200 p-8">
        {assessment.sections.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sections or questions added yet.</p>
            <p className="text-gray-400">Add sections and questions in the builder to see them here.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {assessment.sections.map((section, index) => (
              <div key={section.id}>
                <div className="border-b border-gray-200 pb-4 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Section {index + 1}: {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600 mt-2">{section.description}</p>
                  )}
                </div>

                <div className="space-y-8">
                  {section.questions.map((question) => renderQuestion(question))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
