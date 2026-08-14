import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface CronValidationResult {
  valid: boolean;
  message: string;
  withSeconds: boolean;
}

const MONTH_ALIASES: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12
};

const WEEKDAY_ALIASES: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6
};

interface FieldSpec {
  min: number;
  max: number;
  aliases?: Record<string, number>;
  allowQuestionMark?: boolean;
  dayOfWeek?: boolean;
}

function normalizeCronValue(raw: string, spec: FieldSpec): number | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const lookupValue = trimmed.toUpperCase();
  if (spec.aliases && spec.aliases[lookupValue] !== undefined) {
    return spec.aliases[lookupValue];
  }

  const numericValue = Number(trimmed);
  if (!Number.isInteger(numericValue)) {
    return null;
  }

  if (spec.dayOfWeek && numericValue === 7) {
    return 0;
  }

  return numericValue;
}

function validateCronField(field: string, spec: FieldSpec, fieldName: string): string | null {
  if (!field || field.trim() === '') {
    return `${fieldName} is required.`;
  }

  const rawField = field.trim();
  if (rawField === '?' && spec.allowQuestionMark) {
    return null;
  }

  const segments = rawField.split(',');
  for (const segment of segments) {
    if (!segment.trim()) {
      return `Invalid ${fieldName} segment.`;
    }

    const [rangePart, stepPart] = segment.split('/');
    if (stepPart !== undefined && (!Number.isInteger(Number(stepPart)) || Number(stepPart) <= 0)) {
      return `${fieldName} step must be a positive integer.`;
    }

    const base = rangePart.trim();
    if (base === '*' || base === '?') {
      continue;
    }

    let start = spec.min;
    let end = spec.max;

    if (base.includes('-')) {
      const [rangeStartRaw, rangeEndRaw] = base.split('-');
      const rangeStart = normalizeCronValue(rangeStartRaw, spec);
      const rangeEnd = normalizeCronValue(rangeEndRaw, spec);

      if (rangeStart === null || rangeEnd === null) {
        return `Invalid ${fieldName} range: "${base}".`;
      }

      start = rangeStart;
      end = rangeEnd;
    } else {
      const singleValue = normalizeCronValue(base, spec);
      if (singleValue === null) {
        return `Invalid ${fieldName} value: "${base}".`;
      }
      start = singleValue;
      end = singleValue;
    }

    if (start < spec.min || start > spec.max || end < spec.min || end > spec.max) {
      return `${fieldName} values must stay within ${spec.min}-${spec.max}.`;
    }

    if (start > end) {
      return `${fieldName} range start must be less than or equal to the end.`;
    }
  }

  return null;
}

export function validateCronExpression(expression: string): CronValidationResult {
  const trimmedExpression = (expression ?? '').trim();

  if (!trimmedExpression) {
    return { valid: false, message: 'Cron expression is required.', withSeconds: false };
  }

  const parts = trimmedExpression.split(/\s+/);
  const supportedFieldCounts = [5, 6];

  if (!supportedFieldCounts.includes(parts.length)) {
    return {
      valid: false,
      message: 'Cron expression must contain 5 or 6 fields: minute hour day-of-month month day-of-week (optional seconds).',
      withSeconds: parts.length === 6
    };
  }

  const withSeconds = parts.length === 6;
  const fields = withSeconds ? parts : ['0', ...parts];

  const fieldSpecs: FieldSpec[] = [
    { min: 0, max: 59 },
    { min: 0, max: 59 },
    { min: 0, max: 23 },
    { min: 1, max: 31, allowQuestionMark: true },
    { min: 1, max: 12, aliases: MONTH_ALIASES },
    { min: 0, max: 7, aliases: WEEKDAY_ALIASES, allowQuestionMark: true, dayOfWeek: true }
  ];

  const fieldNames = ['second', 'minute', 'hour', 'day-of-month', 'month', 'day-of-week'];

  for (let index = 0; index < fields.length; index += 1) {
    const validationError = validateCronField(fields[index], fieldSpecs[index], fieldNames[index]);
    if (validationError) {
      return { valid: false, message: validationError, withSeconds };
    }
  }

  return { valid: true, message: 'Cron expression is valid.', withSeconds };
}

export const cronExpressionValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  const expressionValue = typeof value === 'string' ? value : value == null ? '' : String(value);
  const result = validateCronExpression(expressionValue);

  if (result.valid) {
    return null;
  }

  return { invalidCron: true, message: result.message };
};
