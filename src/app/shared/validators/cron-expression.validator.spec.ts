import { FormControl } from '@angular/forms';

import { cronExpressionValidator, validateCronExpression } from './cron-expression.validator';

describe('cron-expression.validator', () => {
  it('should validate a standard 5-field cron expression', () => {
    const result = validateCronExpression('*/5 * * * MON-FRI');

    expect(result.valid).toBeTrue();
    expect(result.withSeconds).toBeFalse();
  });

  it('should validate a 6-field cron expression with seconds', () => {
    const result = validateCronExpression('0 */5 * * * *');

    expect(result.valid).toBeTrue();
    expect(result.withSeconds).toBeTrue();
  });

  it('should reject invalid values', () => {
    const result = validateCronExpression('60 * * * *');

    expect(result.valid).toBeFalse();
    expect(result.message).toContain('minute');
  });

  it('should return Angular validation errors for an invalid form control value', () => {
    const errors = cronExpressionValidator(new FormControl('75 * * * *'));

    expect(errors).toEqual(jasmine.objectContaining({ invalidCron: true }));
  });
});
