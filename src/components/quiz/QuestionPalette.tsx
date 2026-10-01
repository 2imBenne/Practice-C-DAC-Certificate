import React, { useState } from 'react';
import type { OptionKey } from '../../types/quiz';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, OptionKey>;
  questionIds: number[];
  bookmarks: number[];
  onSelectIndex: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  bookmarks,
  onSelectIndex,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNANSWERED' | 'BOOKMARKED'>('ALL');

  const filteredIndices: number[] = [];
  for (let i = 0; i < totalQuestions; i++) {
    const qId = questionIds[i];
    const isAnswered = answers[qId] !== undefined;
    const isFlagged = bookmarks.includes(qId);

    if (filter === 'UNANSWERED' && isAnswered) continue;
    if (filter === 'BOOKMARKED' && !isFlagged) continue;
    filteredIndices.push(i);
  }

  const answeredCount = Object.keys(answers).length;
  const bookmarkedCount = questionIds.filter(id => bookmarks.includes(id)).length;

  return (
    <div className="glass-panel palette-card" id="question-palette">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Danh Sách Câu Hỏi</h4>
        <span className="badge badge-indigo">
          {answeredCount} / {totalQuestions} đã làm
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem' }}>
        <button
          type="button"
          className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
          onClick={() => setFilter('ALL')}
        >
          Tất cả
        </button>
        <button
          type="button"
          className={`btn ${filter === 'UNANSWERED' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
          onClick={() => setFilter('UNANSWERED')}
        >
          Chưa làm
        </button>
        <button
          type="button"
          className={`btn ${filter === 'BOOKMARKED' ? 'btn-primary' : 'btn-outline'}`}
          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
          onClick={() => setFilter('BOOKMARKED')}
        >
          Đã lưu ({bookmarkedCount})
        </button>
      </div>

      {/* Grid of numbers */}
      <div className="palette-grid">
        {filteredIndices.map(idx => {
          const qId = questionIds[idx];
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[qId] !== undefined;
          const isFlagged = bookmarks.includes(qId);

          let className = 'palette-btn';
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
              type="button"
              id={`palette-btn-${idx + 1}`}
              className={className}
              onClick={() => onSelectIndex(idx)}
              title={`Câu ${idx + 1}${isAnswered ? ' (Đã chọn: ' + answers[qId] + ')' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="palette-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--accent-primary)' }} />
          <span>Đang xem</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--success)' }} />
          <span>Đã làm</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--warning)' }} />
          <span>Đánh dấu</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: 'var(--bg-surface-light)' }} />
          <span>Chưa làm</span>
        </div>
      </div>
    </div>
  );
};
