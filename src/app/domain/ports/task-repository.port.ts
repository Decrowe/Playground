import { InjectionToken } from '@angular/core';
import { Task } from '../models/task';

export interface TaskRepositoryPort {
  load(): Task[];
  save(tasks: readonly Task[]): void;
}

export const TASK_REPOSITORY = new InjectionToken<TaskRepositoryPort>('TASK_REPOSITORY');
