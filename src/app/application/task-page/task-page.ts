import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TaskFacade } from '../task-facade';
import { TaskTable } from '../task-table/task-table';

@Component({
  selector: 'app-task-page',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, TaskTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-page.html',
  styleUrl: './task-page.scss'
})
export class TaskPage {
  protected readonly facade = inject(TaskFacade);
  protected readonly isEmpty = computed(() => this.facade.tasks().length === 0);
}
