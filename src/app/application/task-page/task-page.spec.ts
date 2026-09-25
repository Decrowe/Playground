import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { InMemoryTaskRepository } from '../../infrastructure/in-memory-task.repository';
import { TASK_REPOSITORY } from '../../domain/ports/task-repository.port';
import { Task } from '../../domain/models/task';
import { TaskStore } from '../../domain/task-store';
import { TaskPage } from './task-page';

const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const TASK_C: Task = { id: 'c', title: 'Charlie', expectation: 0, timeEffort: 0, workEffort: 1, createdAt: 2 };

function createFixture(seed: Task[] = [], dialogResult: unknown = undefined) {
  const open = vi.fn().mockReturnValue({ afterClosed: () => of(dialogResult) });
  TestBed.configureTestingModule({
    providers: [
      { provide: TASK_REPOSITORY, useValue: new InMemoryTaskRepository(seed) },
      { provide: MatDialog, useValue: { open } }
    ]
  });
  const fixture = TestBed.createComponent(TaskPage);
  fixture.detectChanges();
  return { fixture, open };
}

function titles(fixture: ReturnType<typeof createFixture>['fixture']): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[data-testid="task-title"]')).map(
    (el) => (el as HTMLElement).textContent?.trim() ?? ''
  );
}

describe('TaskPage', () => {
  it('creates a task via the dialog', async () => {
    const { fixture, open } = createFixture([], { title: 'X', expectation: 5, timeEffort: 5, workEffort: 5 });
    (fixture.nativeElement.querySelector('[data-testid="new-task-button"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(open).toHaveBeenCalled();
    expect(titles(fixture)).toEqual(['X']);
  });

  it('breaks down a task via the dialog', async () => {
    const { fixture } = createFixture([TASK_A], [
      { title: 'Sub 1', expectation: 1, timeEffort: 1, workEffort: 1 },
      { title: 'Sub 2', expectation: 2, timeEffort: 2, workEffort: 2 }
    ]);

    (fixture.nativeElement.querySelector('[data-testid="break-down-button"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    const rendered = titles(fixture);
    expect(rendered.length).toBe(2);
    expect(rendered).not.toContain('Alpha');
  });

  it('does not mutate state when the dialog is cancelled', async () => {
    const { fixture } = createFixture([TASK_A], undefined);
    (fixture.nativeElement.querySelector('[data-testid="edit-task-button"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(titles(fixture)).toEqual(['Alpha']);
  });

  it('re-sorts the table after a change', async () => {
    const { fixture } = createFixture([TASK_A, TASK_C]);
    expect(titles(fixture)).toEqual(['Alpha', 'Charlie']);

    const store = TestBed.inject(TaskStore);
    store.update('c', { expectation: 5, timeEffort: 5, workEffort: 5 });
    store.update('a', { expectation: 0, timeEffort: 0, workEffort: 1 });
    fixture.detectChanges();

    expect(titles(fixture)).toEqual(['Charlie', 'Alpha']);
  });

  it('hides a task from the table once completed, without deleting it', async () => {
    const { fixture } = createFixture([TASK_A, TASK_C]);
    expect(titles(fixture)).toEqual(['Alpha', 'Charlie']);

    (fixture.nativeElement.querySelector('[data-testid="complete-task-button"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(titles(fixture)).toEqual(['Charlie']);
    const store = TestBed.inject(TaskStore);
    expect(store.tasks().some((task) => task.id === 'a' && task.completed)).toBe(true);
  });

  it('removes all tasks after confirming the reset', async () => {
    const { fixture } = createFixture([TASK_A, TASK_C], true);
    (fixture.nativeElement.querySelector('[data-testid="reset-tasks-button"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(titles(fixture)).toEqual([]);
    const store = TestBed.inject(TaskStore);
    expect(store.tasks()).toEqual([]);
  });

  it('keeps all tasks when the reset is cancelled', async () => {
    const { fixture } = createFixture([TASK_A, TASK_C], false);
    (fixture.nativeElement.querySelector('[data-testid="reset-tasks-button"]') as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(titles(fixture)).toEqual(['Alpha', 'Charlie']);
  });
});
