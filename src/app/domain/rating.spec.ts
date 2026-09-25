import { calculateRating, criterionLabel, getRatingLevel, ratingLevelClass } from './rating';
import { RatingLevel } from './models/task';

describe('calculateRating', () => {
  it('sums the three criteria', () => {
    expect(calculateRating({ expectation: 2, timeEffort: 3, workEffort: 1 })).toBe(6);
  });

  it('handles boundaries', () => {
    expect(calculateRating({ expectation: 0, timeEffort: 0, workEffort: 0 })).toBe(0);
    expect(calculateRating({ expectation: 5, timeEffort: 5, workEffort: 5 })).toBe(15);
  });

  it('is pure', () => {
    const task: { expectation: 2; timeEffort: 2; workEffort: 3 } = { expectation: 2, timeEffort: 2, workEffort: 3 };
    expect(calculateRating(task)).toBe(7);
    expect(calculateRating(task)).toBe(7);
    expect(task).toEqual({ expectation: 2, timeEffort: 2, workEffort: 3 });
  });
});

describe('criterionLabel', () => {
  it('uses likelihood wording for expectation', () => {
    expect(criterionLabel('expectation', 0)).toBe('Very Unlikely');
    expect(criterionLabel('expectation', 1)).toBe('Unlikely');
    expect(criterionLabel('expectation', 2)).toBe('Somewhat Unlikely');
    expect(criterionLabel('expectation', 3)).toBe('Somewhat Likely');
    expect(criterionLabel('expectation', 4)).toBe('Likely');
    expect(criterionLabel('expectation', 5)).toBe('Very Likely');
  });

  it('uses duration wording for time effort', () => {
    expect(criterionLabel('timeEffort', 0)).toBe('Very Long');
    expect(criterionLabel('timeEffort', 5)).toBe('Very Short');
  });

  it('uses difficulty wording for work effort', () => {
    expect(criterionLabel('workEffort', 0)).toBe('Very Hard');
    expect(criterionLabel('workEffort', 5)).toBe('Very Easy');
  });
});

describe('getRatingLevel', () => {
  it('maps ratings to the correct bucket', () => {
    expect(getRatingLevel(0)).toBe(RatingLevel.VeryLow);
    expect(getRatingLevel(3)).toBe(RatingLevel.VeryLow);
    expect(getRatingLevel(4)).toBe(RatingLevel.Low);
    expect(getRatingLevel(6)).toBe(RatingLevel.Low);
    expect(getRatingLevel(7)).toBe(RatingLevel.Medium);
    expect(getRatingLevel(9)).toBe(RatingLevel.Medium);
    expect(getRatingLevel(10)).toBe(RatingLevel.High);
    expect(getRatingLevel(12)).toBe(RatingLevel.High);
    expect(getRatingLevel(13)).toBe(RatingLevel.VeryHigh);
    expect(getRatingLevel(15)).toBe(RatingLevel.VeryHigh);
  });

  it('is monotonic', () => {
    const levels = Object.values(RatingLevel);
    let lastIndex = 0;
    for (let rating = 0; rating <= 15; rating++) {
      const index = levels.indexOf(getRatingLevel(rating));
      expect(index).toBeGreaterThanOrEqual(lastIndex);
      lastIndex = index;
    }
  });

  it('gives the same level for the same rating', () => {
    expect(getRatingLevel(7)).toBe(getRatingLevel(7));
    expect(ratingLevelClass(7)).toBe('rating--medium');
  });
});
