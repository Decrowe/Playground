import { Injectable, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { Task } from '../domain/models/task';
import { TaskStore } from '../domain/task-store';
import { buildTaskTree, filterTaskTree, TaskNode } from '../domain/task-tree';
import { BreakDownDialog } from './break-down-dialog/break-down-dialog';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { TaskFormDialog } from './task-form-dialog/task-form-dialog';

// Material caps dialogs at 80vw by default, which leaves phones with a cramped, clipped dialog.
const DIALOG_SIZE = {
  form: { width: '420px', maxWidth: '95vw' },
  breakDown: { width: '560px', maxWidth: '95vw', maxHeight: '85vh' },
  confirm: { width: '360px', maxWidth: '95vw' }
} as const;

@Injectable({ providedIn: 'root' })
export class TaskFacade {
  readonly #store = inject(TaskStore);
  readonly #dialog = inject(MatDialog);

  readonly tasks = computed<TaskNode[]>(() =>
    filterTaskTree(buildTaskTree(this.#store.tasks()), (task) => !task.completed)
  );

  async createTask(): Promise<void> {
    const result = await firstValueFrom(
      this.#dialog.open(TaskFormDialog, DIALOG_SIZE.form).afterClosed()
    );
    if (result) {
      this.#store.add(result);
    }
  }

  async editTask(id: string): Promise<void> {
    const task = this.#findTask(id);
    if (!task || this.#hasSubtasks(id)) {
      return;
    }
    const result = await firstValueFrom(
      this.#dialog.open(TaskFormDialog, { ...DIALOG_SIZE.form, data: task }).afterClosed()
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
      this.#dialog.open(BreakDownDialog, { ...DIALOG_SIZE.breakDown, data: task }).afterClosed()
    );
    if (result && result.length > 0) {
      this.#store.breakDown(id, result);
    }
  }

  async resetAll(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.#dialog
        .open(ConfirmDialog, {
          ...DIALOG_SIZE.confirm,
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

  // An origin task's rating is derived from its subtasks, so it can't be edited directly.
  #hasSubtasks(id: string): boolean {
    return this.#store.tasks().some((task) => task.parentId === id);
  }
}
