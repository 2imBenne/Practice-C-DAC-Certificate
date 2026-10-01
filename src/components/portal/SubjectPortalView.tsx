import React from 'react';
import type { SubjectKey } from '../../types/quiz';
import { QuizDataService } from '../../services/quizData';
import { StorageService } from '../../services/storage';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
  Target,
  Award,
  ShieldCheck,
} from 'lucide-react';

interface SubjectPortalViewProps {
  onSelectSubject: (subject: SubjectKey) => void;
}

export const SubjectPortalView: React.FC<SubjectPortalViewProps> = ({ onSelectSubject }) => {
  const subjects = QuizDataService.getSubjects();

  const javaSummary = StorageService.getSubjectSummary('JAVA', 320);
  const dbmsSummary = StorageService.getSubjectSummary('DBMS', 260);

  const summaries: Record<SubjectKey, typeof javaSummary> = {
    JAVA: javaSummary,
    DBMS: dbmsSummary,
  };

  return (
    <div id="subject-portal-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div
        className="glass-panel hero-banner"
        style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.98) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-indigo">
              <Sparkles size={13} /> CDAC Certification Portal
            </span>
            <span className="badge badge-emerald">
              Tổng Hợp 580 Câu Trắc Nghiệm Chuẩn
            </span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.75rem)' }}>
            Hệ Thống Ôn Luyện <span className="text-gradient">Chứng Chỉ CDAC</span>
          </h1>

          <p className="hero-desc" style={{ maxWidth: '640px', margin: '0 auto 1.5rem auto' }}>
            Vui lòng chọn phân hệ môn học bạn muốn ôn tập. Dữ liệu tiến độ, sổ tay câu sai và lịch sử làm bài của từng môn được cách ly và lưu trữ độc lập.
          </p>
        </div>
      </div>

      {/* 2 Subject Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {subjects.map(subject => {
          const summary = summaries[subject.id];
          const isJava = subject.id === 'JAVA';

          const cardBorder = isJava ? 'rgba(99, 102, 241, 0.4)' : 'rgba(6, 182, 212, 0.4)';
          const accentColor = isJava ? '#6366f1' : '#06b6d4';
          const cardGlow = isJava ? 'rgba(99, 102, 241, 0.15)' : 'rgba(6, 182, 212, 0.15)';

          return (
            <div
              key={subject.id}
              className="glass-panel"
              id={`portal-card-${subject.id.toLowerCase()}`}
              onClick={() => onSelectSubject(subject.id)}
              style={{
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1.5rem',
                border: `1.5px solid ${cardBorder}`,
                boxShadow: `0 8px 30px ${cardGlow}`,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 14px 40px ${isJava ? 'rgba(99, 102, 241, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 30px ${cardGlow}`;
              }}
            >
              <div>
                {/* Subject Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: isJava ? 'var(--accent-gradient)' : 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      boxShadow: `0 4px 18px ${cardGlow}`,
                    }}
                  >
                    {isJava ? '☕' : '🗄️'}
                  </div>

                  <span className={`badge ${isJava ? 'badge-indigo' : 'badge-emerald'}`}>
                    {subject.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
                  {subject.shortName}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {subject.description}
                </p>

                {/* Key Topic Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {subject.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress & Live Stats Box */}
              <div>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Tiến độ: <strong>{summary.attemptedCount} / {subject.totalQuestions} câu</strong>
                    </span>
                    <span style={{ fontWeight: 700, color: accentColor }}>
                      {summary.progressPercentage}%
                    </span>
                  </div>

                  <div className="progress-track" style={{ height: '6px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${summary.progressPercentage}%`,
                        background: isJava ? 'var(--accent-gradient)' : 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Target size={12} color={accentColor} /> Độ chính xác: {summary.accuracy}%
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Flame size={12} color="#ef4444" /> Sổ câu sai: {summary.mistakesCount}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  className="btn"
                  style={{
                    width: '100%',
                    background: isJava ? 'var(--accent-gradient)' : 'linear-gradient(135deg, #0891b2 0%, #059669 100%)',
                    color: '#fff',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    boxShadow: `0 4px 15px ${cardGlow}`,
                  }}
                >
                  <span>Bắt đầu ôn luyện {subject.shortName}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Highlights Grid */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={28} color="#10b981" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Chuẩn hóa CDAC</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trọng tâm chương trình đào tạo</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <BookOpen size={28} color="#6366f1" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>580 Câu Trắc Nghiệm</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>29 Chuyên đề chi tiết</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Award size={28} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>100% Offline</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lưu tiến độ ngay trên trình duyệt</div>
          </div>
        </div>
      </div>
    </div>
  );
};
