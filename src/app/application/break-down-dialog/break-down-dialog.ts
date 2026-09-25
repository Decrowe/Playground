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
  templateUrl: './break-down-dialog.html',
  styleUrl: './break-down-dialog.scss'
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
