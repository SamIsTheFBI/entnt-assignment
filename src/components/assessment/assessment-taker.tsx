import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Clock, CheckCircle, FileText, Award } from 'lucide-react';
import type { Assessment, AssessmentResponse, Question } from '@/types/assessment';
import db from '@/services/db';
import { Button } from '../ui/button';

interface AssessmentTakerProps {
  assessment: Assessment;
  onComplete?: (response: AssessmentResponse) => void;
}

export const AssessmentTaker: React.FC<AssessmentTakerProps> = ({
  assessment,
  onComplete
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [startTime] = useState(new Date());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [candidateInfo, setCandidateInfo] = useState({ name: '', email: '' });
  const [showCandidateForm, setShowCandidateForm] = useState(true);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchedValues = watch();

  useEffect(() => {
    // Calculate max possible score
    const totalPoints = assessment.sections
      .flatMap(section => section.questions)
      .filter(q => ['single-choice', 'multi-choice', 'numeric'].includes(q.type))
      .reduce((total, q) => total + (q.points || 1), 0);
    setMaxScore(totalPoints);
  }, [assessment]);

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic) return true;

    let dependentResponse, targetValue
    if (question.conditionalLogic.dependsOn) {
      dependentResponse = watchedValues[question.conditionalLogic.dependsOn];
    }
    const condition = question.conditionalLogic.condition;
    if (question.conditionalLogic.value) {
      targetValue = question.conditionalLogic.value;
    }

    if (dependentResponse === undefined || dependentResponse === null) return false;

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

  const calculateScore = (responses: any): number => {
    let earnedPoints = 0;

    assessment.sections.forEach(section => {
      section.questions.forEach(question => {
        if (!['single-choice', 'multi-choice', 'numeric'].includes(question.type)) return;
        if (!question.correctAnswer) return;

        const userAnswer = responses[question.id];
        const correctAnswer = question.correctAnswer;
        const points = question.points || 1;

        let isCorrect = false;

        if (question.type === 'single-choice' || question.type === 'numeric') {
          isCorrect = userAnswer === correctAnswer;
        } else if (question.type === 'multi-choice') {
          const userAnswers = Array.isArray(userAnswer) ? userAnswer.sort() : [];
          const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer.sort() : [];
          isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
        }

        if (isCorrect) {
          earnedPoints += points;
        }
      });
    });

    return earnedPoints;
  };

  const onSubmit = async (data: any) => {
    const calculatedScore = calculateScore(data);
    setScore(calculatedScore);

    const response: AssessmentResponse = {
      id: crypto.randomUUID(),
      assessmentId: assessment.id,
      candidateName: candidateInfo.name,
      candidateEmail: candidateInfo.email,
      responses: data,
      score: calculatedScore,
      maxScore: maxScore,
      submittedAt: new Date()
    };

    try {
      await db.responses.put(response);
      setIsSubmitted(true);
      onComplete?.(response);
    } catch (error) {
      console.error('Error saving response:', error);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  const renderQuestion = (question: Question) => {
    const isVisible = shouldShowQuestion(question);
    if (!isVisible) return null;

    const error = errors[question.id];

    return (
      <div key={question.id} className="mb-8">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
            {question.points && (
              <span className="ml-2 text-sm text-blue-600 font-medium">
                ({question.points} point{question.points > 1 ? 's' : ''})
              </span>
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
                <label key={option.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
                  <input
                    type="radio"
                    value={option.value}
                    {...register(question.id, {
                      required: question.required ? 'This question is required' : false
                    })}
                    className="mr-3 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'multi-choice' && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    value={option.value}
                    {...register(question.id, {
                      required: question.required ? 'Please select at least one option' : false
                    })}
                    className="mr-3 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'short-text' && (
            <input
              type="text"
              {...register(question.id, {
                required: question.required ? 'This question is required' : false,
                minLength: question.validation?.minLength ? {
                  value: question.validation.minLength,
                  message: `Minimum length is ${question.validation.minLength} characters`
                } : undefined,
                maxLength: question.validation?.maxLength ? {
                  value: question.validation.maxLength,
                  message: `Maximum length is ${question.validation.maxLength} characters`
                } : undefined
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your answer..."
            />
          )}

          {question.type === 'long-text' && (
            <textarea
              {...register(question.id, {
                required: question.required ? 'This question is required' : false,
                minLength: question.validation?.minLength ? {
                  value: question.validation.minLength,
                  message: `Minimum length is ${question.validation.minLength} characters`
                } : undefined,
                maxLength: question.validation?.maxLength ? {
                  value: question.validation.maxLength,
                  message: `Maximum length is ${question.validation.maxLength} characters`
                } : undefined
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows={5}
              placeholder="Enter your detailed answer..."
            />
          )}

          {question.type === 'numeric' && (
            <input
              type="number"
              {...register(question.id, {
                required: question.required ? 'This question is required' : false,
                min: question.validation?.min ? {
                  value: question.validation.min,
                  message: `Minimum value is ${question.validation.min}`
                } : undefined,
                max: question.validation?.max ? {
                  value: question.validation.max,
                  message: `Maximum value is ${question.validation.max}`
                } : undefined,
                valueAsNumber: true
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter a number..."
            />
          )}

          {question.type === 'file-upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Upload your file</p>
              <p className="text-sm text-gray-500 mb-4">Drag and drop files here or click to browse</p>
              <input
                type="file"
                {...register(question.id, {
                  required: question.required ? 'Please upload a file' : false
                })}
                className="hidden"
                id={`file-${question.id}`}
              />
              <label
                htmlFor={`file-${question.id}`}
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{String(error.message)}</p>
        )}
      </div>
    );
  };

  if (showCandidateForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-chart-1/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-chart-1" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start?</h1>
            <p className="text-gray-600">Please provide your information to begin the assessment.</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (candidateInfo.name && candidateInfo.email) {
              setShowCandidateForm(false);
            }
          }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={candidateInfo.name}
                onChange={(e) => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={candidateInfo.email}
                onChange={(e) => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <Button
              type="submit"
            >
              Start Assessment
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const percentage = maxScore > 0 ? Math.round((score! / maxScore) * 100) : 0;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h1>
          <p className="text-gray-600 mb-8">Thank you for taking the time to complete this assessment.</p>

          <div className="bg-primary/15 rounded-xl p-8 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Your Score</h2>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {score}/{maxScore}
              </div>
              <div className="text-xl text-gray-700 mb-2">
                {percentage}%
              </div>
              <div className="text-gray-600">
                {percentage >= 80 ? 'Excellent work!' :
                  percentage >= 60 ? 'Good job!' :
                    'Thanks for your effort!'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{assessment.sections.reduce((total, section) => total + section.questions.length, 0)}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{Math.ceil((new Date().getTime() - startTime.getTime()) / (1000 * 60))}</div>
              <div className="text-sm text-gray-600">Minutes Taken</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{assessment.sections.length}</div>
              <div className="text-sm text-gray-600">Sections Completed</div>
            </div>
          </div>

          <p className="text-gray-500">
            Your responses have been saved. You'll be contacted regarding next steps soon. <b>You may close this tab.</b>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
              <p className="text-gray-600">Position: {assessment.jobTitle}</p>
              {assessment.description && (
                <p className="text-gray-600 mt-2">{assessment.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-500 mb-2">
                <Clock className="w-5 h-5 mr-2" />
                <span>Started {startTime.toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                Section {currentSection + 1} of {assessment.sections.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / assessment.sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Assessment Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            {assessment.sections.map((section, sectionIndex) => (
              <div key={section.id} className={sectionIndex === currentSection ? 'block' : 'hidden'}>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600">{section.description}</p>
                  )}
                </div>

                <div className="space-y-8">
                  {section.questions.map((question) => renderQuestion(question))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              type="button"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous Section
            </button>

            <div className="text-sm text-gray-600">
              Section {currentSection + 1} of {assessment.sections.length}
            </div>

            {currentSection < assessment.sections.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Section
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
