import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AzureQuizCheckComponent } from './azure-quiz-check.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('AzureQuizCheckComponent', () => {
  let component: AzureQuizCheckComponent;
  let fixture: ComponentFixture<AzureQuizCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AzureQuizCheckComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AzureQuizCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the AzureQuizCheckComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle settings modal', () => {
    component.openSettings();
    expect(component.showSettingsModal()).toBeTrue();
    component.closeSettings();
    expect(component.showSettingsModal()).toBeFalse();
  });

  it('should trigger sample daily quiz generation', () => {
    const initialCount = component.pendingQuizzes().length;
    component.triggerDemoDailyQuiz();
    expect(component.pendingQuizzes().length).toBeGreaterThanOrEqual(initialCount);
  });
});
