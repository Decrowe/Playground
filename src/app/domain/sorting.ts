import { Task } from './models/task';
import { calculateRating } from './rating';

// Highest rating first; ties broken by older createdAt first, for deterministic ordering.
export function sortByRating(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const ratingDiff = calculateRating(b) - calculateRating(a);
    return ratingDiff !== 0 ? ratingDiff : a.createdAt - b.createdAt;
  });
}
