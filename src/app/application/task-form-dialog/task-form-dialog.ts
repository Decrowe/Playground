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
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit task' : 'New task' }}</h2>
    <form [formGroup]="form" data-testid="task-form" (ngSubmit)="confirm()">
      <mat-dialog-content class="dialog-content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput data-testid="field-title" formControlName="title" />
          @if (form.controls.title.invalid && form.controls.title.touched) {
            <mat-error data-testid="validation-error">Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            data-testid="field-description"
            formControlName="description"
            rows="2"
            placeholder="Add more details (optional)"
          ></textarea>
        </mat-form-field>

        <div class="criterion-row" data-testid="field-expectation">
          <span class="criterion-label">Expectation</span>
          <mat-slider class="criterion-slider" min="0" max="5" step="1" discrete>
            <input matSliderThumb formControlName="expectation" />
          </mat-slider>
          <span class="criterion-value">{{ criterionLabel(form.controls.expectation.value) }}</span>
        </div>
        <p class="criterion-hint" data-testid="hint-expectation">{{ criterionQuestions.expectation }}</p>

        <div class="criterion-row" data-testid="field-time-effort">
          <span class="criterion-label">Time Effort</span>
          <mat-slider class="criterion-slider" min="0" max="5" step="1" discrete>
            <input matSliderThumb formControlName="timeEffort" />
          </mat-slider>
          <span class="criterion-value">{{ criterionLabel(form.controls.timeEffort.value) }}</span>
        </div>
        <p class="criterion-hint" data-testid="hint-time-effort">{{ criterionQuestions.timeEffort }}</p>

        <div class="criterion-row" data-testid="field-work-effort">
          <span class="criterion-label">Work Effort</span>
          <mat-slider class="criterion-slider" min="0" max="5" step="1" discrete>
            <input matSliderThumb formControlName="workEffort" />
          </mat-slider>
          <span class="criterion-value">{{ criterionLabel(form.controls.workEffort.value) }}</span>
        </div>
        <p class="criterion-hint" data-testid="hint-work-effort">{{ criterionQuestions.workEffort }}</p>

        <p class="rating-preview" [class]="ratingClass()">Rating: <strong>{{ rating() }}</strong></p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" data-testid="dialog-cancel" (click)="cancel()">Cancel</button>
        <button mat-flat-button type="submit" data-testid="dialog-confirm" [disabled]="form.invalid">
          Save
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 260px;
    }

    .full-width {
      width: 100%;
    }

    .criterion-row {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 48px;
    }

    .criterion-label {
      flex: 0 0 110px;
      font: var(--mat-sys-body-medium);
    }

    .criterion-slider {
      flex: 1 1 auto;
    }

    .criterion-value {
      flex: 0 0 100px;
      text-align: right;
      font-weight: 500;
      white-space: nowrap;
    }

    .criterion-hint {
      margin: 0 0 8px 0;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .rating-preview {
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 8px;
    }
  `
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
