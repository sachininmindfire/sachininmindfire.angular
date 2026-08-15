import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AzureQuizService } from './azure-quiz.service';

describe('AzureQuizService', () => {
  let service: AzureQuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AzureQuizService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AzureQuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create an on-demand quiz locally when no webAppUrl is set', (done) => {
    service.setSettings('', '');
    service.createOnDemandQuiz().subscribe(quiz => {
      expect(quiz).toBeTruthy();
      expect(quiz.type).toBe('ON_DEMAND');
      expect(quiz.questions.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should submit a quiz and calculate score locally', (done) => {
    service.setSettings('', '');
    service.createOnDemandQuiz().subscribe(quiz => {
      const answers: { [qId: string]: number } = {};
      quiz.questions.forEach(q => {
        answers[q.id] = 0;
      });

      service.submitQuiz({ quizId: quiz.quizId, answers }).subscribe(result => {
        expect(result).toBeTruthy();
        expect(result.quizId).toBe(quiz.quizId);
        expect(result.totalQuestions).toBe(quiz.questions.length);
        expect(result.percentage).toBeDefined();
        done();
      });
    });
  });

  it('should update settings including Gemini API key', () => {
    service.setSettings('https://script.google.com/test', 'test-gemini-key');
    expect(service.webAppUrl()).toBe('https://script.google.com/test');
    expect(service.geminiApiKey()).toBe('test-gemini-key');
    expect(service.isOnline()).toBeTrue();
    expect(service.hasGeminiKey()).toBeTrue();
  });

  it('should load dashboard data correctly in local mode', (done) => {
    service.setSettings('', '');
    service.loadDashboardData().subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.stats).toBeDefined();
      expect(Array.isArray(data.pendingQuizzes)).toBeTrue();
      expect(Array.isArray(data.history)).toBeTrue();
      done();
    });
  });
});
