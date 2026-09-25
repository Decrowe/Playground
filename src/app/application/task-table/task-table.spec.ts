import { TestBed } from '@angular/core/testing';

import { Task } from '../../domain/models/task';
import { TaskNode } from '../../domain/task-tree';
import { TaskTable } from './task-table';

const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };
const TASK_B: Task = { id: 'b', title: 'Bravo', expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 2 };
const TASK_C: Task = { id: 'c', title: 'Charlie', expectation: 0, timeEffort: 1, workEffort: 0, createdAt: 3 };

function leaf(task: Task): TaskNode {
  return {
    task,
    rating: task.expectation + task.timeEffort + task.workEffort,
    criteria: { expectation: task.expectation, timeEffort: task.timeEffort, workEffort: task.workEffort },
    children: []
  };
}

function createFixture(nodes: TaskNode[]) {
  const fixture = TestBed.createComponent(TaskTable);
  fixture.componentRef.setInput('nodes', nodes);
  fixture.detectChanges();
  return fixture;
}

describe('TaskTable', () => {
  it('renders one row per top-level node', () => {
    const fixture = createFixture([leaf(TASK_A), leaf(TASK_B), leaf(TASK_C)]);
    const rows = fixture.nativeElement.querySelectorAll('[data-testid="task-row"]');
    expect(rows.length).toBe(3);
  });

  it('shows the row content', () => {
    const fixture = createFixture([leaf(TASK_B)]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Bravo');
    expect(text).toContain('7');
  });

  it('shows each criterion as an icon with an accessible label', () => {
    const fixture = createFixture([leaf(TASK_B)]);
    const icons = fixture.nativeElement.querySelectorAll('mat-icon.criterion-icon');
    expect(icons.length).toBe(3);
    expect(icons[0].getAttribute('aria-label')).toBe('Somewhat Unlikely');
    expect(icons[0].textContent?.trim()).toBe('sentiment_neutral');
    expect(icons[2].getAttribute('aria-label')).toBe('Somewhat Easy');
    expect(icons[2].textContent?.trim()).toBe('sentiment_satisfied');
  });

  it('shows the criterion and rating column headers as icons', () => {
    const fixture = createFixture([leaf(TASK_B)]);
    const headerIcons = Array.from(fixture.nativeElement.querySelectorAll('th mat-icon')).map((el) =>
      (el as HTMLElement).getAttribute('aria-label')
    );
    expect(headerIcons).toEqual(['Expectation', 'Time Effort', 'Work Effort', 'Rating']);
  });

  it('renders rows in the given order (input already sorted)', () => {
    const fixture = createFixture([leaf(TASK_A), leaf(TASK_B), leaf(TASK_C)]);
    const titles = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="task-title"]')).map(
      (el) => (el as HTMLElement).textContent?.trim()
    );
    expect(titles?.[0]).toContain('Alpha');
    expect(titles?.[1]).toContain('Bravo');
    expect(titles?.[2]).toContain('Charlie');
  });

  it('applies the correct rating color class per row', () => {
    const fixture = createFixture([leaf(TASK_A), leaf(TASK_B), leaf(TASK_C)]);
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

  it('emits create when the empty-state button is clicked', () => {
    const fixture = createFixture([]);
    const emitted: void[] = [];
    fixture.componentInstance.create.subscribe(() => emitted.push(undefined));

    (fixture.nativeElement.querySelector('[data-testid="empty-state-new-task-button"]') as HTMLElement).click();

    expect(emitted.length).toBe(1);
  });

  it('toggles the break-down button visibility on hover', () => {
    const fixture = createFixture([leaf(TASK_A)]);
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
    const fixture = createFixture([leaf(TASK_A)]);
    const row = fixture.nativeElement.querySelector('[data-testid="task-row"]') as HTMLElement;
    const button = fixture.nativeElement.querySelector('[data-testid="break-down-button"]') as HTMLElement;

    row.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    fixture.detectChanges();
    expect(button.classList.contains('row-action--visible')).toBe(true);
    expect(button.getAttribute('aria-label')).toContain('Alpha');
  });

  it('emits breakDown with the task id', () => {
    const fixture = createFixture([leaf(TASK_A)]);
    const emitted: string[] = [];
    fixture.componentInstance.breakDown.subscribe((id) => emitted.push(id));

    (fixture.nativeElement.querySelector('[data-testid="break-down-button"]') as HTMLElement).click();

    expect(emitted).toEqual(['a']);
  });

  it('disables the edit button for an origin task with subtasks', () => {
    const parentNode: TaskNode = {
      task: TASK_A,
      rating: 7.5,
      criteria: { expectation: 3, timeEffort: 3, workEffort: 3 },
      children: [leaf(TASK_B)]
    };
    const fixture = createFixture([parentNode, leaf(TASK_C)]);
    const editButtons = fixture.nativeElement.querySelectorAll('[data-testid="edit-task-button"]');
    expect((editButtons[0] as HTMLButtonElement).disabled).toBe(true);
    expect((editButtons[1] as HTMLButtonElement).disabled).toBe(false);
  });

  it('emits edit and complete with the task id', () => {
    const fixture = createFixture([leaf(TASK_A)]);
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
    const fixture = createFixture([leaf(TASK_A)]);
    const ratingCell = fixture.nativeElement.querySelector('[data-testid="task-rating"]') as HTMLElement;
    expect(ratingCell.textContent?.trim()).toBe('15');
  });

  it('offers the three row actions in the overflow menu', () => {
    const fixture = createFixture([leaf(TASK_A)]);
    const breakDownIds: string[] = [];
    const editIds: string[] = [];
    const completeIds: string[] = [];
    fixture.componentInstance.breakDown.subscribe((id) => breakDownIds.push(id));
    fixture.componentInstance.edit.subscribe((id) => editIds.push(id));
    fixture.componentInstance.complete.subscribe((id) => completeIds.push(id));

    (fixture.nativeElement.querySelector('[data-testid="mobile-actions-button"]') as HTMLElement).click();
    fixture.detectChanges();

    const items = document.querySelectorAll<HTMLButtonElement>('.mat-mdc-menu-item');
    expect(Array.from(items).map((item) => item.textContent?.trim())).toEqual([
      'call_splitBreak down',
      'editEdit',
      'check_circleComplete'
    ]);

    items[0].click();
    items[1].click();
    items[2].click();

    expect(breakDownIds).toEqual(['a']);
    expect(editIds).toEqual(['a']);
    expect(completeIds).toEqual(['a']);
  });

  it('disables the overflow menu edit action for an origin task with subtasks', () => {
    const parentNode: TaskNode = {
      task: TASK_A,
      rating: 7.5,
      criteria: { expectation: 3, timeEffort: 3, workEffort: 3 },
      children: [leaf(TASK_B)]
    };
    const fixture = createFixture([parentNode]);

    (fixture.nativeElement.querySelector('[data-testid="mobile-actions-button"]') as HTMLElement).click();
    fixture.detectChanges();

    const items = document.querySelectorAll<HTMLButtonElement>('.mat-mdc-menu-item');
    expect(items[1].disabled).toBe(true);
  });

  it('re-renders when the input changes (OnPush)', () => {
    const fixture = createFixture([leaf(TASK_A)]);
    fixture.componentRef.setInput('nodes', [leaf(TASK_B)]);
    fixture.detectChanges();
    const titles = fixture.nativeElement.querySelector('[data-testid="task-title"]') as HTMLElement;
    expect(titles.textContent).toContain('Bravo');
  });

  it('does not show an expand toggle for a task without subtasks', () => {
    const fixture = createFixture([leaf(TASK_A)]);
    expect(fixture.nativeElement.querySelector('[data-testid="expand-toggle-button"]')).toBeFalsy();
  });

  it("shows the parent's icons from the averaged criteria, not its own raw values", () => {
    // TASK_A itself is all 5s (best), but its subtasks average out to all 0s (worst).
    const parentNode: TaskNode = {
      task: TASK_A,
      rating: 0,
      criteria: { expectation: 0, timeEffort: 0, workEffort: 0 },
      children: [leaf(TASK_C)]
    };
    const fixture = createFixture([parentNode]);
    const icons = fixture.nativeElement.querySelectorAll('mat-icon.criterion-icon');
    expect(icons[0].getAttribute('aria-label')).toBe('Very Unlikely');
    expect(icons[1].getAttribute('aria-label')).toBe('Very Long');
    expect(icons[2].getAttribute('aria-label')).toBe('Very Hard');
  });

  it('hides subtasks until the parent is expanded, then reveals them', () => {
    const parentNode: TaskNode = {
      task: TASK_A,
      rating: 7.5,
      criteria: { expectation: 3, timeEffort: 3, workEffort: 3 },
      children: [leaf(TASK_B), leaf(TASK_C)]
    };
    const fixture = createFixture([parentNode]);

    expect(fixture.nativeElement.querySelectorAll('[data-testid="task-row"]').length).toBe(1);
    const toggle = fixture.nativeElement.querySelector('[data-testid="expand-toggle-button"]') as HTMLElement;
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="task-row"]');
    expect(rows.length).toBe(3);
    expect(rows[1].getAttribute('data-depth')).toBe('1');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="task-row"]').length).toBe(1);
  });

  it('emits events for a subtask using the subtask id', () => {
    const parentNode: TaskNode = {
      task: TASK_A,
      rating: 7.5,
      criteria: { expectation: 3, timeEffort: 3, workEffort: 3 },
      children: [leaf(TASK_B)]
    };
    const fixture = createFixture([parentNode]);
    (fixture.nativeElement.querySelector('[data-testid="expand-toggle-button"]') as HTMLElement).click();
    fixture.detectChanges();

    const emitted: string[] = [];
    fixture.componentInstance.complete.subscribe((id) => emitted.push(id));
    const completeButtons = fixture.nativeElement.querySelectorAll('[data-testid="complete-task-button"]');
    (completeButtons[1] as HTMLElement).click();

    expect(emitted).toEqual(['b']);
  });
});
