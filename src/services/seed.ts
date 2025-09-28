import type { Assessment, AssessmentSection, Question, QuestionOption } from "@/types/assessment";
import type { Candidate, Stage } from "@/types/candidates";
import { JobSchema, JobStatusSchema, JobTypeSchema, type Job } from "@/types/jobs";
import { faker } from "@faker-js/faker";

const questionTypes: Question["type"][] = [
  "single-choice",
  "multi-choice",
  "short-text",
  "long-text",
  "numeric",
  "file-upload",
];

function generateFakeQuestionOption(): QuestionOption {
  return {
    id: faker.string.uuid(),
    label: faker.word.words(2),
    value: faker.word.noun(),
  };
}

function generateFakeQuestion(): Question {
  const type = faker.helpers.arrayElement(questionTypes);

  return {
    id: faker.string.uuid(),
    type,
    title: faker.lorem.sentence(),
    description: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    required: faker.datatype.boolean(),
    options: type === "single-choice" || type === "multi-choice"
      ? Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, generateFakeQuestionOption)
      : undefined,
    validation: faker.datatype.boolean()
      ? {
        minLength: faker.number.int({ min: 1, max: 5 }),
        maxLength: faker.number.int({ min: 6, max: 20 }),
        min: faker.number.int({ min: 1, max: 10 }),
        max: faker.number.int({ min: 20, max: 100 }),
        pattern: faker.helpers.arrayElement([undefined, "^[a-zA-Z0-9]+$"]),
      }
      : undefined,
    conditionalLogic: undefined,
    correctAnswer: faker.helpers.arrayElement([
      faker.lorem.word(),
      [faker.lorem.word(), faker.lorem.word()],
      faker.number.int({ min: 1, max: 10 }),
      undefined,
    ]),
    points: faker.number.int({ min: 1, max: 10 }),
  };
}

function generateFakeSection(): AssessmentSection {
  return {
    id: faker.string.uuid(),
    title: faker.commerce.department(),
    description: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    questions: Array.from({ length: faker.number.int({ min: 2, max: 6 }) }, generateFakeQuestion),
  };
}

export function generateFakeAssessment(): Assessment {
  return {
    id: faker.string.uuid(),
    jobTitle: faker.person.jobTitle(),
    title: faker.company.catchPhrase(),
    description: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined,
    sections: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, generateFakeSection),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}

export function generateFakeCandidate(): Candidate {
  const stages: Stage[] = ["applied", "screening", "rejected", "hired"];
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    jobRole: faker.person.jobTitle(),
    stage: faker.helpers.arrayElement(stages),
    appliedDate: faker.date.past().toISOString(),
    specialNote: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
  };
}

export function generateFakeJob(): Job {
  const fakeJob = {
    id: faker.string.uuid(),
    title: faker.person.jobTitle(),
    description: faker.lorem.paragraph(),
    jobType: faker.helpers.arrayElement(JobTypeSchema.options),
    slug: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
    status: faker.helpers.arrayElement(JobStatusSchema.options),
    tags: faker.helpers.arrayElements(
      ["engineering", "design", "remote", "full-stack", "frontend", "backend"],
      { min: 1, max: 3 }
    ),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  return JobSchema.parse(fakeJob);
}
