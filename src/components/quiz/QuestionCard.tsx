import React from 'react';
import type { OptionKey, QuestionItem } from '../../types/quiz';
import { JavaCodeViewer } from './JavaCodeViewer';
import { OptionButton } from './OptionButton';
import { Bookmark, ChevronLeft, ChevronRight, Check, Send } from 'lucide-react';

interface QuestionCardProps {
  question: QuestionItem;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer?: OptionKey;
  isEvaluated: boolean;
  isBookmarked: boolean;
  isMockExam?: boolean;
  onSelectOption: (option: OptionKey) => void;
  onToggleBookmark: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmitExam?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isEvaluated,
  isBookmarked,
  isMockExam = false,
  onSelectOption,
  onToggleBookmark,
  onPrev,
  onNext,
  onSubmitExam,
}) => {
  const optionsKeys: OptionKey[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="glass-panel question-container" id="current-question-card">
      {/* Top Meta Bar */}
      <div className="question-meta-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-indigo">
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="badge badge-emerald" style={{ fontWeight: 600 }}>
            {question.moduleName}
          </span>
          {question.note && (
            <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
              {question.note}
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-toggle-bookmark"
          className={`btn ${isBookmarked ? 'btn-danger' : 'btn-outline'}`}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          onClick={onToggleBookmark}
          title={isBookmarked ? 'Bỏ lưu câu hỏi' : 'Lưu vào danh sách chú ý'}
        >
          <Bookmark size={14} fill={isBookmarked ? '#ef4444' : 'none'} />
          <span>{isBookmarked ? 'Đã lưu' : 'Lưu câu'}</span>
        </button>
      </div>

      {/* Question Prompt */}
      <div className="question-prompt" id="question-text">
        {question.questionText}
      </div>

      {/* Code Snippet Box (if present) */}
      {question.hasCode && question.codeSnippet && (
        <JavaCodeViewer code={question.codeSnippet} language={question.codeLanguage || 'java'} />
      )}

      {/* 4 Options */}
      <div className="options-list" id="options-container">
        {optionsKeys.map(key => {
          const text = question.options[key];
          if (!text) return null;
          return (
            <OptionButton
              key={key}
              optionKey={key}
              text={text}
              isSelected={selectedAnswer === key}
              isEvaluated={isEvaluated}
              isCorrectAnswer={question.correctAnswer === key}
              disabled={isEvaluated && !isMockExam}
              onClick={() => onSelectOption(key)}
            />
          );
        })}
      </div>

      {/* Instant Answer & Explanation (in Practice Mode or after Submission) */}
      {isEvaluated && (
        <div className="explanation-box" id="explanation-box">
          <div className="explanation-title">
            <Check size={18} color="#10b981" />
            <span>Đáp án đúng: {question.correctAnswer} - {question.options[question.correctAnswer]}</span>
          </div>
          {question.correctAnswerText && question.correctAnswerText !== question.options[question.correctAnswer] && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <strong>Nội dung gốc:</strong> {question.correctAnswerText}
            </p>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            💡 Mẹo: Xem lại chuyên đề <strong>{question.moduleName}</strong> để củng cố các cấu trúc và nguyên lý cốt lõi.
          </p>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="card-bottom-bar">
        <button
          type="button"
          id="btn-prev-question"
          className="btn btn-secondary"
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} />
          <span>Câu trước</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isMockExam && onSubmitExam && (
            <button
              type="button"
              id="btn-submit-exam"
              className="btn btn-danger"
              onClick={onSubmitExam}
            >
              <Send size={15} />
              <span>Nộp bài thi</span>
            </button>
          )}

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              id="btn-next-question"
              className="btn btn-primary"
              onClick={onNext}
            >
              <span>Câu tiếp</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            !isMockExam && (
              <span className="badge badge-emerald" style={{ padding: '0.6rem 0.85rem' }}>
                Đã hết câu hỏi
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};
