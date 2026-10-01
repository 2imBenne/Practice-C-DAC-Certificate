import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  initialSeconds: number;
  isPaused?: boolean;
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  initialSeconds,
  isPaused = false,
  onTimeUp,
  onTick,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (onTick) onTick(next);
        if (next <= 0) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, secondsLeft, onTimeUp, onTick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 300; // < 5 minutes
  const isWarning = secondsLeft < 600 && !isUrgent; // < 10 minutes

  let badgeColor = '#6366f1';
  let badgeBg = 'rgba(99, 102, 241, 0.15)';
  let border = '1px solid rgba(99, 102, 241, 0.3)';

  if (isUrgent) {
    badgeColor = '#ef4444';
    badgeBg = 'rgba(239, 68, 68, 0.15)';
    border = '1px solid rgba(239, 68, 68, 0.4)';
  } else if (isWarning) {
    badgeColor = '#f59e0b';
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    border = '1px solid rgba(245, 158, 11, 0.4)';
  }

  return (
    <div
      id="exam-countdown-timer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '9999px',
        backgroundColor: badgeBg,
        border: border,
        color: badgeColor,
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: '0.95rem',
      }}
      className={isUrgent ? 'pulse' : ''}
    >
      {isUrgent ? <AlertTriangle size={16} /> : <Clock size={16} />}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
