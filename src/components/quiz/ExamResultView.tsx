import React, { useEffect, useState } from 'react';
import type { ExamSession, OptionKey, QuestionItem } from '../../types/quiz';
import { JavaCodeViewer } from './JavaCodeViewer';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ExamResultViewProps {
  session: ExamSession;
  questions: QuestionItem[];
  onRetake: () => void;
  onDrillMistakes: () => void;
  onGoHome: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  session,
  questions,
  onRetake,
  onDrillMistakes,
  onGoHome,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'INCORRECT'>('ALL');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const mistakesQuestions: QuestionItem[] = [];

  questions.forEach(q => {
    const userAns = session.answers[q.id];
    if (!userAns) {
      unansweredCount += 1;
      mistakesQuestions.push(q);
    } else if (userAns === q.correctAnswer) {
      correctCount += 1;
    } else {
      incorrectCount += 1;
      mistakesQuestions.push(q);
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 60; // CDAC 60% pass threshold

  // Launch confetti if passed
  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isPassed]);

  const toggleExpand = (qId: number) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const displayedQuestions = filter === 'INCORRECT' ? mistakesQuestions : questions;

  return (
    <div id="exam-result-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner / Card */}
      <div className="glass-panel result-container">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${isPassed ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
            {isPassed ? '🎉 ĐẠT CHUẨN CDAC (PASS)' : '⚠️ CẦN ÔN LUYỆN THÊM (FAIL)'}
          </span>
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Kết Quả Bài Thi Trắc Nghiệm</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
          {isPassed
            ? 'Xuất sắc! Bạn đã vượt qua ngưỡng điểm yêu cầu (60%) của chứng chỉ CDAC Core Java.'
            : 'Đừng nản lòng! Hãy rà soát lại các câu sai bên dưới và luyện tập thêm ở các chuyên đề yếu.'}
        </p>

        {/* Big Score Circle */}
        <div
          className="score-circle"
          style={{
            borderColor: isPassed ? 'var(--success)' : 'var(--danger)',
            boxShadow: isPassed ? '0 0 35px var(--success-glow)' : '0 0 35px rgba(239, 68, 68, 0.25)',
          }}
        >
          <span className="score-big" style={{ color: isPassed ? '#10b981' : '#ef4444' }}>
            {percentage}%
          </span>
          <span className="score-sub">
            {correctCount} / {totalQuestions} câu đúng
          </span>
        </div>

        {/* 3 Metric Pills */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={22} color="#10b981" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>{correctCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Câu đúng</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <XCircle size={22} color="#ef4444" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ef4444' }}>{incorrectCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Câu sai</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={22} color="#f59e0b" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f59e0b' }}>{unansweredCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chưa làm</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onRetake}>
            <RotateCcw size={16} />
            <span>Làm lại bài này</span>
          </button>

          {mistakesQuestions.length > 0 && (
            <button type="button" className="btn btn-danger" onClick={onDrillMistakes}>
              <span>Luyện lại {mistakesQuestions.length} câu làm sai</span>
            </button>
          )}

          <button type="button" className="btn btn-primary" onClick={onGoHome}>
            <Home size={16} />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>

      {/* Question by Question Review Header */}
      <div>
        <div className="section-header">
          <h3 className="section-title">
            <span>Chi Tiết Từng Câu Hỏi</span>
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setFilter('ALL')}
            >
              Tất cả ({totalQuestions})
            </button>
            <button
              type="button"
              className={`btn ${filter === 'INCORRECT' ? 'btn-danger' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setFilter('INCORRECT')}
            >
              Chỉ câu sai / Chưa làm ({mistakesQuestions.length})
            </button>
          </div>
        </div>

        {/* Questions Review List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayedQuestions.map((q) => {
            const userAns = session.answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const isUnanswered = !userAns;
            const isExpanded = expandedQuestions[q.id] !== false; // expanded by default

            return (
              <div
                key={q.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleExpand(q.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-indigo">Câu {q.id}</span>
                    <span className="badge badge-emerald">{q.moduleName}</span>
                    {isCorrect ? (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={12} /> Bạn chọn: {userAns} (Chính xác)
                      </span>
                    ) : isUnanswered ? (
                      <span className="badge badge-amber">
                        <AlertTriangle size={12} /> Chưa trả lời (Đáp án đúng: {q.correctAnswer})
                      </span>
                    ) : (
                      <span className="badge badge-rose">
                        <XCircle size={12} /> Bạn chọn: {userAns} (Sai - Đáp án: {q.correctAnswer})
                      </span>
                    )}
                  </div>

                  <button type="button" className="btn btn-outline btn-icon" style={{ width: '28px', height: '28px' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>
                      {q.questionText}
                    </p>

                    {q.hasCode && q.codeSnippet && <JavaCodeViewer code={q.codeSnippet} language={q.codeLanguage || 'java'} />}

                    <div className="review-options-grid">
                      {(['A', 'B', 'C', 'D'] as OptionKey[]).map(key => {
                        const optText = q.options[key];
                        if (!optText) return null;
                        const isRightOpt = q.correctAnswer === key;
                        const isUserChoice = userAns === key;

                        let bg = 'var(--bg-surface)';
                        let border = '1px solid var(--border-subtle)';
                        let textColor = 'var(--text-secondary)';

                        if (isRightOpt) {
                          bg = 'var(--success-bg)';
                          border = '1px solid var(--success-border)';
                          textColor = '#6ee7b7';
                        } else if (isUserChoice && !isRightOpt) {
                          bg = 'var(--danger-bg)';
                          border = '1px solid var(--danger-border)';
                          textColor = '#fca5a5';
                        }

                        return (
                          <div
                            key={key}
                            style={{
                              padding: '0.65rem 0.9rem',
                              borderRadius: '8px',
                              background: bg,
                              border: border,
                              color: textColor,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{key}.</span>
                            <span>{optText}</span>
                            {isRightOpt && <CheckCircle2 size={14} color="#10b981" style={{ marginLeft: 'auto' }} />}
                            {isUserChoice && !isRightOpt && <XCircle size={14} color="#ef4444" style={{ marginLeft: 'auto' }} />}
                          </div>
                        );
                      })}
                    </div>

                    {q.correctAnswerText && (
                      <div className="explanation-box" style={{ marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                          Giải thích / Đáp án chuẩn: {q.correctAnswer} - {q.options[q.correctAnswer]}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
