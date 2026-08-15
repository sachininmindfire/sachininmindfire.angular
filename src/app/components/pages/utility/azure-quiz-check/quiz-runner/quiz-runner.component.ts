import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AzureQuizService } from '../services/azure-quiz.service';
import {
  QuizQuestion,
  QuizSessionDetail,
  QuizResult,
  AzureDomain
} from '../models/quiz.model';

@Component({
  selector: 'app-quiz-runner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-runner.component.html',
  styleUrl: './quiz-runner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuizRunnerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizService = inject(AzureQuizService);

  // Core State
  quizId = signal<string>('');
  isReviewMode = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  quiz = signal<QuizSessionDetail | null>(null);
  quizResult = signal<QuizResult | null>(null);
  errorMessage = signal<string | null>(null);

  // Active Test State
  currentIndex = signal<number>(0);
  selectedAnswers = signal<{ [qId: string]: number }>({});
  markedForReview = signal<{ [qId: string]: boolean }>({});

  // Timer State (30 mins = 1800 seconds)
  timeRemaining = signal<number>(1800);
  isTimerPaused = signal<boolean>(false);
  private timerInterval: any = null;

  // Modals & UI
  showSubmitModal = signal<boolean>(false);
  isSubmitted = signal<boolean>(false);

  // Computed Properties
  currentQuestion = computed<QuizQuestion | null>(() => {
    const qList = this.quiz()?.questions;
    if (!qList || qList.length === 0) return null;
    return qList[this.currentIndex()] || null;
  });

  totalQuestions = computed<number>(() => this.quiz()?.questions.length || 0);

  answeredCount = computed<number>(() => {
    return Object.keys(this.selectedAnswers()).length;
  });

  progressPercent = computed<number>(() => {
    const total = this.totalQuestions();
    return total > 0 ? Math.round((this.answeredCount() / total) * 100) : 0;
  });

  formattedTime = computed<string>(() => {
    const seconds = this.timeRemaining();
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('quizId');
      if (id) {
        this.quizId.set(id);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const mode = params.get('mode');
      const isReviewRoute = this.router.url.includes('/review');
      if (mode === 'review' || isReviewRoute) {
        this.isReviewMode.set(true);
      }
    });

    if (this.quizId()) {
      this.loadQuiz(this.quizId());
    } else {
      // If no quizId in route, create an on-demand quiz automatically
      this.startNewQuiz();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Keyboard navigation shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isLoading() || this.showSubmitModal() || this.isSubmitted() || this.isReviewMode()) return;

    if (['1', '2', '3', '4'].includes(event.key)) {
      const optIndex = parseInt(event.key, 10) - 1;
      this.selectOption(optIndex);
    } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(event.key)) {
      const map: { [key: string]: number } = { a: 0, b: 1, c: 2, d: 3 };
      const optIndex = map[event.key.toLowerCase()];
      this.selectOption(optIndex);
    } else if (event.key === 'ArrowRight' || event.key === 'n') {
      this.nextQuestion();
    } else if (event.key === 'ArrowLeft' || event.key === 'p') {
      this.prevQuestion();
    } else if (event.key === 'm' || event.key === 'M') {
      this.toggleMarkForReview();
    }
  }

  loadQuiz(id: string): void {
    this.isLoading.set(true);
    this.quizService.getQuiz(id).subscribe({
      next: (data) => {
        this.quiz.set(data);
        this.isLoading.set(false);

        if (data.status === 'COMPLETED' || this.isReviewMode()) {
          this.isReviewMode.set(true);
          this.isSubmitted.set(true);
          // populate answers from existing data
          const existingAnswers: { [qId: string]: number } = {};
          data.questions.forEach(q => {
            if (q.userAnswer !== undefined) {
              existingAnswers[q.id] = q.userAnswer;
            }
          });
          this.selectedAnswers.set(existingAnswers);
        } else {
          this.startTimer();
        }
      },
      error: (err) => {
        this.errorMessage.set('Unable to load quiz session. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  startNewQuiz(): void {
    this.isLoading.set(true);
    this.quizService.createOnDemandQuiz().subscribe({
      next: (data) => {
        this.quiz.set(data);
        this.quizId.set(data.quizId);
        this.isLoading.set(false);
        this.startTimer();
      },
      error: () => {
        this.errorMessage.set('Failed to generate a new quiz. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  selectOption(optionIndex: number): void {
    if (this.isSubmitted() || this.isReviewMode()) return;
    const q = this.currentQuestion();
    if (!q) return;

    this.selectedAnswers.update(current => ({
      ...current,
      [q.id]: optionIndex
    }));
  }

  isOptionSelected(optionIndex: number): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    return this.selectedAnswers()[q.id] === optionIndex;
  }

  toggleMarkForReview(): void {
    const q = this.currentQuestion();
    if (!q) return;

    this.markedForReview.update(current => ({
      ...current,
      [q.id]: !current[q.id]
    }));
  }

  isQuestionMarked(index: number): boolean {
    const qList = this.quiz()?.questions;
    if (!qList || !qList[index]) return false;
    return !!this.markedForReview()[qList[index].id];
  }

  isQuestionAnswered(index: number): boolean {
    const qList = this.quiz()?.questions;
    if (!qList || !qList[index]) return false;
    return this.selectedAnswers()[qList[index].id] !== undefined;
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.totalQuestions()) {
      this.currentIndex.set(index);
    }
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.totalQuestions() - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  // Timer Management
  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.isTimerPaused()) {
        this.timeRemaining.update(t => {
          if (t <= 1) {
            this.stopTimer();
            this.confirmSubmit();
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
  }

  toggleTimerPause(): void {
    this.isTimerPaused.update(p => !p);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Submission Flow
  openSubmitConfirmation(): void {
    this.showSubmitModal.set(true);
  }

  cancelSubmit(): void {
    this.showSubmitModal.set(false);
  }

  retryQuiz(): void {
    const q = this.quiz();
    if (!q) return;

    this.selectedAnswers.set({});
    this.markedForReview.set({});
    this.currentIndex.set(0);
    this.isSubmitted.set(false);
    this.isReviewMode.set(false);
    this.quizResult.set(null);
    this.timeRemaining.set(1200);
    this.isTimerPaused.set(false);
    this.startTimer();
  }

  isOptionCorrect(optIndex: number): boolean {
    const q = this.currentQuestion();
    if (!q || q.correctIndex === undefined) return false;
    return Number(q.correctIndex) === optIndex;
  }

  isOptionUserChoice(optIndex: number): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    let ans = this.selectedAnswers()[q.id];
    if (ans === undefined && q.userAnswer !== undefined) {
      ans = q.userAnswer;
    }
    return ans !== undefined && ans !== -1 && Number(ans) === optIndex;
  }

  isOptionUserWrong(optIndex: number): boolean {
    if (!this.isReviewMode()) return false;
    return this.isOptionUserChoice(optIndex) && !this.isOptionCorrect(optIndex);
  }

  getQuestionReviewStatus(index: number): 'correct' | 'incorrect' | 'unvisited' {
    const qList = this.quizResult()?.results || this.quiz()?.questions;
    if (!qList || !qList[index]) return 'unvisited';
    const q = qList[index];

    let userAns: number | undefined = undefined;
    if (this.selectedAnswers()[q.id] !== undefined && this.selectedAnswers()[q.id] !== -1) {
      userAns = Number(this.selectedAnswers()[q.id]);
    } else if (q.userAnswer !== undefined && q.userAnswer !== -1) {
      userAns = Number(q.userAnswer);
    }

    if (userAns === undefined || userAns === -1) {
      return 'unvisited';
    }

    if (q.isCorrect !== undefined) {
      return q.isCorrect ? 'correct' : 'incorrect';
    }

    if (q.correctIndex !== undefined) {
      return userAns === Number(q.correctIndex) ? 'correct' : 'incorrect';
    }

    return 'unvisited';
  }

  confirmSubmit(): void {
    this.showSubmitModal.set(false);
    this.stopTimer();
    this.isLoading.set(true);

    this.quizService.submitQuiz({
      quizId: this.quizId(),
      answers: this.selectedAnswers()
    }).subscribe({
      next: (result) => {
        this.quizResult.set(result);
        if (result.results && result.results.length > 0) {
          this.quiz.update(curr => curr ? {
            ...curr,
            status: 'COMPLETED',
            score: result.score,
            questions: result.results
          } : curr);
        }
        this.isSubmitted.set(true);
        this.isReviewMode.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Submission failed. Retrying in offline mode...');
        this.isLoading.set(false);
      }
    });
  }

  openPopoutWindow(): void {
    const url = window.location.href;
    window.open(url, '_blank', 'width=1100,height=800,menubar=no,toolbar=no,location=no');
  }

  getPerformanceBadge(percentage: number): { label: string; class: string; icon: string } {
    if (percentage >= 85) {
      return { label: 'Enterprise Architect Mastery (L400)', class: 'badge-mastery', icon: '🏆' };
    } else if (percentage >= 70) {
      return { label: 'Architect Proficient (L300)', class: 'badge-proficient', icon: '✅' };
    } else {
      return { label: 'Needs Domain Refresher', class: 'badge-review', icon: '⚠️' };
    }
  }

  getDomainScores(): { domain: string; correct: number; total: number; percent: number }[] {
    const results = this.quizResult()?.results || this.quiz()?.questions || [];
    const map: { [domain: string]: { correct: number; total: number } } = {};

    results.forEach(q => {
      if (!map[q.domain]) {
        map[q.domain] = { correct: 0, total: 0 };
      }
      map[q.domain].total++;
      if (q.isCorrect || (q.userAnswer !== undefined && Number(q.userAnswer) === Number(q.correctIndex))) {
        map[q.domain].correct++;
      }
    });

    return Object.keys(map).map(d => ({
      domain: d,
      correct: map[d].correct,
      total: map[d].total,
      percent: Math.round((map[d].correct / map[d].total) * 100)
    }));
  }
}
