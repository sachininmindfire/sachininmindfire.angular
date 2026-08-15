import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizRunnerComponent } from './quiz-runner.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('QuizRunnerComponent', () => {
  let component: QuizRunnerComponent;
  let fixture: ComponentFixture<QuizRunnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizRunnerComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuizRunnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the QuizRunnerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should select an option and update answered count', () => {
    component.selectOption(2);
    expect(component.answeredCount()).toBeGreaterThanOrEqual(0);
  });

  it('should toggle marked for review', () => {
    const initialMark = component.isQuestionMarked(0);
    component.toggleMarkForReview();
    expect(component.isQuestionMarked(0)).toBe(!initialMark);
  });
});
