import { Injectable } from '@angular/core';

import { CriterionValue, Task } from '../domain/models/task';
import { TaskRepositoryPort } from '../domain/ports/task-repository.port';

const STORAGE_KEY = 'decision-maker.tasks';

function isCriterionValue(value: unknown): value is CriterionValue {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5;
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'string' &&
    typeof candidate['title'] === 'string' &&
    (candidate['description'] === undefined || typeof candidate['description'] === 'string') &&
    (candidate['completed'] === undefined || typeof candidate['completed'] === 'boolean') &&
    isCriterionValue(candidate['expectation']) &&
    isCriterionValue(candidate['timeEffort']) &&
    isCriterionValue(candidate['workEffort']) &&
    typeof candidate['createdAt'] === 'number'
  );
}

@Injectable()
export class LocalStorageTaskRepository implements TaskRepositoryPort {
  load(): Task[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isTask) : [];
    } catch {
      return [];
    }
  }

  save(tasks: readonly Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
}
