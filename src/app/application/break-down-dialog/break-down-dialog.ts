import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';

import { CriterionValue, Task, TaskDraft } from '../../domain/models/task';
import { calculateRating, criterionLabel, ratingLevelClass } from '../../domain/rating';
import { criterionRangeValidator } from '../task-form-dialog/criterion-range.validator';

interface SubTaskFormValue {
  title: FormControl<string>;
  expectation: FormControl<CriterionValue>;
  timeEffort: FormControl<CriterionValue>;
  workEffort: FormControl<CriterionValue>;
}

function createSubTaskGroup(): FormGroup<SubTaskFormValue> {
  return new FormGroup<SubTaskFormValue>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    expectation: new FormControl(0, { nonNullable: true, validators: [criterionRangeValidator()] }),
    timeEffort: new FormControl(0, { nonNullable: true, validators: [criterionRangeValidator()] }),
    workEffort: new FormControl(0, { nonNullable: true, validators: [criterionRangeValidator()] })
  });
}

@Component({
  selector: 'app-break-down-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Break down task</h2>
    <mat-dialog-content [formGroup]="form" class="dialog-content">
      <section class="source-task" data-testid="source-task">
        <h3>{{ data.title }}</h3>
        @if (data.description) {
          <p class="source-task__description" data-testid="source-task-description">{{ data.description }}</p>
        }
        <p class="source-task__criteria">
          Expectation: {{ criterionLabel(data.expectation) }} &middot; Time Effort:
          {{ criterionLabel(data.timeEffort) }} &middot; Work Effort: {{ criterionLabel(data.workEffort) }}
        </p>
        <p class="rating-preview" [class]="sourceRatingClass">Rating: <strong>{{ sourceRating }}</strong></p>
      </section>

      <div formArrayName="subTasks" class="sub-tasks">
        @for (group of subTasks.controls; track group; let i = $index) {
          <div [formGroupName]="i" class="sub-task-row" data-testid="sub-task-row">
            <div class="sub-task-row__header">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" />
              </mat-form-field>
              <button
                mat-icon-button
                type="button"
                data-testid="remove-sub-task-button"
                [disabled]="subTasks.length <= 1"
                [attr.aria-label]="'Remove sub-task ' + (i + 1)"
                (click)="removeSubTask(i)"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>

            <div class="criterion-row">
              <span class="criterion-label">Expectation</span>
              <mat-slider class="criterion-slider" min="0" max="5" step="1" discrete>
                <input matSliderThumb formControlName="expectation" />
              </mat-slider>
              <span class="criterion-value">{{ criterionLabel(group.controls.expectation.value) }}</span>
            </div>

            <div class="criterion-row">
              <span class="criterion-label">Time Effort</span>
              <mat-slider class="criterion-slider" min="0" max="5" step="1" discrete>
                <input matSliderThumb formControlName="timeEffort" />
              </mat-slider>
              <span class="criterion-value">{{ criterionLabel(group.controls.timeEffort.value) }}</span>
            </div>

            <div class="criterion-row">
              <span class="criterion-label">Work Effort</span>
              <mat-slider class="criterion-slider" min="0" max="5" step="1" discrete>
                <input matSliderThumb formControlName="workEffort" />
              </mat-slider>
              <span class="criterion-value">{{ criterionLabel(group.controls.workEffort.value) }}</span>
            </div>
          </div>
        }
      </div>

      <button mat-button type="button" data-testid="add-sub-task-button" (click)="addSubTask()">
        <mat-icon>add</mat-icon>
        Add sub-task
      </button>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" data-testid="dialog-cancel" (click)="cancel()">Cancel</button>
      <button
        mat-flat-button
        type="button"
        data-testid="dialog-confirm"
        [disabled]="form.invalid"
        (click)="confirm()"
      >
        Break down
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 60vh;
    }

    .source-task {
      padding: 12px 16px;
      border-radius: 8px;
      background-color: var(--mat-sys-surface-container-high);
    }

    .source-task__criteria {
      color: var(--mat-sys-on-surface-variant);
    }

    .source-task__description {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }

    .rating-preview {
      display: inline-block;
      margin-top: 4px;
      padding: 4px 10px;
      border-radius: 8px;
    }

    .sub-tasks {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .sub-task-row {
      padding: 12px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 8px;
    }

    .sub-task-row__header {
      display: flex;
      align-items: flex-start;
      gap: 8px;
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
  `
})
export class BreakDownDialog {
  protected readonly data = inject<Task>(MAT_DIALOG_DATA);
  readonly #dialogRef = inject(MatDialogRef<BreakDownDialog, TaskDraft[]>);

  protected readonly criterionLabel = criterionLabel;
  protected readonly sourceRating = calculateRating(this.data);
  protected readonly sourceRatingClass = ratingLevelClass(this.sourceRating);

  protected readonly form = new FormGroup({
    subTasks: new FormArray([createSubTaskGroup()])
  });

  protected get subTasks(): FormArray<FormGroup<SubTaskFormValue>> {
    return this.form.controls.subTasks;
  }

  protected addSubTask(): void {
    this.subTasks.push(createSubTaskGroup());
  }

  protected removeSubTask(index: number): void {
    if (this.subTasks.length <= 1) {
      return;
    }
    this.subTasks.removeAt(index);
  }

  protected confirm(): void {
    if (this.form.invalid) {
      return;
    }
    this.#dialogRef.close(this.subTasks.controls.map((group) => group.getRawValue()));
  }

  protected cancel(): void {
    this.#dialogRef.close();
  }
}
