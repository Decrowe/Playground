import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function criterionRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return Number.isInteger(value) && value >= 0 && value <= 5 ? null : { range: true };
  };
}
