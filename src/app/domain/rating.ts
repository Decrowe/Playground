import { CriterionValue, RatingLevel, Task } from './models/task';

const CRITERION_LABELS: Record<CriterionValue, string> = {
  0: 'Very Bad',
  1: 'Bad',
  2: 'Sufficient',
  3: 'Satisfactory',
  4: 'Good',
  5: 'Very Good'
};

// Material icon ligature names for a 0-5 "mood" scale, shown instead of the text label in the table.
const CRITERION_ICONS: Record<CriterionValue, string> = {
  0: 'sentiment_very_dissatisfied',
  1: 'sentiment_dissatisfied',
  2: 'sentiment_neutral',
  3: 'sentiment_satisfied',
  4: 'sentiment_satisfied_alt',
  5: 'sentiment_very_satisfied'
};

export function calculateRating(task: Pick<Task, 'expectation' | 'timeEffort' | 'workEffort'>): number {
  return task.expectation + task.timeEffort + task.workEffort;
}

export function criterionLabel(value: CriterionValue): string {
  return CRITERION_LABELS[value];
}

export function criterionIcon(value: CriterionValue): string {
  return CRITERION_ICONS[value];
}

export function getRatingLevel(rating: number): RatingLevel {
  if (rating <= 3) return RatingLevel.VeryLow;
  if (rating <= 6) return RatingLevel.Low;
  if (rating <= 9) return RatingLevel.Medium;
  if (rating <= 12) return RatingLevel.High;
  return RatingLevel.VeryHigh;
}

const RATING_LEVEL_CLASSES: Record<RatingLevel, string> = {
  [RatingLevel.VeryLow]: 'rating--very-low',
  [RatingLevel.Low]: 'rating--low',
  [RatingLevel.Medium]: 'rating--medium',
  [RatingLevel.High]: 'rating--high',
  [RatingLevel.VeryHigh]: 'rating--very-high'
};

export function ratingLevelClass(rating: number): string {
  return RATING_LEVEL_CLASSES[getRatingLevel(rating)];
}
