import React from 'react';
import type { OptionKey } from '../../types/quiz';
import { CheckCircle2, XCircle } from 'lucide-react';

interface OptionButtonProps {
  optionKey: OptionKey;
  text: string;
  isSelected: boolean;
  isEvaluated: boolean;
  isCorrectAnswer: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  optionKey,
  text,
  isSelected,
  isEvaluated,
  isCorrectAnswer,
  disabled = false,
  onClick,
}) => {
  let statusClass = '';
  if (isEvaluated) {
    if (isCorrectAnswer) {
      statusClass = 'correct';
    } else if (isSelected && !isCorrectAnswer) {
      statusClass = 'incorrect';
    }
  } else if (isSelected) {
    statusClass = 'selected';
  }

  return (
    <button
      type="button"
      id={`option-btn-${optionKey.toLowerCase()}`}
      className={`option-btn ${statusClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="option-key-badge">{optionKey}</div>
      <div className="option-text">{text}</div>

      {isEvaluated && isCorrectAnswer && (
        <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
      )}
      {isEvaluated && isSelected && !isCorrectAnswer && (
        <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
};
