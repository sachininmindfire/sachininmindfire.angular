import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { cronExpressionValidator, validateCronExpression } from '../../../../shared/validators/cron-expression.validator';

const DEFAULT_EXPRESSION = '*/5 * * * *';

type CronPreset = 'every-5-minutes' | 'hourly' | 'daily-midnight' | 'weekly-monday';

@Component({
  selector: 'app-cron-expression-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cron-builder-page">
      <div class="container">
        <h1>Cron Expression Builder & Validator</h1>
        <p class="subtitle">
          Build standard cron expressions and validate them instantly. Supported formats include 5-field Unix syntax
          and 6-field cron expressions with seconds.
        </p>

        <div class="panel">
          <form [formGroup]="builderForm" class="builder-form">
            <div class="field-row expression-row">
              <label for="expression">Cron expression</label>
              <input
                id="expression"
                type="text"
                formControlName="expression"
                [class.invalid]="expressionControl.invalid && expressionControl.touched"
                placeholder="*/5 * * * *"
              />
            </div>

            <div class="toggle-row">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="withSeconds" />
                Include seconds
              </label>
            </div>

            <div class="builder-grid">
              <label>
                <span>Seconds</span>
                <input type="text" formControlName="seconds" />
              </label>
              <label>
                <span>Minutes</span>
                <input type="text" formControlName="minutes" />
              </label>
              <label>
                <span>Hours</span>
                <input type="text" formControlName="hours" />
              </label>
              <label>
                <span>Day of month</span>
                <input type="text" formControlName="dayOfMonth" />
              </label>
              <label>
                <span>Month</span>
                <input type="text" formControlName="month" />
              </label>
              <label>
                <span>Day of week</span>
                <input type="text" formControlName="dayOfWeek" />
              </label>
            </div>

            <div class="actions">
              <button type="button" class="primary" (click)="buildExpression()">Build expression</button>
              <button type="button" class="secondary" (click)="copyExpression()">Copy</button>
              <button type="button" class="ghost" (click)="resetExpression()">Reset</button>
            </div>

            <div class="preset-row">
              <button type="button" (click)="applyPreset('every-5-minutes')">Every 5 minutes</button>
              <button type="button" (click)="applyPreset('hourly')">Hourly</button>
              <button type="button" (click)="applyPreset('daily-midnight')">Daily at midnight</button>
              <button type="button" (click)="applyPreset('weekly-monday')">Weekly on Monday</button>
            </div>

            <div class="status-box" [class.valid]="expressionControl.valid" [class.invalid]="expressionControl.invalid && expressionControl.touched">
              @if (expressionControl.invalid && expressionControl.touched) {
                <span>{{ expressionControl.errors?.['message'] || 'Invalid cron expression.' }}</span>
              } @else {
                <span>{{ validationMessage }}</span>
              }
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--text-color);
    }

    .cron-builder-page {
      padding: 2rem 1rem 3rem;
    }

    .container {
      max-width: 980px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 0.75rem;
      font-size: clamp(2rem, 4vw, 3rem);
    }

    .subtitle {
      margin: 0 0 2rem;
      color: var(--text-muted);
      line-height: 1.6;
    }

    .panel {
      background: var(--card-bg);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }

    .builder-form {
      display: grid;
      gap: 1.5rem;
    }

    .field-row {
      display: grid;
      gap: 0.5rem;
    }

    label {
      display: grid;
      gap: 0.45rem;
      font-weight: 600;
    }

    input {
      width: 100%;
      border: 1px solid rgba(148, 163, 184, 0.5);
      border-radius: 10px;
      padding: 0.8rem 0.9rem;
      background: rgba(15, 23, 42, 0.02);
      color: inherit;
      font: inherit;
      box-sizing: border-box;
    }

    input.invalid {
      border-color: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }

    .checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      width: fit-content;
    }

    .checkbox-label input {
      width: auto;
      margin: 0;
    }

    .builder-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }

    .actions,
    .preset-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    button {
      border: none;
      border-radius: 10px;
      padding: 0.8rem 1.1rem;
      cursor: pointer;
      font: inherit;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    button:hover {
      transform: translateY(-1px);
    }

    .primary {
      background: var(--primary-color, #2563eb);
      color: white;
    }

    .secondary {
      background: #0f172a;
      color: white;
    }

    .ghost {
      background: transparent;
      border: 1px solid rgba(148, 163, 184, 0.5);
      color: inherit;
    }

    .preset-row button {
      background: rgba(37, 99, 235, 0.08);
      color: inherit;
      border: 1px solid rgba(37, 99, 235, 0.15);
    }

    .status-box {
      border-radius: 12px;
      padding: 0.9rem 1rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      background: rgba(148, 163, 184, 0.06);
      color: var(--text-color);
    }

    .status-box.valid {
      background: rgba(16, 185, 129, 0.08);
      border-color: rgba(16, 185, 129, 0.45);
      color: #0f766e;
    }

    .status-box.invalid {
      background: rgba(239, 68, 68, 0.07);
      border-color: rgba(239, 68, 68, 0.38);
      color: #b91c1c;
    }
  `]
})
export class CronExpressionBuilderComponent {
  private readonly defaultValidation = validateCronExpression(DEFAULT_EXPRESSION);

  readonly builderForm = new FormGroup({
    expression: new FormControl(DEFAULT_EXPRESSION, {
      nonNullable: true,
      validators: [Validators.required, cronExpressionValidator]
    }),
    withSeconds: new FormControl(false, { nonNullable: true }),
    seconds: new FormControl('0', { nonNullable: true }),
    minutes: new FormControl('*/5', { nonNullable: true }),
    hours: new FormControl('*', { nonNullable: true }),
    dayOfMonth: new FormControl('*', { nonNullable: true }),
    month: new FormControl('*', { nonNullable: true }),
    dayOfWeek: new FormControl('*', { nonNullable: true })
  });

  readonly expressionControl = this.builderForm.controls.expression;
  validationMessage = this.defaultValidation.message;

  buildExpression(): void {
    const withSeconds = this.builderForm.controls.withSeconds.value;
    const expressionParts = [
      this.builderForm.controls.minutes.value || '*',
      this.builderForm.controls.hours.value || '*',
      this.builderForm.controls.dayOfMonth.value || '*',
      this.builderForm.controls.month.value || '*',
      this.builderForm.controls.dayOfWeek.value || '*'
    ];

    if (withSeconds) {
      expressionParts.unshift(this.builderForm.controls.seconds.value || '0');
    }

    const expression = expressionParts.join(' ');
    this.expressionControl.setValue(expression, { emitEvent: true });
    this.expressionControl.markAsTouched();
    this.syncValidationMessage();
  }

  applyPreset(preset: CronPreset): void {
    switch (preset) {
      case 'every-5-minutes':
        this.builderForm.patchValue({ minutes: '*/5', hours: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*', seconds: '0', withSeconds: false });
        break;
      case 'hourly':
        this.builderForm.patchValue({ minutes: '0', hours: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*', seconds: '0', withSeconds: false });
        break;
      case 'daily-midnight':
        this.builderForm.patchValue({ minutes: '0', hours: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*', seconds: '0', withSeconds: false });
        break;
      case 'weekly-monday':
        this.builderForm.patchValue({ minutes: '0', hours: '9', dayOfMonth: '*', month: '*', dayOfWeek: 'MON', seconds: '0', withSeconds: false });
        break;
    }

    this.buildExpression();
  }

  resetExpression(): void {
    this.builderForm.reset({
      expression: DEFAULT_EXPRESSION,
      withSeconds: false,
      seconds: '0',
      minutes: '*/5',
      hours: '*',
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*'
    });
    this.syncValidationMessage();
  }

  copyExpression(): void {
    const expression = this.expressionControl.value?.trim();
    if (!expression) {
      return;
    }

    void navigator.clipboard.writeText(expression).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = expression;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }

  constructor() {
    this.expressionControl.valueChanges.subscribe(() => {
      this.syncValidationMessage();
    });

    this.builderForm.controls.withSeconds.valueChanges.subscribe((includeSeconds) => {
      if (includeSeconds) {
        this.builderForm.controls.seconds.enable();
      } else {
        this.builderForm.controls.seconds.disable();
      }
    });

    if (this.builderForm.controls.withSeconds.value) {
      this.builderForm.controls.seconds.enable();
    } else {
      this.builderForm.controls.seconds.disable();
    }
  }

  private syncValidationMessage(): void {
    const value = this.expressionControl.value ?? '';
    const result = validateCronExpression(value);
    this.validationMessage = result.message;
  }
}
