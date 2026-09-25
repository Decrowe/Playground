import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

import { CriterionValue, Task, TaskDraft } from '../../domain/models/task';
import { calculateRating, criterionLabel, ratingLevelClass } from '../../domain/rating';
import { criterionRangeValidator } from './criterion-range.validator';

function notBlankValidator(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length === 0 ? { required: true } : null;
}

// Guiding questions shown under each slider so users know what the criterion is asking for.
const CRITERION_QUESTIONS = {
  expectation: 'How likely is it that this goal can be reached?',
  timeEffort: 'How much time will this task take?',
  workEffort: 'How much work/effort will this task require?'
} as const;

interface TaskFormValue {
  title: FormControl<string>;
  description: FormControl<string>;
  expectation: FormControl<CriterionValue>;
  timeEffort: FormControl<CriterionValue>;
  workEffort: FormControl<CriterionValue>;
}

@Component({
  selector: 'app-task-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSliderModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss'
})
export class TaskFormDialog {
  protected readonly data = inject<Task | undefined>(MAT_DIALOG_DATA, { optional: true });
  readonly #dialogRef = inject(MatDialogRef<TaskFormDialog, TaskDraft>);

  protected readonly criterionLabel = criterionLabel;
  protected readonly criterionQuestions = CRITERION_QUESTIONS;

  protected readonly form = new FormGroup<TaskFormValue>({
    title: new FormControl(this.data?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, notBlankValidator]
    }),
    description: new FormControl(this.data?.description ?? '', { nonNullable: true }),
    expectation: new FormControl(this.data?.expectation ?? 0, {
      nonNullable: true,
      validators: [criterionRangeValidator()]
    }),
    timeEffort: new FormControl(this.data?.timeEffort ?? 0, {
      nonNullable: true,
      validators: [criterionRangeValidator()]
    }),
    workEffort: new FormControl(this.data?.workEffort ?? 0, {
      nonNullable: true,
      validators: [criterionRangeValidator()]
    })
  });

  readonly #formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly rating = computed(() => {
    const value = this.#formValue();
    return calculateRating({
      expectation: value.expectation ?? 0,
      timeEffort: value.timeEffort ?? 0,
      workEffort: value.workEffort ?? 0
    });
  });
  protected readonly ratingClass = computed(() => ratingLevelClass(this.rating()));

  protected confirm(): void {
    if (this.form.invalid) {
      return;
    }
    this.#dialogRef.close(this.form.getRawValue());
  }

  protected cancel(): void {
    this.#dialogRef.close();
  }
}
