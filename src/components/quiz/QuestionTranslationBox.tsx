import React, { useState } from 'react';
import type { OptionKey, QuestionItem } from '../../types/quiz';
import { Languages, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

interface QuestionTranslationBoxProps {
  question: QuestionItem;
  userAnswer?: OptionKey;
  defaultExpanded?: boolean;
}

export const QuestionTranslationBox: React.FC<QuestionTranslationBoxProps> = ({
  question,
  userAnswer,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const optionsKeys: OptionKey[] = ['A', 'B', 'C', 'D'];
  const questionVi = question.questionTextVi || question.questionText;
  const explanationVi = question.explanationVi;

  const googleTranslateUrl = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(
    question.questionText + '\n\n' + optionsKeys.map(k => `${k}. ${question.options[k] || ''}`).join('\n')
  )}&op=translate`;

  return (
    <div className="translation-box" id="question-translation-box">
      {/* Header bar */}
      <div
        className="translation-box-header"
        onClick={() => setIsExpanded(prev => !prev)}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
      >
        <div className="translation-box-title">
          <Languages size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            🇻🇳 Bản Dịch Tiếng Việt & Giải Thích Chi Tiết
          </span>
          <span className="badge badge-indigo" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}>
            Song ngữ EN • VI
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href={googleTranslateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.75rem',
              gap: '0.3rem',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            onClick={e => e.stopPropagation()}
            title="Mở Google Dịch trong tab mới"
          >
            <span>Google Dịch</span>
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            className="btn btn-icon btn-outline"
            style={{ width: '28px', height: '28px', padding: 0 }}
            aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="translation-box-body">
          {/* Translated Question Prompt */}
          <div className="translation-section">
            <div className="translation-section-title">
              <BookOpen size={14} color="#60a5fa" />
              <span>Câu hỏi dịch nghĩa:</span>
            </div>
            <div className="translation-question-card">
              {questionVi}
            </div>
          </div>

          {/* Translated Options */}
          <div className="translation-section" style={{ marginTop: '0.85rem' }}>
            <div className="translation-section-title">
              <Sparkles size={14} color="#34d399" />
              <span>Các phương án lựa chọn:</span>
            </div>
            <div className="translation-options-grid">
              {optionsKeys.map(key => {
                const rawText = question.options[key];
                if (!rawText) return null;
                const translatedOpt = question.optionsVi?.[key] || rawText;
                const isCorrect = question.correctAnswer === key;
                const isUserChoice = userAnswer === key;

                let optClass = 'translation-option-item';
                if (isCorrect) optClass += ' correct';
                else if (isUserChoice) optClass += ' user-picked-wrong';

                return (
                  <div key={key} className={optClass}>
                    <div className="translation-option-left">
                      <span className={`translation-option-badge ${isCorrect ? 'badge-correct' : ''}`}>
                        {key}
                      </span>
                      <div className="translation-option-texts">
                        <span className="translation-option-vi">{translatedOpt}</span>
                        {translatedOpt !== rawText && (
                          <span className="translation-option-en">Gốc: {rawText}</span>
                        )}
                      </div>
                    </div>

                    {isCorrect && (
                      <span className="translation-correct-tag">
                        <CheckCircle2 size={13} />
                        <span>Đáp án đúng</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Explanation */}
          {explanationVi && (
            <div className="translation-section" style={{ marginTop: '0.85rem' }}>
              <div className="translation-section-title">
                <span>💡 Giải thích chi tiết & Trọng tâm kiến thức:</span>
              </div>
              <div className="translation-explanation-card">
                {explanationVi.split('\n').map((line, idx) => {
                  if (!line.trim()) return <div key={idx} style={{ height: '0.35rem' }} />;
                  const isBullet = line.trim().startsWith('-') || line.trim().startsWith('•');
                  const isHeader = line.trim().startsWith('🎯') || line.trim().startsWith('👉');

                  return (
                    <p
                      key={idx}
                      style={{
                        margin: '0.2rem 0',
                        lineHeight: 1.55,
                        fontWeight: isHeader ? 700 : isBullet ? 500 : 400,
                        color: isHeader ? '#f3f4f6' : isBullet ? '#e2e8f0' : 'var(--text-secondary)',
                      }}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
