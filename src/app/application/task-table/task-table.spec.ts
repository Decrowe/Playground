import { TestBed } from '@angular/core/testing';

import { Task } from '../../domain/models/task';
import { TaskTable } from './task-table';

const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const TASK_B: Task = { id: 'b', title: 'Bravo', expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 2 };
const TASK_C: Task = { id: 'c', title: 'Charlie', expectation: 0, timeEffort: 1, workEffort: 0, createdAt: 3 };

function createFixture(tasks: Task[]) {
  const fixture = TestBed.createComponent(TaskTable);
  fixture.componentRef.setInput('tasks', tasks);
  fixture.detectChanges();
  return fixture;
}

describe('TaskTable', () => {
  it('renders one row per task', () => {
    const fixture = createFixture([TASK_A, TASK_B, TASK_C]);
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="task-row"]');
    expect(rows.length).toBe(3);
  });

  it('shows the row content', () => {
    const fixture = createFixture([TASK_B]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Bravo');
    expect(text).toContain('7');
  });

  it('shows each criterion as an icon with an accessible label', () => {
    const fixture = createFixture([TASK_B]);
    const icons = fixture.nativeElement.querySelectorAll('mat-icon.criterion-icon');
    expect(icons.length).toBe(3);
    expect(icons[0].getAttribute('aria-label')).toBe('Sufficient');
    expect(icons[0].textContent?.trim()).toBe('sentiment_neutral');
    expect(icons[2].getAttribute('aria-label')).toBe('Satisfactory');
    expect(icons[2].textContent?.trim()).toBe('sentiment_satisfied');
  });

  it('shows the criterion and rating column headers as icons', () => {
    const fixture = createFixture([TASK_B]);
    const headerIcons = Array.from(fixture.nativeElement.querySelectorAll('th mat-icon')).map((el) =>
      (el as HTMLElement).getAttribute('aria-label')
    );
    expect(headerIcons).toEqual(['Expectation', 'Time Effort', 'Work Effort', 'Rating']);
  });

  it('renders rows in the given order (input already sorted)', () => {
    const fixture = createFixture([TASK_A, TASK_B, TASK_C]);
    const titles = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="task-title"]')).map(
      (el) => (el as HTMLElement).textContent?.trim()
    );
    expect(titles).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('applies the correct rating color class per row', () => {
    const fixture = createFixture([TASK_A, TASK_B, TASK_C]);
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="task-row"]');
    expect(rows[0].classList.contains('rating--very-high')).toBe(true);
    expect(rows[1].classList.contains('rating--medium')).toBe(true);
    expect(rows[2].classList.contains('rating--very-low')).toBe(true);
  });

  it('shows the empty state when there are no tasks', () => {
    const fixture = createFixture([]);
    expect(fixture.nativeElement.querySelector('[data-testid="task-empty-state"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="task-row"]').length).toBe(0);
  });

  it('toggles the break-down button visibility on hover', () => {
    const fixture = createFixture([TASK_A]);
    const row = fixture.nativeElement.querySelector('[data-testid="task-row"]') as HTMLElement;
    const button = fixture.nativeElement.querySelector('[data-testid="break-down-button"]') as HTMLElement;
    expect(button.classList.contains('row-action--visible')).toBe(false);

    row.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(button.classList.contains('row-action--visible')).toBe(true);

    row.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(button.classList.contains('row-action--visible')).toBe(false);
  });

  it('shows the break-down button on keyboard focus', () => {
    const fixture = createFixture([TASK_A]);
    const row = fixture.nativeElement.querySelector('[data-testid="task-row"]') as HTMLElement;
    const button = fixture.nativeElement.querySelector('[data-testid="break-down-button"]') as HTMLElement;

    row.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(button.classList.contains('row-action--visible')).toBe(true);
    expect(button.getAttribute('aria-label')).toContain('Alpha');
  });

  it('emits breakDown with the task id', () => {
    const fixture = createFixture([TASK_A]);
    const emitted: string[] = [];
    fixture.componentInstance.breakDown.subscribe((id) => emitted.push(id));

    (fixture.nativeElement.querySelector('[data-testid="break-down-button"]') as HTMLElement).click();

    expect(emitted).toEqual(['a']);
  });

  it('emits edit and complete with the task id', () => {
    const fixture = createFixture([TASK_A]);
    const editIds: string[] = [];
    const completeIds: string[] = [];
    fixture.componentInstance.edit.subscribe((id) => editIds.push(id));
    fixture.componentInstance.complete.subscribe((id) => completeIds.push(id));

    (fixture.nativeElement.querySelector('[data-testid="edit-task-button"]') as HTMLElement).click();
    (fixture.nativeElement.querySelector('[data-testid="complete-task-button"]') as HTMLElement).click();

    expect(editIds).toEqual(['a']);
    expect(completeIds).toEqual(['a']);
  });

  it('shows the numeric rating as text', () => {
    const fixture = createFixture([TASK_A]);
    const ratingCell = fixture.nativeElement.querySelector('[data-testid="task-rating"]') as HTMLElement;
    expect(ratingCell.textContent?.trim()).toBe('15');
  });

  it('re-renders when the input changes (OnPush)', () => {
    const fixture = createFixture([TASK_A]);
    fixture.componentRef.setInput('tasks', [TASK_B]);
    fixture.detectChanges();
    const titles = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="task-title"]')).map(
      (el) => (el as HTMLElement).textContent?.trim()
    );
    expect(titles).toEqual(['Bravo']);
  });
});
