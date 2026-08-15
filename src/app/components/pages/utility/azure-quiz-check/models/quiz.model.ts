export type AzureDomain =
  | 'Enterprise Solution Architecture & Scalability'
  | 'Cloud Governance, FinOps & CAF'
  | 'Security, Identity & Zero-Trust'
  | 'DevOps, CI/CD & Service Accelerators'
  | 'Data, Modern Integration & Hybrid'
  | 'Consulting, Presales & CTO Advisory';

export interface QuizQuestion {
  id: string;
  domain: AzureDomain;
  question: string;
  options: string[];
  correctIndex?: number;
  explanation?: string;
  difficulty?: string;
  userAnswer?: number;
  isCorrect?: boolean;
}

export type QuizType = 'SCHEDULED_DAILY' | 'ON_DEMAND';
export type QuizStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface QuizSessionSummary {
  quizId: string;
  createdAt: string;
  type: QuizType;
  status: QuizStatus;
  totalQuestions: number;
  score: number;
  completedAt?: string;
}

export interface QuizSessionDetail {
  quizId: string;
  createdAt: string;
  type: QuizType;
  status: QuizStatus;
  totalQuestions: number;
  score: number;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  quizId: string;
  answers: { [questionId: string]: number };
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  results: QuizQuestion[];
  completedAt: string;
}

export interface DashboardStats {
  totalCompleted: number;
  averageAccuracy: number;
  pendingCount: number;
  currentStreakDays: number;
  domainMastery?: { [domain in AzureDomain]?: number };
}

export interface DashboardData {
  pendingQuizzes: QuizSessionSummary[];
  history: QuizSessionSummary[];
  stats: DashboardStats;
}
