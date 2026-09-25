import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { criterionIcon, criterionLabel, ratingLevelClass } from '../../domain/rating';
import { Task } from '../../domain/models/task';

@Component({
  selector: 'app-task-table',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .empty-state {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 32px 24px;
      color: var(--mat-sys-on-surface-variant);
    }

    table[data-testid='task-table'] {
      width: 100%;
    }

    th.mat-mdc-header-cell {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-title-small);
    }

    th.mat-mdc-header-cell mat-icon {
      vertical-align: middle;
    }

    td.mat-mdc-cell,
    th.mat-mdc-header-cell {
      padding: 12px 16px;
    }

    td[data-testid='task-title'] {
      font-weight: 500;
    }

    .task-description {
      font-weight: 400;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .criterion-icon {
      color: var(--mat-sys-on-surface-variant);
    }

    td[data-testid='task-rating'] {
      font-weight: 700;
    }

    tr[data-testid='task-row'] {
      transition: filter 0.15s ease;
    }

    tr[data-testid='task-row']:hover {
      filter: brightness(0.97);
    }

    td.actions-cell {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .row-action {
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease;
    }
    .row-action--visible {
      opacity: 1;
      visibility: visible;
    }
  `,
  template: `
    @if (tasks().length === 0) {
      <p class="empty-state" data-testid="task-empty-state">
        <mat-icon>inbox</mat-icon>
        No tasks yet. Create one to get started.
      </p>
    } @else {
      <table mat-table [dataSource]="tasks()" data-testid="task-table">
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Title</th>
          <td mat-cell *matCellDef="let task" data-testid="task-title">
            {{ task.title }}
            @if (task.description) {
              <div class="task-description" data-testid="task-description">{{ task.description }}</div>
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="expectation">
          <th mat-header-cell *matHeaderCellDef>
            <mat-icon role="img" aria-label="Expectation" title="Expectation">track_changes</mat-icon>
          </th>
          <td mat-cell *matCellDef="let task">
            <mat-icon
              class="criterion-icon"
              role="img"
              [attr.aria-label]="criterionLabel(task.expectation)"
              [title]="criterionLabel(task.expectation)"
            >
              {{ criterionIcon(task.expectation) }}
            </mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="timeEffort">
          <th mat-header-cell *matHeaderCellDef>
            <mat-icon role="img" aria-label="Time Effort" title="Time Effort">schedule</mat-icon>
          </th>
          <td mat-cell *matCellDef="let task">
            <mat-icon
              class="criterion-icon"
              role="img"
              [attr.aria-label]="criterionLabel(task.timeEffort)"
              [title]="criterionLabel(task.timeEffort)"
            >
              {{ criterionIcon(task.timeEffort) }}
            </mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="workEffort">
          <th mat-header-cell *matHeaderCellDef>
            <mat-icon role="img" aria-label="Work Effort" title="Work Effort">fitness_center</mat-icon>
          </th>
          <td mat-cell *matCellDef="let task">
            <mat-icon
              class="criterion-icon"
              role="img"
              [attr.aria-label]="criterionLabel(task.workEffort)"
              [title]="criterionLabel(task.workEffort)"
            >
              {{ criterionIcon(task.workEffort) }}
            </mat-icon>
          </td>
        </ng-container>

        <ng-container matColumnDef="rating">
          <th mat-header-cell *matHeaderCellDef>
            <mat-icon role="img" aria-label="Rating" title="Rating">star</mat-icon>
          </th>
          <td mat-cell *matCellDef="let task" data-testid="task-rating">{{ rating(task) }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let task" class="actions-cell">
            <button
              mat-icon-button
              type="button"
              data-testid="break-down-button"
              class="row-action"
              [class.row-action--visible]="hoveredId() === task.id"
              [attr.aria-label]="'Break down ' + task.title"
              (click)="breakDown.emit(task.id)"
            >
              <mat-icon>call_split</mat-icon>
            </button>
            <button
              mat-icon-button
              type="button"
              data-testid="edit-task-button"
              [attr.aria-label]="'Edit ' + task.title"
              (click)="edit.emit(task.id)"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              type="button"
              data-testid="complete-task-button"
              [attr.aria-label]="'Complete ' + task.title"
              (click)="complete.emit(task.id)"
            >
              <mat-icon>check_circle</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr
          mat-row
          *matRowDef="let task; columns: columns"
          data-testid="task-row"
          [class]="ratingLevelClass(rating(task))"
          (mouseenter)="hoveredId.set(task.id)"
          (mouseleave)="hoveredId.set(null)"
          (focusin)="hoveredId.set(task.id)"
          (focusout)="hoveredId.set(null)"
        ></tr>
      </table>
    }
  `
})
export class TaskTable {
  readonly tasks = input.required<Task[]>();
  readonly breakDown = output<string>();
  readonly edit = output<string>();
  readonly complete = output<string>();

  protected readonly columns = ['title', 'expectation', 'timeEffort', 'workEffort', 'rating', 'actions'];
  protected readonly hoveredId = signal<string | null>(null);
  protected readonly criterionLabel = criterionLabel;
  protected readonly criterionIcon = criterionIcon;
  protected readonly ratingLevelClass = ratingLevelClass;

  protected rating(task: Task): number {
    return task.expectation + task.timeEffort + task.workEffort;
  }
}
