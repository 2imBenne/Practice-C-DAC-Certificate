import React, { useState, useEffect, useCallback } from 'react';
import type { ExamSession, OptionKey, QuizMode, SubjectKey } from './types/quiz';
import { QuizDataService } from './services/quizData';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { SubjectPortalView } from './components/portal/SubjectPortalView';
import { DashboardView } from './components/dashboard/DashboardView';
import { QuestionCard } from './components/quiz/QuestionCard';
import { QuestionPalette } from './components/quiz/QuestionPalette';
import { MobileQuestionStrip } from './components/quiz/MobileQuestionStrip';
import { ExamTimer } from './components/quiz/ExamTimer';
import { ExamResultView } from './components/quiz/ExamResultView';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentSubject, setCurrentSubject] = useState<SubjectKey | null>(() => {
    return StorageService.getLastSubject();
  });
  const [view, setView] = useState<'PORTAL' | 'DASHBOARD' | 'ARENA' | 'RESULT'>(() => {
    return StorageService.getLastSubject() ? 'DASHBOARD' : 'PORTAL';
  });

  const [session, setSession] = useState<ExamSession | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState<Record<number, any>>({});
  const [restorePrompt, setRestorePrompt] = useState<ExamSession | null>(null);

  // Sync subject state when currentSubject changes
  useEffect(() => {
    if (currentSubject) {
      setBookmarks(StorageService.getBookmarks(currentSubject));
      setMistakes(StorageService.getMistakes(currentSubject));

      const active = StorageService.getActiveSession(currentSubject);
      if (active && !active.isSubmitted) {
        setRestorePrompt(active);
      } else {
        setRestorePrompt(null);
      }
    } else {
      setBookmarks([]);
      setMistakes({});
      setRestorePrompt(null);
    }
  }, [currentSubject]);

  // Save session state to storage when updated
  useEffect(() => {
    if (session && !session.isSubmitted) {
      StorageService.saveActiveSession(session);
    }
  }, [session]);

  // Handle selecting a subject from the portal
  const handleSelectSubject = (subject: SubjectKey) => {
    setCurrentSubject(subject);
    StorageService.setLastSubject(subject);
    setView('DASHBOARD');
  };

  // Switch subject (back to portal)
  const handleSwitchSubject = () => {
    if (session && !session.isSubmitted) {
      const confirmSwitch = window.confirm(
        'Bạn đang có bài thi dở dang. Bạn có chắc chắn muốn rời đi và chọn môn học khác?'
      );
      if (!confirmSwitch) return;
    }
    setCurrentSubject(null);
    StorageService.setLastSubject(null);
    setSession(null);
    setView('PORTAL');
  };

  // Data for current subject
  const modules = currentSubject ? QuizDataService.getAllModules(currentSubject) : [];
  const allQuestions = currentSubject ? QuizDataService.getAllQuestions(currentSubject) : [];

  // Start a new quiz session
  const startSession = (mode: QuizMode, questionIds: number[], title: string, durationMinutes = 0, moduleId?: number) => {
    if (!currentSubject) return;
    if (questionIds.length === 0) {
      alert('Không có câu hỏi nào để hiển thị cho chế độ này!');
      return;
    }

    const newSession: ExamSession = {
      sessionId: `sess_${Date.now()}`,
      subjectKey: currentSubject,
      mode,
      title,
      moduleId,
      questionIds,
      currentIndex: 0,
      answers: {},
      isSubmitted: false,
      timeRemaining: durationMinutes * 60,
      totalTime: durationMinutes * 60,
      startedAt: new Date().toISOString(),
    };

    setSession(newSession);
    setView('ARENA');
  };

  // Mode Triggers
  const handleStartModule = (moduleId: number) => {
    if (!currentSubject) return;
    const qList = QuizDataService.getQuestionsByModule(currentSubject, moduleId);
    const mod = modules.find(m => m.id === moduleId);
    startSession('PRACTICE', qList.map(q => q.id), mod ? mod.name : `Module ${moduleId}`, 0, moduleId);
  };

  const handleStartMockExam = () => {
    if (!currentSubject) return;
    const qList = QuizDataService.getRandomQuestions(currentSubject, 40);
    const subjectTitle = currentSubject === 'JAVA' ? 'Java Core' : 'DBMS & SQL';
    startSession('MOCK_EXAM', qList.map(q => q.id), `Thi Thử Chuẩn CDAC ${subjectTitle} (40 Câu)`, 45);
  };

  const handleStartAllQuestions = () => {
    if (!currentSubject) return;
    const subjectTitle = currentSubject === 'JAVA' ? 'Java Core' : 'DBMS & SQL';
    startSession('PRACTICE', allQuestions.map(q => q.id), `Luyện Tập Toàn Bộ ${allQuestions.length} Câu ${subjectTitle}`, 0);
  };

  const handleStartMistakeDrill = () => {
    if (!currentSubject) return;
    const mistakeIds = Object.keys(mistakes).map(Number);
    if (mistakeIds.length === 0) {
      alert('Chúc mừng! Bạn hiện không có câu hỏi nào trong Sổ câu sai của môn này.');
      return;
    }
    startSession('MISTAKE_DRILL', mistakeIds, `Sổ Tay Phục Thù (${mistakeIds.length} Câu)`, 0);
  };

  const handleOpenBookmarks = () => {
    if (!currentSubject) return;
    const bList = StorageService.getBookmarks(currentSubject);
    if (bList.length === 0) {
      alert('Bạn chưa đánh dấu câu hỏi nào trong môn này. Hãy bấm "Lưu câu" trong khi làm bài để lưu lại các câu cần chú ý!');
      return;
    }
    startSession('BOOKMARKS', bList, `Danh Sách Đã Lưu (${bList.length} Câu)`, 0);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (questionId: number) => {
    if (!currentSubject) return;
    StorageService.toggleBookmark(currentSubject, questionId);
    setBookmarks(StorageService.getBookmarks(currentSubject));
  };

  // Answer a question
  const handleSelectOption = (option: OptionKey) => {
    if (!session || !currentSubject || session.isSubmitted) return;

    const currentQId = session.questionIds[session.currentIndex];
    const q = QuizDataService.getQuestionById(currentSubject, currentQId);
    if (!q) return;

    const isCorrect = q.correctAnswer === option;

    // Record stats and mistakes
    StorageService.recordAnswerResult(currentSubject, currentQId, isCorrect);
    StorageService.recordModuleStat(currentSubject, currentQId, q.moduleId, isCorrect);
    setMistakes(StorageService.getMistakes(currentSubject));

    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [currentQId]: option,
        },
      };
    });
  };

  // Navigation
  const handlePrev = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.currentIndex <= 0) return prev;
      return { ...prev, currentIndex: prev.currentIndex - 1 };
    });
  }, []);

  const handleNext = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.currentIndex >= prev.questionIds.length - 1) return prev;
      return { ...prev, currentIndex: prev.currentIndex + 1 };
    });
  }, []);

  // Submit Exam
  const handleSubmitExam = useCallback(() => {
    if (!session || !currentSubject) return;
    const answeredCount = Object.keys(session.answers).length;
    const total = session.questionIds.length;

    if (session.mode === 'MOCK_EXAM' && answeredCount < total) {
      const confirmSubmit = window.confirm(
        `Bạn mới trả lời ${answeredCount}/${total} câu. Bạn có chắc chắn muốn nộp bài thi không?`
      );
      if (!confirmSubmit) return;
    }

    const updatedSession: ExamSession = {
      ...session,
      isSubmitted: true,
      completedAt: new Date().toISOString(),
    };

    StorageService.saveExamHistory(updatedSession);
    StorageService.clearActiveSession(currentSubject);
    setSession(updatedSession);
    setView('RESULT');
  }, [session, currentSubject]);

  // Keyboard Shortcuts Support (1, 2, 3, 4, A, B, C, D, Arrow Keys, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'ARENA' || !session || session.isSubmitted) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(key as OptionKey);
      } else if (['1', '2', '3', '4'].includes(key)) {
        const keyMap: Record<string, OptionKey> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        handleSelectOption(keyMap[key]);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (key === 'F' || key === 'B') {
        const currentQId = session.questionIds[session.currentIndex];
        handleToggleBookmark(currentQId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, session, handlePrev, handleNext]);

  // Current question object
  const currentQuestionId = session ? session.questionIds[session.currentIndex] : null;
  const currentQuestion = (currentSubject && currentQuestionId)
    ? QuizDataService.getQuestionById(currentSubject, currentQuestionId)
    : null;
  const isEvaluated = session ? (session.mode !== 'MOCK_EXAM' ? !!session.answers[currentQuestionId!] : session.isSubmitted) : false;
  const sessionQuestions = (session && currentSubject)
    ? QuizDataService.getQuestionsByIds(currentSubject, session.questionIds)
    : [];

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header
        currentSubject={currentSubject}
        onGoHome={() => setView('DASHBOARD')}
        onSwitchSubject={handleSwitchSubject}
        onOpenMistakes={handleStartMistakeDrill}
        onOpenBookmarks={handleOpenBookmarks}
        mistakesCount={Object.keys(mistakes).length}
        bookmarksCount={bookmarks.length}
        currentView={view}
      />

      {/* Restore Active Session Modal Prompt */}
      {restorePrompt && currentSubject && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.75rem',
            marginBottom: '1.5rem',
            borderLeft: `4px solid ${currentSubject === 'DBMS' ? '#06b6d4' : '#6366f1'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertCircle size={24} color={currentSubject === 'DBMS' ? '#06b6d4' : '#6366f1'} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Phát hiện bài thi đang làm dở: {restorePrompt.title}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Đã hoàn thành {Object.keys(restorePrompt.answers).length} / {restorePrompt.questionIds.length} câu.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              onClick={() => {
                setSession(restorePrompt);
                setView('ARENA');
                setRestorePrompt(null);
              }}
            >
              Tiếp tục làm bài
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
              onClick={() => {
                StorageService.clearActiveSession(currentSubject);
                setRestorePrompt(null);
              }}
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* View 1: Subject Portal (Initial Landing Screen) */}
      {view === 'PORTAL' && (
        <SubjectPortalView onSelectSubject={handleSelectSubject} />
      )}

      {/* View 2: Subject Dashboard */}
      {view === 'DASHBOARD' && currentSubject && (
        <DashboardView
          subject={currentSubject}
          modules={modules}
          allQuestions={allQuestions}
          mistakesCount={Object.keys(mistakes).length}
          bookmarksCount={bookmarks.length}
          onStartModule={handleStartModule}
          onStartMockExam={handleStartMockExam}
          onStartAllQuestions={handleStartAllQuestions}
          onStartMistakeDrill={handleStartMistakeDrill}
          onSwitchSubject={handleSwitchSubject}
        />
      )}

      {/* View 3: Arena (Quiz Execution) */}
      {view === 'ARENA' && session && currentQuestion && currentSubject && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub Header for Arena */}
          <div
            className="glass-panel"
            style={{
              padding: '0.85rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{session.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Phím tắt: [1, 2, 3, 4] hoặc [A, B, C, D] • [←] / [→] chuyển câu • [F] Lưu câu
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {session.mode === 'MOCK_EXAM' && session.totalTime > 0 && (
                <ExamTimer
                  initialSeconds={session.timeRemaining}
                  onTimeUp={handleSubmitExam}
                  onTick={remaining => {
                    setSession(prev => (prev ? { ...prev, timeRemaining: remaining } : null));
                  }}
                />
              )}

              <button
                type="button"
                className="btn btn-danger"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                onClick={handleSubmitExam}
              >
                {session.mode === 'MOCK_EXAM' ? 'Nộp bài thi' : 'Kết thúc ôn tập'}
              </button>
            </div>
          </div>

          {/* Mobile Horizontal Quick Navigation Strip */}
          <MobileQuestionStrip
            totalQuestions={session.questionIds.length}
            currentIndex={session.currentIndex}
            answers={session.answers}
            questionIds={session.questionIds}
            bookmarks={bookmarks}
            onSelectIndex={idx => {
              setSession(prev => (prev ? { ...prev, currentIndex: idx } : null));
            }}
          />

          {/* Arena Layout: Question Card (Left) + Question Palette (Right on desktop) */}
          <div className="arena-layout">
            <QuestionCard
              question={currentQuestion}
              currentIndex={session.currentIndex}
              totalQuestions={session.questionIds.length}
              selectedAnswer={session.answers[currentQuestion.id]}
              isEvaluated={isEvaluated}
              isBookmarked={bookmarks.includes(currentQuestion.id)}
              isMockExam={session.mode === 'MOCK_EXAM'}
              onSelectOption={handleSelectOption}
              onToggleBookmark={() => handleToggleBookmark(currentQuestion.id)}
              onPrev={handlePrev}
              onNext={handleNext}
              onSubmitExam={handleSubmitExam}
            />

            <QuestionPalette
              totalQuestions={session.questionIds.length}
              currentIndex={session.currentIndex}
              answers={session.answers}
              questionIds={session.questionIds}
              bookmarks={bookmarks}
              onSelectIndex={idx => {
                setSession(prev => (prev ? { ...prev, currentIndex: idx } : null));
              }}
            />
          </div>
        </div>
      )}

      {/* View 4: Result Screen */}
      {view === 'RESULT' && session && currentSubject && (
        <ExamResultView
          session={session}
          questions={sessionQuestions}
          onRetake={() => {
            startSession(session.mode, session.questionIds, session.title, session.totalTime / 60, session.moduleId);
          }}
          onDrillMistakes={() => {
            const wrongIds = session.questionIds.filter(id => {
              const q = QuizDataService.getQuestionById(currentSubject, id);
              return !q || session.answers[id] !== q.correctAnswer;
            });
            if (wrongIds.length > 0) {
              startSession('MISTAKE_DRILL', wrongIds, `Luyện Lại ${wrongIds.length} Câu Làm Sai`, 0);
            }
          }}
          onGoHome={() => setView('DASHBOARD')}
        />
      )}
    </div>
  );
};

export default App;
