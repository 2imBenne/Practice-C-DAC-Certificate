import React, { useEffect, useRef } from 'react';
import type { OptionKey } from '../../types/quiz';

interface MobileQuestionStripProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, OptionKey>;
  questionIds: number[];
  bookmarks: number[];
  onSelectIndex: (index: number) => void;
}

export const MobileQuestionStrip: React.FC<MobileQuestionStripProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  bookmarks,
  onSelectIndex,
}) => {
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active question into view horizontally
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  return (
    <div className="glass-panel mobile-question-strip-container" style={{ padding: '0.65rem 0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          Điều hướng câu hỏi:
        </span>
        <span className="badge badge-indigo">
          {Object.keys(answers).length} / {totalQuestions} đã làm
        </span>
      </div>

      <div className="mobile-question-strip" id="mobile-question-strip">
        {questionIds.map((qId, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[qId] !== undefined;
          const isFlagged = bookmarks.includes(qId);

          let className = 'mobile-strip-item';
          if (isCurrent) {
            className += ' active';
          } else if (isFlagged) {
            className += ' flagged';
          } else if (isAnswered) {
            className += ' answered';
          }

          return (
            <button
              key={idx}
              ref={isCurrent ? activeBtnRef : null}
              type="button"
              className={className}
              onClick={() => onSelectIndex(idx)}
              title={`Câu ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
