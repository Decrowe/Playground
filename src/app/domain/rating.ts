import { CriterionValue, RatingLevel, Task } from './models/task';

export type CriterionKey = 'expectation' | 'timeEffort' | 'workEffort';

// Wording tailored to what each criterion actually measures, all sharing the same
// "0 = worst, 5 = best" direction so the color/icon scale still applies consistently.
const CRITERION_LABELS: Record<CriterionKey, Record<CriterionValue, string>> = {
  expectation: {
    0: 'Very Unlikely',
    1: 'Unlikely',
    2: 'Somewhat Unlikely',
    3: 'Somewhat Likely',
    4: 'Likely',
    5: 'Very Likely'
  },
  timeEffort: {
    0: 'Very Long',
    1: 'Long',
    2: 'Somewhat Long',
    3: 'Somewhat Short',
    4: 'Short',
    5: 'Very Short'
  },
  workEffort: {
    0: 'Very Hard',
    1: 'Hard',
    2: 'Somewhat Hard',
    3: 'Somewhat Easy',
    4: 'Easy',
    5: 'Very Easy'
  }
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

export function criterionLabel(criterion: CriterionKey, value: CriterionValue): string {
  return CRITERION_LABELS[criterion][value];
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
