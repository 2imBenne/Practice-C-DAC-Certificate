export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type SubjectKey = 'JAVA' | 'DBMS';

export interface SubjectMeta {
  id: SubjectKey;
  name: string;
  shortName: string;
  badge: string;
  icon: string;
  description: string;
  totalQuestions: number;
  totalModules: number;
  accentColor: string;
  tags: string[];
}

export interface QuestionItem {
  id: number;
  subjectKey: SubjectKey;
  moduleId: number;
  moduleName: string;
  rawContent: string;
  questionText: string;
  hasCode: boolean;
  codeLanguage?: 'java' | 'sql';
  codeSnippet: string | null;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: OptionKey;
  correctAnswerText: string;
  note: string;
}

export interface ModuleMeta {
  id: number;
  code: string;
  name: string;
  questionCount: number;
  range: string;
}

export type QuizMode = 'PRACTICE' | 'MOCK_EXAM' | 'MISTAKE_DRILL' | 'BOOKMARKS';

export interface ExamSession {
  sessionId: string;
  subjectKey: SubjectKey;
  mode: QuizMode;
  title: string;
  moduleId?: number;
  questionIds: number[];
  currentIndex: number;
  answers: Record<number, OptionKey>;
  isSubmitted: boolean;
  timeRemaining: number; // in seconds
  totalTime: number;      // in seconds
  score?: number;
  startedAt: string;
  completedAt?: string;
}

export interface MistakeRecord {
  questionId: number;
  subjectKey: SubjectKey;
  wrongCount: number;
  consecutiveCorrect: number;
  lastAttemptedAt: string;
}

export interface BookmarkRecord {
  questionId: number;
  subjectKey: SubjectKey;
  markedAt: string;
  note?: string;
}
