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
  templateUrl: './task-table.html',
  styleUrl: './task-table.scss'
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
