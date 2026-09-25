import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Task } from '../../domain/models/task';
import { TaskFormDialog } from './task-form-dialog';

const TASK_B: Task = { id: 'b', title: 'Bravo', expectation: 2, timeEffort: 2, workEffort: 3, createdAt: 2 };

function createFixture(data: Task | undefined, dialogRef: Partial<MatDialogRef<TaskFormDialog>> = {}) {
  TestBed.configureTestingModule({
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close: () => {}, ...dialogRef } }
    ]
  });
  const fixture = TestBed.createComponent(TaskFormDialog);
  fixture.detectChanges();
  return fixture;
}

describe('TaskFormDialog', () => {
  it('renders the expected fields', () => {
    const fixture = createFixture(undefined);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="field-title"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="field-description"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="field-expectation"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="field-time-effort"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="field-work-effort"]')).toBeTruthy();
  });

  it('explains what each criterion is asking for', () => {
    const fixture = createFixture(undefined);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="hint-expectation"]')?.textContent).toContain(
      'How likely is it that this goal can be reached?'
    );
    expect(el.querySelector('[data-testid="hint-time-effort"]')?.textContent).toContain(
      'How much time will this task take?'
    );
    expect(el.querySelector('[data-testid="hint-work-effort"]')?.textContent).toContain(
      'How much work/effort will this task require?'
    );
  });

  it('disables confirm until the form is valid', () => {
    const fixture = createFixture(undefined);
    const confirm = () => fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]') as HTMLButtonElement;
    expect(confirm().disabled).toBe(true);

    fixture.componentInstance['form'].setValue({
      title: 'Task',
      description: '',
      expectation: 4,
      timeEffort: 4,
      workEffort: 4
    });
    fixture.detectChanges();
    expect(confirm().disabled).toBe(false);
  });

  it('rejects a blank title', () => {
    const fixture = createFixture(undefined);
    const form = fixture.componentInstance['form'];
    form.controls.title.setValue('   ');
    form.controls.title.markAsTouched();
    fixture.detectChanges();
    expect(form.controls.title.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-testid="validation-error"]')?.textContent).toContain(
      'Title is required'
    );
  });

  it('rejects an out-of-range criterion', () => {
    const fixture = createFixture(undefined);
    const form = fixture.componentInstance['form'];
    form.controls.expectation.setValue(6 as never);
    expect(form.controls.expectation.hasError('range')).toBe(true);
    expect(fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]').disabled).toBe(true);
  });

  it('shows a live rating preview', () => {
    const fixture = createFixture(undefined);
    const form = fixture.componentInstance['form'];
    form.setValue({ title: 'Task', description: '', expectation: 4, timeEffort: 4, workEffort: 4 });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Rating: 12');

    form.controls.workEffort.setValue(5);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Rating: 13');
  });

  it('confirms with the form value, including the description', () => {
    const close = vi.fn();
    const fixture = createFixture(undefined, { close });
    fixture.componentInstance['form'].setValue({
      title: 'Task',
      description: 'Some details',
      expectation: 4,
      timeEffort: 4,
      workEffort: 4
    });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('[data-testid="dialog-confirm"]') as HTMLButtonElement).click();

    expect(close).toHaveBeenCalledWith({
      title: 'Task',
      description: 'Some details',
      expectation: 4,
      timeEffort: 4,
      workEffort: 4
    });
  });

  it('cancels without a value', () => {
    const close = vi.fn();
    const fixture = createFixture(undefined, { close });
    (fixture.nativeElement.querySelector('[data-testid="dialog-cancel"]') as HTMLButtonElement).click();
    expect(close).toHaveBeenCalledWith();
  });

  it('confirms when the Enter key submits the form', () => {
    const close = vi.fn();
    const fixture = createFixture(undefined, { close });
    fixture.componentInstance['form'].setValue({
      title: 'Task',
      description: '',
      expectation: 4,
      timeEffort: 4,
      workEffort: 4
    });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('[data-testid="task-form"]') as HTMLFormElement;
    form.requestSubmit();

    expect(close).toHaveBeenCalledWith({
      title: 'Task',
      description: '',
      expectation: 4,
      timeEffort: 4,
      workEffort: 4
    });
  });

  it('does not confirm on Enter while the form is invalid', () => {
    const close = vi.fn();
    const fixture = createFixture(undefined, { close });

    const form = fixture.nativeElement.querySelector('[data-testid="task-form"]') as HTMLFormElement;
    form.requestSubmit();

    expect(close).not.toHaveBeenCalled();
  });

  it('prefills the form in edit mode', () => {
    const fixture = createFixture(TASK_B);
    const value = fixture.componentInstance['form'].getRawValue();
    expect(value).toEqual({ title: 'Bravo', description: '', expectation: 2, timeEffort: 2, workEffort: 3 });
  });

  it('prefills the description in edit mode when present', () => {
    const fixture = createFixture({ ...TASK_B, description: 'Existing notes' });
    const value = fixture.componentInstance['form'].getRawValue();
    expect(value.description).toBe('Existing notes');
  });
});
