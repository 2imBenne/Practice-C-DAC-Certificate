import React, { useState } from 'react';
import type { OptionKey, QuestionItem } from '../../types/quiz';
import {
  Languages,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  BookOpen,
  Bot,
  Brain,
} from 'lucide-react';

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
  const [copiedAi, setCopiedAi] = useState<string | null>(null);

  const optionsKeys: OptionKey[] = ['A', 'B', 'C', 'D'];
  const questionVi = question.questionTextVi || question.questionText;

  const googleTranslateUrl = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(
    question.questionText + '\n\n' + optionsKeys.map(k => `${k}. ${question.options[k] || ''}`).join('\n')
  )}&op=translate`;

  const buildPrompt = () => {
    const lines: string[] = [];
    lines.push(
      `Tôi đang ôn thi chứng chỉ C-DAC môn ${
        question.subjectKey === 'JAVA' ? 'Java Core' : 'DBMS & SQL'
      } (${question.moduleName}).`
    );
    lines.push(`Hãy phân tích và giải thích chi tiết câu trắc nghiệm sau bằng tiếng Việt:`);
    lines.push('');
    lines.push(`【Câu hỏi tiếng Anh】:`);
    lines.push(question.questionText);
    if (question.questionTextVi && question.questionTextVi !== question.questionText) {
      lines.push(`【Bản dịch tiếng Việt】:`);
      lines.push(question.questionTextVi);
    }
    lines.push('');
    if (question.hasCode && question.codeSnippet) {
      lines.push(`【Đoạn mã code】:`);
      lines.push('```' + (question.codeLanguage || (question.subjectKey === 'JAVA' ? 'java' : 'sql')));
      lines.push(question.codeSnippet);
      lines.push('```');
      lines.push('');
    }
    lines.push(`【Các lựa chọn】:`);
    optionsKeys.forEach(k => {
      const optEn = question.options[k];
      const optVi = question.optionsVi?.[k];
      if (optEn) {
        if (optVi && optVi !== optEn) {
          lines.push(`${k}. ${optVi} (${optEn})`);
        } else {
          lines.push(`${k}. ${optEn}`);
        }
      }
    });
    lines.push('');
    lines.push(`【Đáp án đúng】: ${question.correctAnswer} - ${question.options[question.correctAnswer]}`);
    lines.push('');
    lines.push(`【Yêu cầu giải thích】:`);
    lines.push(`1. Phân tích chi tiết tại sao đáp án ${question.correctAnswer} là chính xác (bản chất kỹ thuật, cơ chế hoạt động).`);
    lines.push(`2. Phân tích lý do vì sao các phương án còn lại là sai hoặc gây lỗi.`);
    lines.push(`3. Chỉ ra các bẫy thường gặp và kiến thức cốt lõi cần nhớ khi đi thi chứng chỉ CDAC.`);
    return lines.join('\n');
  };

  const handleAskAi = (target: 'GEMINI' | 'CHATGPT' | 'CLAUDE') => {
    const prompt = buildPrompt();

    // Copy to clipboard for instant paste
    if (navigator.clipboard) {
      navigator.clipboard.writeText(prompt).catch(() => {});
      setCopiedAi(target);
      setTimeout(() => setCopiedAi(null), 3500);
    }

    if (target === 'CHATGPT') {
      const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
      window.open(chatGptUrl, '_blank', 'noopener,noreferrer');
    } else if (target === 'GEMINI') {
      window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
    } else if (target === 'CLAUDE') {
      window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer');
    }
  };

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
            🇻🇳 Bản Dịch Tiếng Việt & Hỏi Trợ Lý AI
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
            <div className="translation-question-card">{questionVi}</div>
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

          {/* AI Explanation Action Section (Replaces static explanation) */}
          <div className="translation-section ai-section" style={{ marginTop: '1rem' }}>
            <div className="translation-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Bot size={15} color="#818cf8" />
                <span>Nhờ Trợ Lý AI Giải Thích Chi Tiết:</span>
              </div>
              {copiedAi && (
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', animation: 'fadeIn 0.2s ease' }}>
                  ✓ Đã copy câu hỏi vào bộ nhớ tạm!
                </span>
              )}
            </div>

            <div className="ai-buttons-grid">
              {/* Gemini Button */}
              <button
                type="button"
                id="btn-ask-gemini"
                className="btn btn-ai btn-ai-gemini"
                onClick={() => handleAskAi('GEMINI')}
                title="Mở Google Gemini để nhận lời giải thích chuyên sâu"
              >
                <Sparkles size={16} />
                <span>Hỏi Gemini</span>
                <ExternalLink size={12} className="ai-link-icon" />
              </button>

              {/* ChatGPT Button */}
              <button
                type="button"
                id="btn-ask-chatgpt"
                className="btn btn-ai btn-ai-chatgpt"
                onClick={() => handleAskAi('CHATGPT')}
                title="Mở ChatGPT với câu hỏi này"
              >
                <Bot size={16} />
                <span>Hỏi ChatGPT</span>
                <ExternalLink size={12} className="ai-link-icon" />
              </button>

              {/* Claude AI Button */}
              <button
                type="button"
                id="btn-ask-claude"
                className="btn btn-ai btn-ai-claude"
                onClick={() => handleAskAi('CLAUDE')}
                title="Mở Claude AI để phân tích câu hỏi này"
              >
                <Brain size={16} />
                <span>Hỏi Claude AI</span>
                <ExternalLink size={12} className="ai-link-icon" />
              </button>
            </div>

            <div className="ai-helper-text">
              💡 Bấm vào AI bất kỳ để tự động sao chép toàn bộ đề bài & đáp án, mở trang tương ứng và sẵn sàng nhận lời giải thích chi tiết!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
