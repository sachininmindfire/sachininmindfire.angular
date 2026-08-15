import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import {
  DashboardData,
  QuizSessionDetail,
  QuizSessionSummary,
  QuizSubmission,
  QuizResult,
  QuizQuestion,
  AzureDomain
} from '../models/quiz.model';
import { MOCK_AZURE_QUESTIONS } from '../data/mock-questions';

const STORAGE_KEY_WEBAPP_URL = 'azure_quiz_webapp_url';
const STORAGE_KEY_GEMINI_KEY = 'azure_quiz_gemini_key';
const STORAGE_KEY_SESSIONS = 'azure_quiz_local_sessions';
const STORAGE_KEY_RESULTS = 'azure_quiz_local_results';

@Injectable({
  providedIn: 'root'
})
export class AzureQuizService {
  private http = inject(HttpClient);

  // Settings state
  webAppUrl = signal<string>(this.loadStorageKey(STORAGE_KEY_WEBAPP_URL));
  geminiApiKey = signal<string>(this.loadStorageKey(STORAGE_KEY_GEMINI_KEY));

  isOnline = computed(() => !!this.webAppUrl().trim());
  hasGeminiKey = computed(() => !!this.geminiApiKey().trim());

  // UI status
  isLoading = signal<boolean>(false);
  loadingStatusMessage = signal<string>('Loading...');
  errorMessage = signal<string | null>(null);

  dashboardData = signal<DashboardData>({
    pendingQuizzes: [],
    history: [],
    stats: {
      totalCompleted: 0,
      averageAccuracy: 0,
      pendingCount: 0,
      currentStreakDays: 0,
      domainMastery: {}
    }
  });

  constructor() {
    this.initLocalDataIfEmpty();
    this.loadDashboardData();
  }

  setSettings(webAppUrl: string, geminiKey: string): void {
    const cleanUrl = webAppUrl.trim();
    const cleanKey = geminiKey.trim();

    this.webAppUrl.set(cleanUrl);
    this.geminiApiKey.set(cleanKey);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_WEBAPP_URL, cleanUrl);
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, cleanKey);
    }

    this.loadDashboardData().subscribe();
  }

  /**
   * Tests connection to Google Apps Script Web App
   */
  async testConnection(url: string): Promise<{ success: boolean; message: string }> {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      return { success: false, message: 'Please enter a valid Google Apps Script Web App URL.' };
    }

    try {
      const response = await fetch(`${cleanUrl}?action=getDashboardData`, {
        method: 'GET',
        redirect: 'follow'
      });

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP error ${response.status}: Ensure Web App is deployed with 'Who has access: Anyone'.`
        };
      }

      const json = await response.json();
      if (json && json.success) {
        return { success: true, message: '✓ Successfully connected to Google Sheets backend!' };
      } else {
        return { success: false, message: `Apps Script error: ${json?.error || json?.message || 'Unknown response'}` };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message || 'Check network / CORS. Ensure Web App is deployed with "Who has access: Anyone" & run setupDatabase().'}`
      };
    }
  }

  loadDashboardData(): Observable<DashboardData> {
    this.isLoading.set(true);
    this.loadingStatusMessage.set('Syncing dashboard data...');
    this.errorMessage.set(null);

    const url = this.webAppUrl();
    if (url) {
      return from(
        fetch(`${url}?action=getDashboardData`, {
          method: 'GET',
          redirect: 'follow'
        }).then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!json.success) throw new Error(json.error || 'Failed to fetch dashboard data');
          return json.data as DashboardData;
        })
      ).pipe(
        tap(data => {
          this.dashboardData.set(data);
          this.isLoading.set(false);
        }),
        catchError(err => {
          console.warn('Google Web App fetch failed, falling back to local storage', err);
          this.errorMessage.set('Could not sync with Google Sheets. Using local session data.');
          const localData = this.getLocalDashboardData();
          this.dashboardData.set(localData);
          this.isLoading.set(false);
          return of(localData);
        })
      );
    } else {
      const localData = this.getLocalDashboardData();
      this.dashboardData.set(localData);
      this.isLoading.set(false);
      return of(localData);
    }
  }

  getQuiz(quizId: string): Observable<QuizSessionDetail> {
    this.isLoading.set(true);
    this.loadingStatusMessage.set('Loading assessment questions...');
    this.errorMessage.set(null);

    const url = this.webAppUrl();
    if (url) {
      return from(
        fetch(`${url}?action=getQuiz&quizId=${encodeURIComponent(quizId)}`, {
          method: 'GET',
          redirect: 'follow'
        }).then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!json.success || !json.data) {
            const local = this.getLocalQuiz(quizId);
            if (local) return local;
            throw new Error(json.error || 'Quiz session not found in Google Sheets');
          }
          return json.data as QuizSessionDetail;
        })
      ).pipe(
        tap(() => this.isLoading.set(false)),
        catchError(err => {
          console.warn('Remote quiz fetch fallback to local session:', err);
          const local = this.getLocalQuiz(quizId);
          this.isLoading.set(false);
          return local ? of(local) : throwError(() => new Error('Quiz not found'));
        })
      );
    } else {
      const local = this.getLocalQuiz(quizId);
      this.isLoading.set(false);
      return local ? of(local) : throwError(() => new Error('Quiz session not found'));
    }
  }

  /**
   * Generates a new 20-question quiz dynamically using Google Gemini AI,
   * renders it directly onto the UI, and simultaneously syncs to Google Sheets.
   */
  createOnDemandQuiz(): Observable<QuizSessionDetail> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.loadingStatusMessage.set('Generating 20 enterprise architectural scenarios...');

    const apiKey = this.geminiApiKey();

    if (apiKey) {
      return from(this.fetchQuestionsFromGemini(apiKey)).pipe(
        switchMap(async questions => {
          const quizId = 'QZ-AI-' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
          const sessionDetail: QuizSessionDetail = {
            quizId,
            createdAt: new Date().toISOString(),
            type: 'ON_DEMAND',
            status: 'IN_PROGRESS',
            totalQuestions: questions.length,
            score: 0,
            questions: questions
          };

          // Save locally
          this.saveLocalAiQuiz(sessionDetail);

          // Simultaneously sync to Google Sheets
          this.loadingStatusMessage.set('Synchronizing questions to Google Sheets...');
          await this.syncAiQuizToGoogleSheets(sessionDetail);

          this.isLoading.set(false);
          this.loadDashboardData().subscribe();
          return sessionDetail;
        }),
        catchError(async err => {
          console.warn('Gemini API direct call failed, generating from architect bank:', err);
          this.errorMessage.set('Gemini AI call: ' + (err.message || 'Check API key') + '. Using architect question bank.');
          const local = this.createLocalOnDemandQuiz();
          await this.syncAiQuizToGoogleSheets(local);
          this.isLoading.set(false);
          this.loadDashboardData().subscribe();
          return local;
        })
      );
    } else {
      // Fallback if no Gemini Key configured yet
      const local = this.createLocalOnDemandQuiz();
      return from(this.syncAiQuizToGoogleSheets(local)).pipe(
        map(() => {
          this.isLoading.set(false);
          this.loadDashboardData().subscribe();
          return local;
        })
      );
    }
  }

  /**
   * Direct Gemini API client call with prompt instructions for Orion JD
   */
  private async fetchQuestionsFromGemini(apiKey: string): Promise<QuizQuestion[]> {
    const prompt = `
You are an Elite Azure Enterprise Solution Architect and Technical Assessment Lead evaluating senior cloud candidates (15+ years experience) against the Orion Innovation Azure Architect Job Description.

Generate exactly 20 challenging, scenario-based multiple choice questions mapped to the following 6 core competency domains:
1. Enterprise Solution Architecture & Scalability (Active-Active, Multi-Region, Well-Architected Framework, AKS, BCDR) - 5 Questions
2. Cloud Governance, FinOps & CAF (Landing Zones, Azure Policy, Management Groups, Cost Management, Reserved Instances, Hybrid Benefit) - 4 Questions
3. Security, Identity & Zero-Trust (Microsoft Entra ID, PIM, RBAC, Key Vault, Defender for Cloud, Network Security, Private Endpoints) - 4 Questions
4. DevOps, CI/CD & Service Accelerators (Bicep/Terraform modular accelerators, GitHub Actions/Azure Pipelines, OIDC Workload Identity, GTM enablers) - 3 Questions
5. Data, Modern Integration & Hybrid (Event Grid, Service Bus, APIM, Cosmos DB, Event Hubs, Azure Arc) - 2 Questions
6. Consulting, Presales & CTO Advisory (RFP estimation, Strangler Fig migration strategy, CIO/CTO trusted advisor, coaching & mentoring) - 2 Questions

Format Requirements:
Return ONLY valid JSON array with NO surrounding markdown backticks or commentary:
[
  {
    "id": "AZ-AI-01",
    "domain": "Enterprise Solution Architecture & Scalability",
    "question": "An enterprise multi-tier workload hosted on...",
    "options": ["A. Option text...", "B. Option text...", "C. Option text...", "D. Option text..."],
    "correctIndex": 0,
    "explanation": "Detailed architectural rationale referencing Azure Well-Architected Framework...",
    "difficulty": "Enterprise Architect (L400)"
  }
]
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('No candidate content received from Gemini API');

    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions: QuizQuestion[] = JSON.parse(cleanJson);
    return questions;
  }

  /**
   * Simultaneously synchronizes an AI-generated quiz to Google Sheets in the background
   */
  async syncAiQuizToGoogleSheets(session: QuizSessionDetail): Promise<boolean> {
    const url = this.webAppUrl();
    if (!url) {
      console.log('No Google Apps Script URL configured, running locally.');
      return false;
    }

    try {
      console.log('Syncing quiz to Google Sheets:', session.quizId, 'Questions count:', session.questions.length);
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncAiGeneratedQuiz',
          quizId: session.quizId,
          type: session.type,
          questions: session.questions
        })
      });

      if (!res.ok) {
        console.warn('Google Sheets sync HTTP error status:', res.status);
        return false;
      }

      const data = await res.json();
      console.log('Google Sheets sync response:', data);
      return data?.success === true;
    } catch (err) {
      console.warn('Google Sheets sync network error:', err);
      return false;
    }
  }

  submitQuiz(submission: QuizSubmission): Observable<QuizResult> {
    this.isLoading.set(true);
    this.loadingStatusMessage.set('Evaluating answers and synchronizing score...');
    this.errorMessage.set(null);

    const url = this.webAppUrl();
    if (url) {
      return from(
        fetch(url, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitQuiz',
            quizId: submission.quizId,
            answers: submission.answers
          })
        }).then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!json.success || !json.data) throw new Error(json.error || json.message || 'Failed to submit quiz');
          return json.data as QuizResult;
        })
      ).pipe(
        tap(() => {
          this.isLoading.set(false);
          this.loadDashboardData().subscribe();
        }),
        catchError(err => {
          console.warn('Remote submission failed, processing locally', err);
          const localResult = this.submitLocalQuiz(submission);
          this.isLoading.set(false);
          this.loadDashboardData().subscribe();
          return of(localResult);
        })
      );
    } else {
      const localResult = this.submitLocalQuiz(submission);
      this.isLoading.set(false);
      this.loadDashboardData().subscribe();
      return of(localResult);
    }
  }

  /**
   * Helper to trigger a sample 9:00 AM daily scheduled quiz locally
   */
  generateSampleDailyQuiz(): void {
    const timestamp = new Date().toISOString();
    const id = 'QZ-DAILY-' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const sessions = this.getLocalSessions();

    const newDaily: QuizSessionSummary = {
      quizId: id,
      createdAt: timestamp,
      type: 'SCHEDULED_DAILY',
      status: 'PENDING',
      totalQuestions: 20,
      score: 0
    };

    sessions.unshift(newDaily);
    this.saveLocalSessions(sessions);
    this.loadDashboardData();
  }

  // ---------------- Private Local Storage Helpers ----------------

  private loadStorageKey(key: string): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key) || '';
    }
    return '';
  }

  private initLocalDataIfEmpty(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const existing = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!existing) {
      const now = new Date();
      const today9am = new Date(now);
      today9am.setHours(9, 0, 0, 0);

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(9, 0, 0, 0);

      const initialSessions: QuizSessionSummary[] = [
        {
          quizId: 'QZ-DAILY-' + today9am.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
          createdAt: today9am.toISOString(),
          type: 'SCHEDULED_DAILY',
          status: 'PENDING',
          totalQuestions: 20,
          score: 0
        },
        {
          quizId: 'QZ-DAILY-' + yesterday.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
          createdAt: yesterday.toISOString(),
          type: 'SCHEDULED_DAILY',
          status: 'COMPLETED',
          totalQuestions: 20,
          score: 18,
          completedAt: new Date(yesterday.getTime() + 25 * 60000).toISOString()
        }
      ];

      this.saveLocalSessions(initialSessions);
    }
  }

  private getLocalSessions(): QuizSessionSummary[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalSessions(sessions: QuizSessionSummary[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    }
  }

  private getLocalDashboardData(): DashboardData {
    const sessions = this.getLocalSessions();
    const pending = sessions.filter(s => s.status === 'PENDING');
    const history = sessions.filter(s => s.status === 'COMPLETED');

    let totalCompleted = 0;
    let totalScore = 0;
    let totalPossible = 0;

    history.forEach(h => {
      totalCompleted++;
      totalScore += h.score;
      totalPossible += h.totalQuestions;
    });

    const averageAccuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const domainMastery = this.calculateDynamicDomainMastery(history);

    return {
      pendingQuizzes: pending.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      history: history.sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()),
      stats: {
        totalCompleted,
        averageAccuracy,
        pendingCount: pending.length,
        currentStreakDays: history.length > 0 ? Math.min(history.length, 7) : 0,
        domainMastery
      }
    };
  }

  private calculateDynamicDomainMastery(history: QuizSessionSummary[]): { [domain in AzureDomain]?: number } {
    const allDomains: AzureDomain[] = [
      'Enterprise Solution Architecture & Scalability',
      'Cloud Governance, FinOps & CAF',
      'Security, Identity & Zero-Trust',
      'DevOps, CI/CD & Service Accelerators',
      'Data, Modern Integration & Hybrid',
      'Consulting, Presales & CTO Advisory'
    ];

    const domainStats: { [domain in AzureDomain]?: { correct: number; total: number } } = {};
    allDomains.forEach(d => {
      domainStats[d] = { correct: 0, total: 0 };
    });

    if (typeof window !== 'undefined' && window.localStorage) {
      history.forEach(session => {
        try {
          const qStored = localStorage.getItem('azure_quiz_questions_' + session.quizId);
          const rStored = localStorage.getItem(STORAGE_KEY_RESULTS + '_' + session.quizId);
          if (qStored && rStored) {
            const questions: QuizQuestion[] = JSON.parse(qStored);
            const answers: { [qId: string]: number } = JSON.parse(rStored);
            questions.forEach(q => {
              const d = q.domain as AzureDomain;
              if (domainStats[d]) {
                domainStats[d]!.total++;
                const userAns = answers[q.id];
                if (userAns !== undefined && Number(userAns) === Number(q.correctIndex)) {
                  domainStats[d]!.correct++;
                }
              }
            });
          }
        } catch { }
      });
    }

    const result: { [domain in AzureDomain]?: number } = {};
    allDomains.forEach(d => {
      const stats = domainStats[d]!;
      result[d] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    });

    return result;
  }

  private getLocalQuiz(quizId: string): QuizSessionDetail | null {
    const sessions = this.getLocalSessions();
    const session = sessions.find(s => s.quizId === quizId);
    if (!session) return null;

    let savedQuestions: QuizQuestion[] = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('azure_quiz_questions_' + quizId);
        if (stored) savedQuestions = JSON.parse(stored);
      } catch { }
    }

    const baseQuestions = savedQuestions.length > 0 ? savedQuestions : MOCK_AZURE_QUESTIONS;

    let resultsMap: { [qId: string]: number } = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedResults = localStorage.getItem(STORAGE_KEY_RESULTS + '_' + quizId);
        if (savedResults) resultsMap = JSON.parse(savedResults);
      } catch { }
    }

    const questions: QuizQuestion[] = baseQuestions.map(q => {
      if (session.status === 'COMPLETED') {
        const userAnswer = resultsMap[q.id] !== undefined ? resultsMap[q.id] : 0;
        return {
          ...q,
          userAnswer: userAnswer,
          isCorrect: userAnswer === q.correctIndex
        };
      }
      return {
        id: q.id,
        domain: q.domain,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty
      };
    });

    return {
      quizId: session.quizId,
      createdAt: session.createdAt,
      type: session.type,
      status: session.status,
      totalQuestions: questions.length,
      score: session.score,
      questions: questions
    };
  }

  private saveLocalAiQuiz(session: QuizSessionDetail): void {
    const summary: QuizSessionSummary = {
      quizId: session.quizId,
      createdAt: session.createdAt,
      type: session.type,
      status: session.status,
      totalQuestions: session.questions.length,
      score: 0
    };

    const sessions = this.getLocalSessions();
    sessions.unshift(summary);
    this.saveLocalSessions(sessions);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('azure_quiz_questions_' + session.quizId, JSON.stringify(session.questions));
    }
  }

  private createLocalOnDemandQuiz(): QuizSessionDetail {
    const id = 'QZ-ONDEMAND-' + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const timestamp = new Date().toISOString();

    const shuffled = [...MOCK_AZURE_QUESTIONS].sort(() => 0.5 - Math.random());
    const questions: QuizQuestion[] = shuffled.slice(0, 20).map(q => ({
      id: q.id,
      domain: q.domain,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty
    }));

    const detail: QuizSessionDetail = {
      quizId: id,
      createdAt: timestamp,
      type: 'ON_DEMAND',
      status: 'IN_PROGRESS',
      totalQuestions: questions.length,
      score: 0,
      questions: questions
    };

    this.saveLocalAiQuiz(detail);
    return detail;
  }

  private submitLocalQuiz(submission: QuizSubmission): QuizResult {
    let score = 0;
    const sessionQuiz = this.getLocalQuiz(submission.quizId);
    const baseQuestions = sessionQuiz?.questions || MOCK_AZURE_QUESTIONS;
    const results: QuizQuestion[] = [];

    baseQuestions.forEach(q => {
      const userAnswer = submission.answers[q.id] !== undefined ? submission.answers[q.id] : -1;
      const isCorrect = userAnswer === q.correctIndex;
      if (isCorrect) score++;

      results.push({
        ...q,
        userAnswer,
        isCorrect
      });
    });

    const now = new Date().toISOString();
    const sessions = this.getLocalSessions();
    const idx = sessions.findIndex(s => s.quizId === submission.quizId);

    if (idx !== -1) {
      sessions[idx].status = 'COMPLETED';
      sessions[idx].score = score;
      sessions[idx].completedAt = now;
      this.saveLocalSessions(sessions);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_RESULTS + '_' + submission.quizId, JSON.stringify(submission.answers));
    }

    return {
      quizId: submission.quizId,
      score: score,
      totalQuestions: results.length,
      percentage: Math.round((score / results.length) * 100),
      results: results,
      completedAt: now
    };
  }
}
