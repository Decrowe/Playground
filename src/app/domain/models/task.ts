export type CriterionValue = 0 | 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  title: string;
  description?: string;
  expectation: CriterionValue;
  timeEffort: CriterionValue;
  workEffort: CriterionValue;
  createdAt: number;
  completed?: boolean;
  parentId?: string;
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'expectation' | 'timeEffort' | 'workEffort'>;

export enum RatingLevel {
  VeryLow = 'VeryLow',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'VeryHigh'
}
