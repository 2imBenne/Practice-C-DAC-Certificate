import React from 'react';
import type { ModuleMeta, QuestionItem, SubjectKey } from '../../types/quiz';
import { StorageService } from '../../services/storage';
import { QuizDataService } from '../../services/quizData';
import {
  Sparkles,
  Zap,
  Target,
  Flame,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  LayoutGrid,
} from 'lucide-react';

interface DashboardViewProps {
  subject: SubjectKey;
  modules: ModuleMeta[];
  allQuestions: QuestionItem[];
  mistakesCount: number;
  bookmarksCount: number;
  onStartModule: (moduleId: number) => void;
  onStartMockExam: () => void;
  onStartAllQuestions: () => void;
  onStartMistakeDrill: () => void;
  onSwitchSubject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subject,
  modules,
  allQuestions,
  mistakesCount,
  bookmarksCount,
  onStartModule,
  onStartMockExam,
  onStartAllQuestions,
  onStartMistakeDrill,
  onSwitchSubject,
}) => {
  const subjectMeta = QuizDataService.getSubjectMeta(subject);
  const moduleStats = StorageService.getModuleStats(subject);

  let totalAttempted = 0;
  let totalCorrect = 0;
  Object.values(moduleStats).forEach(s => {
    totalAttempted += s.totalAttempted;
    totalCorrect += s.correctCount;
  });

  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const overallProgress = allQuestions.length > 0 ? Math.round((totalAttempted / allQuestions.length) * 100) : 0;

  const isDbms = subject === 'DBMS';
  const accentGradient = isDbms ? 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' : 'var(--accent-gradient)';
  const accentColor = isDbms ? '#06b6d4' : '#6366f1';

  return (
    <div id="dashboard-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div className="glass-panel hero-banner">
        <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">
              <Sparkles size={12} /> Chuẩn hóa CDAC
            </span>
            <span className="badge badge-emerald">
              {subjectMeta.badge}
            </span>
            <button
              type="button"
              className="badge"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
              onClick={onSwitchSubject}
            >
              <LayoutGrid size={11} /> Đổi sang môn khác
            </button>
          </div>

          <h1 className="hero-title">
            Ôn Luyện Chứng Chỉ{' '}
            <span className={isDbms ? 'text-gradient-warm' : 'text-gradient'}>
              {subjectMeta.shortName}
            </span>{' '}
            Trắc Nghiệm
          </h1>

          <p className="hero-desc">
            Toàn bộ ngân hàng <strong>{allQuestions.length} câu hỏi trọng tâm</strong> với{' '}
            {isDbms ? '91+ truy vấn SQL thực tế' : '89+ đoạn code Java thực hành'}. 
            Tối ưu hóa phản xạ với 3 chế độ: Luyện theo chuyên đề, Thi thử áp lực thời gian, và Sổ tay triệt tiêu câu sai.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              id="hero-btn-mock-exam"
              className="btn btn-primary"
              style={{
                fontSize: '0.95rem',
                background: accentGradient,
              }}
              onClick={onStartMockExam}
            >
              <Zap size={18} />
              <span>Thi thử ngay (40 câu / 45p)</span>
            </button>

            <button
              type="button"
              id="hero-btn-all-questions"
              className="btn btn-secondary"
              style={{ fontSize: '0.95rem' }}
              onClick={onStartAllQuestions}
            >
              <BookOpen size={18} />
              <span>Luyện tuần tự {allQuestions.length} câu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card" id="stat-total-questions">
          <div className="stat-icon-wrapper" style={{ background: isDbms ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: accentColor }}>
            <BookOpen size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{allQuestions.length}</span>
            <span className="stat-label">Tổng số câu hỏi</span>
          </div>
        </div>

        <div className="glass-panel stat-card" id="stat-completed-questions">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalAttempted} <small style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({overallProgress}%)</small></span>
            <span className="stat-label">Câu đã hoàn thành</span>
          </div>
        </div>

        <div className="glass-panel stat-card" id="stat-accuracy">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
            <Target size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Độ chính xác trung bình</span>
          </div>
        </div>

        <div className="glass-panel stat-card" id="stat-mistakes-bank">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Flame size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{mistakesCount}</span>
            <span className="stat-label">Câu sai • {bookmarksCount} câu đã lưu</span>
          </div>
        </div>
      </div>

      {/* 3 Quick Action Modes */}
      <div>
        <div className="section-header">
          <h3 className="section-title">
            <Zap size={20} color={accentColor} />
            <span>Chế Độ Ôn Luyện Nhanh</span>
          </h3>
        </div>

        <div className="quick-modes-grid">
          {/* Card 1: Mock Exam */}
          <div className="glass-panel mode-card mock-exam" onClick={onStartMockExam} id="card-mode-mock-exam">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-indigo">
                  <Clock size={12} /> 45 Phút
                </span>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
                  40 Câu Ngẫu Nhiên
                </span>
              </div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Thi Thử Chuẩn CDAC</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Mô phỏng áp lực phòng thi thật. Hệ thống chọn ngẫu nhiên các câu hỏi từ {modules.length} chuyên đề, tự động thu bài khi hết giờ.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: accentColor, fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Vào thi thử</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: Mistake Drill */}
          <div
            className="glass-panel mode-card mistake-box"
            onClick={onStartMistakeDrill}
            id="card-mode-mistake-drill"
            style={{ opacity: mistakesCount === 0 ? 0.75 : 1 }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-rose">
                  <RotateCcw size={12} /> Spaced Repetition
                </span>
                <span className="badge badge-rose">
                  {mistakesCount} Câu Cần Xóa Sổ
                </span>
              </div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Sổ Tay Phục Thù</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Tập trung giải quyết các câu bạn từng làm sai trong môn {subjectMeta.shortName}. Trả lời đúng 2 lần liên tiếp để chính thức xóa bỏ điểm yếu.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>{mistakesCount > 0 ? 'Bắt đầu cày lại câu sai' : 'Chưa có câu sai'}</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 3: All Sequential */}
          <div className="glass-panel mode-card bookmark-box" onClick={onStartAllQuestions} id="card-mode-all-questions">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-amber">
                  <BookOpen size={12} /> Toàn Bộ
                </span>
                <span className="badge badge-amber">
                  {allQuestions.length} Câu Hỏi
                </span>
              </div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Luyện Tập Toàn Diện</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Duyệt tuần tự toàn bộ câu hỏi từ Câu 1 đến {allQuestions.length}. Xem giải thích và đáp án đúng tức thì sau mỗi lần chọn.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>Bắt đầu ôn tập tuần tự</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div>
        <div className="section-header">
          <h3 className="section-title">
            <BookOpen size={20} color="#10b981" />
            <span>Danh Sách {modules.length} Chuyên Đề Trọng Tâm</span>
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mỗi chuyên đề gồm 20 câu hỏi</span>
        </div>

        <div className="modules-grid">
          {modules.map(mod => {
            const stat = moduleStats[mod.id] || { totalAttempted: 0, correctCount: 0 };
            const progress = Math.min(100, Math.round((stat.totalAttempted / mod.questionCount) * 100));
            const modAccuracy = stat.totalAttempted > 0 ? Math.round((stat.correctCount / stat.totalAttempted) * 100) : 0;

            return (
              <div
                key={mod.id}
                className="glass-panel module-card"
                onClick={() => onStartModule(mod.id)}
                id={`module-card-${mod.id}`}
              >
                <div>
                  <div className="module-meta-top">
                    <span className="badge badge-indigo">{mod.code}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{mod.range}</span>
                  </div>
                  <h4 className="module-title" style={{ marginTop: '0.75rem' }}>
                    {mod.name}
                  </h4>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Tiến độ: {stat.totalAttempted}/{mod.questionCount}</span>
                    {stat.totalAttempted > 0 && (
                      <span style={{ color: modAccuracy >= 70 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {modAccuracy}% đúng
                      </span>
                    )}
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%`, background: accentGradient }} />
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '0.85rem', fontSize: '0.8rem', padding: '0.45rem' }}
                  >
                    <span>Luyện tập chuyên đề này</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
