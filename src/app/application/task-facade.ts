import { Injectable, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { Task } from '../domain/models/task';
import { TaskStore } from '../domain/task-store';
import { BreakDownDialog } from './break-down-dialog/break-down-dialog';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { TaskFormDialog } from './task-form-dialog/task-form-dialog';

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  readonly #store = inject(TaskStore);
  readonly #dialog = inject(MatDialog);

  readonly tasks = computed(() => this.#store.sortedTasks().filter((task) => !task.completed));

  async createTask(): Promise<void> {
    const result = await firstValueFrom(this.#dialog.open(TaskFormDialog, { width: '420px' }).afterClosed());
    if (result) {
      this.#store.add(result);
    }
  }

  async editTask(id: string): Promise<void> {
    const task = this.#findTask(id);
    if (!task) {
      return;
    }
    const result = await firstValueFrom(
      this.#dialog.open(TaskFormDialog, { width: '420px', data: task }).afterClosed()
    );
    if (result) {
      this.#store.update(id, result);
    }
  }

  completeTask(id: string): void {
    this.#store.complete(id);
  }

  async breakDownTask(id: string): Promise<void> {
    const task = this.#findTask(id);
    if (!task) {
      return;
    }
    const result = await firstValueFrom(
      this.#dialog.open(BreakDownDialog, { width: '560px', maxHeight: '80vh', data: task }).afterClosed()
    );
    if (result && result.length > 0) {
      this.#store.breakDown(id, result);
    }
  }

  async resetAll(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.#dialog
        .open(ConfirmDialog, {
          width: '360px',
          data: {
            title: 'Reset all tasks',
            message: 'This removes every task and cannot be undone. Continue?',
            confirmLabel: 'Reset'
          }
        })
        .afterClosed()
    );
    if (confirmed) {
      this.#store.clear();
    }
  }

  #findTask(id: string): Task | undefined {
    return this.#store.tasks().find((task) => task.id === id);
  }
}
