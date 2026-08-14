import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronExpressionBuilderComponent } from './cron-expression-builder.component';

describe('CronExpressionBuilderComponent', () => {
  let fixture: ComponentFixture<CronExpressionBuilderComponent>;
  let component: CronExpressionBuilderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CronExpressionBuilderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CronExpressionBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the default cron expression', () => {
    expect(component.expressionControl.valid).toBeTrue();
    expect(component.validationMessage).toContain('valid');
  });

  it('should build an expression from the fields', () => {
    component.builderForm.patchValue({
      minutes: '15',
      hours: '9',
      dayOfMonth: '1',
      month: 'JAN',
      dayOfWeek: '*',
      withSeconds: false
    });

    component.buildExpression();

    expect(component.expressionControl.value).toBe('15 9 1 JAN *');
  });
});
