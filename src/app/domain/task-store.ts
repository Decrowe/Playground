import { Injectable, computed, inject, signal } from '@angular/core';

import { Task, TaskDraft } from './models/task';
import { TASK_REPOSITORY } from './ports/task-repository.port';
import { sortByRating } from './sorting';

function createId(): string {
  return crypto.randomUUID();
}

@Injectable({ providedIn: 'root' })
export class TaskStore {
  readonly #repository = inject(TASK_REPOSITORY);
  readonly #tasks = signal<Task[]>(this.#repository.load());

  readonly tasks = this.#tasks.asReadonly();
  readonly sortedTasks = computed(() => sortByRating(this.#tasks()));

  add(draft: TaskDraft): void {
    const task: Task = { ...draft, id: createId(), createdAt: Date.now(), completed: false };
    this.#persist([...this.#tasks(), task]);
  }

  update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    const current = this.#tasks();
    if (!current.some((task) => task.id === id)) {
      return;
    }
    this.#persist(current.map((task) => (task.id === id ? { ...task, ...changes } : task)));
  }

  remove(id: string): void {
    this.#persist(this.#tasks().filter((task) => task.id !== id));
  }

  complete(id: string): void {
    this.update(id, { completed: true });
  }

  breakDown(id: string, subTasks: readonly TaskDraft[]): void {
    if (subTasks.length === 0) {
      return;
    }
    const current = this.#tasks();
    if (!current.some((task) => task.id === id)) {
      return;
    }
    const now = Date.now();
    const created = subTasks.map(
      (draft) => ({ ...draft, id: createId(), createdAt: now, completed: false, parentId: id }) satisfies Task
    );
    this.#persist([...current, ...created]);
  }

  clear(): void {
    this.#persist([]);
  }

  #persist(tasks: Task[]): void {
    this.#tasks.set(tasks);
    this.#repository.save(tasks);
  }
}
