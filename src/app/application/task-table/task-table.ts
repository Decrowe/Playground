import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { criterionIcon, criterionLabel, ratingLevelClass } from '../../domain/rating';
import { TaskNode } from '../../domain/task-tree';

@Component({
  selector: 'app-task-table',
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-table.html',
  styleUrl: './task-table.scss'
})
export class TaskTable {
  readonly nodes = input.required<TaskNode[]>();
  readonly breakDown = output<string>();
  readonly edit = output<string>();
  readonly complete = output<string>();
  readonly create = output<void>();

  protected readonly hoveredId = signal<string | null>(null);
  protected readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly criterionLabel = criterionLabel;
  protected readonly criterionIcon = criterionIcon;
  protected readonly ratingLevelClass = ratingLevelClass;

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected toggleExpand(id: string): void {
    this.expandedIds.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
}
