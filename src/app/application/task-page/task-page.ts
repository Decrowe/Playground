import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TaskFacade } from '../task-facade';
import { TaskTable } from '../task-table/task-table';

@Component({
  selector: 'app-task-page',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, TaskTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary" class="page-toolbar">
      <span>Decision Maker</span>
      <span class="spacer"></span>
      <button mat-button type="button" data-testid="reset-tasks-button" (click)="facade.resetAll()">
        <mat-icon>delete_sweep</mat-icon>
        Reset
      </button>
      <button mat-flat-button type="button" data-testid="new-task-button" (click)="facade.createTask()">
        <mat-icon>add</mat-icon>
        New task
      </button>
    </mat-toolbar>

    <main class="page-content">
      <div class="page-card">
        <app-task-table
          [tasks]="facade.tasks()"
          (breakDown)="facade.breakDownTask($event)"
          (edit)="facade.editTask($event)"
          (complete)="facade.completeTask($event)"
        />
      </div>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100%;
    }

    .page-toolbar {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .page-content {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .page-card {
      width: 100%;
      max-width: 960px;
      background-color: var(--mat-sys-surface-container);
      border-radius: 16px;
      box-shadow: var(--mat-sys-level1);
      overflow: hidden;
    }

    button[data-testid='new-task-button'] mat-icon {
      margin-right: 4px;
    }

    button[data-testid='reset-tasks-button'] mat-icon {
      margin-right: 4px;
    }
  `
})
export class TaskPage {
  protected readonly facade = inject(TaskFacade);
}
