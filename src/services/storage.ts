import type { ExamSession, MistakeRecord, SubjectKey } from '../types/quiz';

const getStorageKey = (prefix: string, subject: SubjectKey): string => {
  return `${prefix}_${subject.toLowerCase()}_v1`;
};

const KEY_LAST_SUBJECT = 'cdac_last_subject_v1';

export class StorageService {
  // --- Selected Subject Memory ---
  static getLastSubject(): SubjectKey | null {
    try {
      const val = localStorage.getItem(KEY_LAST_SUBJECT);
      if (val === 'JAVA' || val === 'DBMS') return val;
      return null;
    } catch {
      return null;
    }
  }

  static setLastSubject(subject: SubjectKey | null): void {
    try {
      if (subject) {
        localStorage.setItem(KEY_LAST_SUBJECT, subject);
      } else {
        localStorage.removeItem(KEY_LAST_SUBJECT);
      }
    } catch {
      // Ignore
    }
  }

  // --- Bookmarks ---
  static getBookmarks(subject: SubjectKey): number[] {
    try {
      const data = localStorage.getItem(getStorageKey('cdac_bookmarks', subject));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static isBookmarked(subject: SubjectKey, questionId: number): boolean {
    const list = this.getBookmarks(subject);
    return list.includes(questionId);
  }

  static toggleBookmark(subject: SubjectKey, questionId: number): boolean {
    const list = this.getBookmarks(subject);
    const index = list.indexOf(questionId);
    let newState = false;
    if (index >= 0) {
      list.splice(index, 1);
      newState = false;
    } else {
      list.push(questionId);
      newState = true;
    }
    localStorage.setItem(getStorageKey('cdac_bookmarks', subject), JSON.stringify(list));
    return newState;
  }

  // --- Mistakes Bank (Spaced Repetition) ---
  static getMistakes(subject: SubjectKey): Record<number, MistakeRecord> {
    try {
      const data = localStorage.getItem(getStorageKey('cdac_mistakes', subject));
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static recordAnswerResult(subject: SubjectKey, questionId: number, isCorrect: boolean): void {
    const mistakes = this.getMistakes(subject);
    const current = mistakes[questionId] || {
      questionId,
      subjectKey: subject,
      wrongCount: 0,
      consecutiveCorrect: 0,
      lastAttemptedAt: new Date().toISOString(),
    };

    if (isCorrect) {
      current.consecutiveCorrect += 1;
      // If answered correctly 2 times consecutively, eliminate from mistake notebook
      if (current.consecutiveCorrect >= 2) {
        delete mistakes[questionId];
      } else {
        mistakes[questionId] = current;
      }
    } else {
      current.wrongCount += 1;
      current.consecutiveCorrect = 0;
      current.lastAttemptedAt = new Date().toISOString();
      mistakes[questionId] = current;
    }

    localStorage.setItem(getStorageKey('cdac_mistakes', subject), JSON.stringify(mistakes));
  }

  // --- Active Session for Auto-recovery ---
  static saveActiveSession(session: ExamSession): void {
    try {
      localStorage.setItem(getStorageKey('cdac_active_session', session.subjectKey), JSON.stringify(session));
    } catch {
      // Ignore
    }
  }

  static getActiveSession(subject: SubjectKey): ExamSession | null {
    try {
      const data = localStorage.getItem(getStorageKey('cdac_active_session', subject));
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static clearActiveSession(subject: SubjectKey): void {
    localStorage.removeItem(getStorageKey('cdac_active_session', subject));
  }

  // --- History & Stats ---
  static saveExamHistory(session: ExamSession): void {
    try {
      const history: ExamSession[] = this.getExamHistory(session.subjectKey);
      history.unshift(session);
      if (history.length > 30) history.pop();
      localStorage.setItem(getStorageKey('cdac_history', session.subjectKey), JSON.stringify(history));
    } catch {
      // Ignore
    }
  }

  static getExamHistory(subject: SubjectKey): ExamSession[] {
    try {
      const data = localStorage.getItem(getStorageKey('cdac_history', subject));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Global question answer history (for module progress bars)
  static recordModuleStat(subject: SubjectKey, questionId: number, moduleId: number, isCorrect: boolean): void {
    try {
      const key = getStorageKey('cdac_answer_logs', subject);
      const raw = localStorage.getItem(key);
      const logs: Record<number, { isCorrect: boolean; moduleId: number }> = raw ? JSON.parse(raw) : {};
      logs[questionId] = { isCorrect, moduleId };
      localStorage.setItem(key, JSON.stringify(logs));
    } catch {
      // Ignore
    }
  }

  static getModuleStats(subject: SubjectKey): Record<number, { totalAttempted: number; correctCount: number }> {
    try {
      const key = getStorageKey('cdac_answer_logs', subject);
      const raw = localStorage.getItem(key);
      const logs: Record<number, { isCorrect: boolean; moduleId: number }> = raw ? JSON.parse(raw) : {};
      const stats: Record<number, { totalAttempted: number; correctCount: number }> = {};

      const maxModules = subject === 'JAVA' ? 16 : 13;
      for (let i = 1; i <= maxModules; i++) {
        stats[i] = { totalAttempted: 0, correctCount: 0 };
      }

      Object.values(logs).forEach(log => {
        if (!stats[log.moduleId]) {
          stats[log.moduleId] = { totalAttempted: 0, correctCount: 0 };
        }
        stats[log.moduleId].totalAttempted += 1;
        if (log.isCorrect) {
          stats[log.moduleId].correctCount += 1;
        }
      });

      return stats;
    } catch {
      return {};
    }
  }

  // Overall Subject Progress Summary (for Portal Cards)
  static getSubjectSummary(subject: SubjectKey, totalQuestions: number): {
    attemptedCount: number;
    accuracy: number;
    mistakesCount: number;
    progressPercentage: number;
  } {
    const stats = this.getModuleStats(subject);
    let attemptedCount = 0;
    let correctCount = 0;
    Object.values(stats).forEach(s => {
      attemptedCount += s.totalAttempted;
      correctCount += s.correctCount;
    });

    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const progressPercentage = totalQuestions > 0 ? Math.min(100, Math.round((attemptedCount / totalQuestions) * 100)) : 0;
    const mistakesCount = Object.keys(this.getMistakes(subject)).length;

    return {
      attemptedCount,
      accuracy,
      mistakesCount,
      progressPercentage,
    };
  }
}
