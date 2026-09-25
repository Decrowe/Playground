import { Task } from './models/task';
import { sortByRating } from './sorting';

const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const TASK_B: Task = { id: 'b', title: 'Bravo', expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 2 };
const TASK_C: Task = { id: 'c', title: 'Charlie', expectation: 0, timeEffort: 1, workEffort: 0, createdAt: 3 };
const TASK_D: Task = { id: 'd', title: 'Delta', expectation: 3, timeEffort: 2, workEffort: 2, createdAt: 4 };

describe('sortByRating', () => {
  it('sorts by rating, highest first', () => {
    const result = sortByRating([TASK_C, TASK_A, TASK_B]);
    expect(result.map((task) => task.id)).toEqual(['a', 'b', 'c']);
  });

  it('breaks ties by older createdAt first', () => {
    const result = sortByRating([TASK_D, TASK_B]);
    expect(result.map((task) => task.id)).toEqual(['b', 'd']);
  });

  it('does not mutate the input', () => {
    const input = [TASK_C, TASK_A, TASK_B];
    const result = sortByRating(input);
    expect(result).not.toBe(input);
    expect(input.map((task) => task.id)).toEqual(['c', 'a', 'b']);
  });

  it('handles edge cases', () => {
    expect(sortByRating([])).toEqual([]);
    expect(sortByRating([TASK_A])).toEqual([TASK_A]);
  });
});
