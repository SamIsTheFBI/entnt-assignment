export interface Question {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  validation?: ValidationRule;
  conditionalLogic?: ConditionalLogic;
  correctAnswer?: string | string[] | number;
  points?: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface ValidationRule {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface ConditionalLogic {
  dependsOn?: string;
  condition?: 'equals' | 'not-equals' | 'contains';
  value?: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Assessment {
  id: string;
  jobTitle: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateName: string;
  candidateEmail: string;
  responses: { [questionId: string]: string | string[] | number | File };
  score?: number;
  maxScore?: number;
  submittedAt: Date;
}
