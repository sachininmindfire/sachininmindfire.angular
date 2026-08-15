import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AzureQuizService } from './services/azure-quiz.service';
import { QuizSessionSummary, AzureDomain } from './models/quiz.model';

@Component({
  selector: 'app-azure-quiz-check',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './azure-quiz-check.component.html',
  styleUrl: './azure-quiz-check.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureQuizCheckComponent implements OnInit {
  public quizService = inject(AzureQuizService);
  private router = inject(Router);

  // UI state
  showSettingsModal = signal<boolean>(false);
  tempWebAppUrl = signal<string>('');
  tempGeminiApiKey = signal<string>('');
  activeTab = signal<'all' | 'daily' | 'ondemand'>('all');

  // Test connection state
  isTestingConnection = signal<boolean>(false);
  connectionTestResult = signal<{ success: boolean; message: string } | null>(null);

  // Computed state
  dashboardData = this.quizService.dashboardData;
  isLoading = this.quizService.isLoading;
  loadingStatusMessage = this.quizService.loadingStatusMessage;
  isOnline = this.quizService.isOnline;
  hasGeminiKey = this.quizService.hasGeminiKey;

  pendingQuizzes = computed(() => this.dashboardData().pendingQuizzes);
  history = computed(() => {
    const list = this.dashboardData().history;
    const tab = this.activeTab();
    if (tab === 'daily') return list.filter(item => item.type === 'SCHEDULED_DAILY');
    if (tab === 'ondemand') return list.filter(item => item.type === 'ON_DEMAND');
    return list;
  });

  stats = computed(() => this.dashboardData().stats);

  domainMasteryList = computed(() => {
    const map = this.stats().domainMastery || {};
    const totalCompleted = this.stats().totalCompleted;
    const domains: AzureDomain[] = [
      'Enterprise Solution Architecture & Scalability',
      'Cloud Governance, FinOps & CAF',
      'Security, Identity & Zero-Trust',
      'DevOps, CI/CD & Service Accelerators',
      'Data, Modern Integration & Hybrid',
      'Consulting, Presales & CTO Advisory'
    ];

    return domains.map(d => ({
      domain: d,
      percent: map[d] !== undefined ? map[d]! : (totalCompleted === 0 ? 0 : 0)
    }));
  });

  ngOnInit(): void {
    this.tempWebAppUrl.set(this.quizService.webAppUrl());
    this.tempGeminiApiKey.set(this.quizService.geminiApiKey());
    this.quizService.loadDashboardData().subscribe();
  }

  startFreshQuiz(): void {
    this.quizService.createOnDemandQuiz().subscribe({
      next: (quiz) => {
        this.router.navigate(['/azure-quiz-check/take', quiz.quizId]);
      }
    });
  }

  takeQuizInNewWindow(quizId: string): void {
    const url = `${window.location.origin}${window.location.pathname}#/azure-quiz-check/take/${quizId}`;
    window.open(url, '_blank', 'width=1100,height=800,menubar=no,toolbar=no,location=no');
  }

  reviewQuizInNewWindow(quizId: string): void {
    const url = `${window.location.origin}${window.location.pathname}#/azure-quiz-check/review/${quizId}`;
    window.open(url, '_blank', 'width=1100,height=800,menubar=no,toolbar=no,location=no');
  }

  triggerDemoDailyQuiz(): void {
    this.quizService.generateSampleDailyQuiz();
  }

  openSettings(): void {
    this.tempWebAppUrl.set(this.quizService.webAppUrl());
    this.tempGeminiApiKey.set(this.quizService.geminiApiKey());
    this.connectionTestResult.set(null);
    this.showSettingsModal.set(true);
  }

  closeSettings(): void {
    this.showSettingsModal.set(false);
  }

  async testConnection(): Promise<void> {
    this.isTestingConnection.set(true);
    this.connectionTestResult.set(null);
    const result = await this.quizService.testConnection(this.tempWebAppUrl());
    this.connectionTestResult.set(result);
    this.isTestingConnection.set(false);
  }

  saveSettings(): void {
    this.quizService.setSettings(this.tempWebAppUrl(), this.tempGeminiApiKey());
    this.showSettingsModal.set(false);
  }

  getScoreBadgeClass(score: number, total: number): string {
    const pct = (score / total) * 100;
    if (pct >= 85) return 'badge-success';
    if (pct >= 70) return 'badge-info';
    return 'badge-warning';
  }
}
