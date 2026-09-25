import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Task } from '../../domain/models/task';
import { BreakDownDialog } from './break-down-dialog';

const TASK_A: Task = { id: 'a', title: 'Alpha', expectation: 5, timeEffort: 5, workEffort: 5, createdAt: 1 };

function createFixture(close = vi.fn()) {
  TestBed.configureTestingModule({
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: TASK_A },
      { provide: MatDialogRef, useValue: { close } }
    ]
  });
  const fixture = TestBed.createComponent(BreakDownDialog);
  fixture.detectChanges();
  return { fixture, close };
}

function fillRow(fixture: ReturnType<typeof createFixture>['fixture'], index: number, title: string): void {
  const group = fixture.componentInstance['subTasks'].at(index);
  group.setValue({ title, expectation: 1, timeEffort: 1, workEffort: 1 });
  fixture.detectChanges();
}

describe('BreakDownDialog', () => {
  it('shows the source task read-only', () => {
    const { fixture } = createFixture();
    const source = fixture.nativeElement.querySelector('[data-testid="source-task"]') as HTMLElement;
    expect(source.textContent).toContain('Alpha');
    expect(source.textContent).toContain('15');
    expect(source.querySelector('input')).toBeNull();
  });

  it('starts with a single empty sub-task row and confirm disabled', () => {
    const { fixture } = createFixture();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="sub-task-row"]').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]').disabled).toBe(true);
  });

  it('adds sub-task rows', () => {
    const { fixture } = createFixture();
    const addButton = fixture.nativeElement.querySelector('[data-testid="add-sub-task-button"]') as HTMLElement;
    addButton.click();
    addButton.click();
    addButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-testid="sub-task-row"]').length).toBe(4);
  });

  it('removes a sub-task row', () => {
    const { fixture } = createFixture();
    const addButton = fixture.nativeElement.querySelector('[data-testid="add-sub-task-button"]') as HTMLElement;
    addButton.click();
    addButton.click();
    fixture.detectChanges();
    fillRow(fixture, 1, 'B');

    const removeButtons = fixture.nativeElement.querySelectorAll('[data-testid="remove-sub-task-button"]');
    (removeButtons[1] as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-testid="sub-task-row"]').length).toBe(2);
    expect(fixture.componentInstance['subTasks'].value.some((v) => v.title === 'B')).toBe(false);
  });

  it('disables remove when only one row is left', () => {
    const { fixture } = createFixture();
    const removeButton = fixture.nativeElement.querySelector(
      '[data-testid="remove-sub-task-button"]'
    ) as HTMLButtonElement;
    expect(removeButton.disabled).toBe(true);
  });

  it('disables confirm while any row is invalid', () => {
    const { fixture } = createFixture();
    fillRow(fixture, 0, 'Valid');
    (fixture.nativeElement.querySelector('[data-testid="add-sub-task-button"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]').disabled).toBe(true);

    fillRow(fixture, 1, 'Also valid');
    expect(fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]').disabled).toBe(false);
  });

  it('confirms with all sub-tasks', () => {
    const { fixture, close } = createFixture();
    fillRow(fixture, 0, 'Valid');
    (fixture.nativeElement.querySelector('[data-testid="add-sub-task-button"]') as HTMLElement).click();
    fixture.detectChanges();
    fillRow(fixture, 1, 'Also valid');

    (fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]') as HTMLElement).click();

    expect(close).toHaveBeenCalledWith([
      { title: 'Valid', expectation: 1, timeEffort: 1, workEffort: 1 },
      { title: 'Also valid', expectation: 1, timeEffort: 1, workEffort: 1 }
    ]);
  });

  it('cancels without a value', () => {
    const { fixture, close } = createFixture();
    (fixture.nativeElement.querySelector('[data-testid="dialog-cancel"]') as HTMLElement).click();
    expect(close).toHaveBeenCalledWith();
  });
});
