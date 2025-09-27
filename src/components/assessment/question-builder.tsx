import React, { useState } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import type { ConditionalLogic, Question, QuestionOption, ValidationRule } from '@/types/assessment';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface QuestionBuilderProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  availableQuestions: Question[];
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question,
  onUpdate,
  onDelete,
  availableQuestions
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateQuestion = (updates: Partial<Question>) => {
    onUpdate({ ...question, ...updates });
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      label: `Option ${(question.options?.length || 0) + 1}`,
      value: `option-${(question.options?.length || 0) + 1}`
    };
    updateQuestion({
      options: [...(question.options || []), newOption]
    });
  };

  const updateOption = (optionId: string, updates: Partial<QuestionOption>) => {
    const updatedOptions = question.options?.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );
    updateQuestion({ options: updatedOptions });
  };

  const removeOption = (optionId: string) => {
    const updatedOptions = question.options?.filter(opt => opt.id !== optionId);
    updateQuestion({ options: updatedOptions });
  };

  const updateValidation = (validation: Partial<ValidationRule>) => {
    updateQuestion({
      validation: { ...question.validation, ...validation }
    });
  };

  const updateConditionalLogic = (conditional: Partial<ConditionalLogic>) => {
    updateQuestion({
      conditionalLogic: { ...question.conditionalLogic, ...conditional }
    });
  };

  const needsOptions = ['single-choice', 'multi-choice'].includes(question.type);
  const needsCorrectAnswer = ['single-choice', 'multi-choice', 'numeric'].includes(question.type);

  return (
    <div className="bg-white px-4 pb-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={question.type}
            onValueChange={(e) => updateQuestion({ type: e as Question['type'] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single-choice">Single Choice</SelectItem>
              <SelectItem value="multi-choice">Multiple Choice</SelectItem>
              <SelectItem value="short-text">Short Text</SelectItem>
              <SelectItem value="long-text">Long Text</SelectItem>
              <SelectItem value="numeric">Numeric</SelectItem>
              <SelectItem value="file-upload">File Upload</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors hidden"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <Button
          onClick={onDelete}
          variant="ghost"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Title *
          </label>
          <Input
            type="text"
            value={question.title}
            onChange={(e) => updateQuestion({ title: e.target.value })}
            placeholder="Enter your question..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            value={question.description || ''}
            onChange={(e) => updateQuestion({ description: e.target.value })}
            rows={2}
            placeholder="Additional context or instructions..."
            className="min-h-32"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <Input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion({ required: e.target.checked })}
            />
            <span className="ml-2 text-sm text-gray-700">Required</span>
          </label>

          {needsCorrectAnswer && (
            <div className="flex items-center space-x-2">
              <Label>Points:</Label>
              <Input
                type="number"
                value={question.points || 1}
                onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
          )}
        </div>

        {needsOptions && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Options</label>
              <Button
                onClick={addOption}
                variant="secondary"
              >
                <Plus className="w-4 h-4" />
                Add Option
              </Button>
            </div>

            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                  <Input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(option.id, { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    onClick={() => removeOption(option.id)}
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {needsCorrectAnswer && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer *
            </label>
            {question.type === 'single-choice' && (
              <>
                <Select value={question.correctAnswer as string || ''}
                  onValueChange={(e) => updateQuestion({ correctAnswer: e })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.map(option => (
                      <SelectItem key={option.id} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            {question.type === 'multi-choice' && (
              <div className="space-y-2">
                {question.options?.map(option => (
                  <label key={option.id} className="flex items-center">
                    <Input
                      type="checkbox"
                      checked={(question.correctAnswer as string[] || []).includes(option.value)}
                      onChange={(e) => {
                        const currentAnswers = question.correctAnswer as string[] || [];
                        const newAnswers = e.target.checked
                          ? [...currentAnswers, option.value]
                          : currentAnswers.filter(a => a !== option.value);
                        updateQuestion({ correctAnswer: newAnswers });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
            {question.type === 'numeric' && (
              <Input
                type="number"
                value={question.correctAnswer as number || ''}
                onChange={(e) => updateQuestion({ correctAnswer: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter correct numeric answer..."
              />
            )}
          </div>
        )}

        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Advanced Settings</h4>

            {/* Validation Rules */}
            <div className="grid grid-cols-2 gap-4">
              {(question.type === 'short-text' || question.type === 'long-text') && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Min Length</label>
                    <Input
                      type="number"
                      value={question.validation?.minLength || ''}
                      onChange={(e) => updateValidation({ minLength: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Max Length</label>
                    <Input
                      type="number"
                      value={question.validation?.maxLength || ''}
                      onChange={(e) => updateValidation({ maxLength: parseInt(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {question.type === 'numeric' && (
                <>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Min Value</label>
                    <Input
                      type="number"
                      value={question.validation?.min || ''}
                      onChange={(e) => updateValidation({ min: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Max Value</label>
                    <Input
                      type="number"
                      value={question.validation?.max || ''}
                      onChange={(e) => updateValidation({ max: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditional Logic
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={question.conditionalLogic?.dependsOn || ''}
                  onValueChange={(e) => updateConditionalLogic({ dependsOn: e || "" })}
                >
                  <SelectItem value="">No dependency</SelectItem>
                  {availableQuestions
                    .filter(q => q.id !== question.id)
                    .map(q => (
                      <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
                    ))}
                </Select>
                {question.conditionalLogic?.dependsOn &&
                  <>
                    <select
                      value={question.conditionalLogic?.condition || 'equals'}
                      onChange={(e) => updateConditionalLogic({ condition: e.target.value as ConditionalLogic['condition'] })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!question.conditionalLogic?.dependsOn}
                    >
                      <option value="equals">Equals</option>
                      <option value="not-equals">Not Equals</option>
                      <option value="contains">Contains</option>
                    </select>
                    <Input
                      type="text"
                      value={question.conditionalLogic?.value || ''}
                      onChange={(e) => updateConditionalLogic({ value: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Value"
                      disabled={!question.conditionalLogic?.dependsOn}
                    />
                  </>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
