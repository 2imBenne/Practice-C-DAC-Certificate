import React from 'react';
import type { SubjectKey } from '../../types/quiz';
import { Bookmark, AlertCircle, Home, LayoutGrid } from 'lucide-react';

interface HeaderProps {
  currentSubject: SubjectKey | null;
  onGoHome: () => void;
  onSwitchSubject: () => void;
  onOpenMistakes: () => void;
  onOpenBookmarks: () => void;
  mistakesCount: number;
  bookmarksCount: number;
  currentView: 'PORTAL' | 'DASHBOARD' | 'ARENA' | 'RESULT';
}

export const Header: React.FC<HeaderProps> = ({
  currentSubject,
  onGoHome,
  onSwitchSubject,
  onOpenMistakes,
  onOpenBookmarks,
  mistakesCount,
  bookmarksCount,
  currentView,
}) => {
  const isDbms = currentSubject === 'DBMS';

  return (
    <header className="navbar" id="app-header">
      <div className="brand-wrapper" onClick={currentSubject ? onGoHome : undefined} id="brand-home-link">
        <div
          className="brand-logo-badge"
          style={{
            background: isDbms
              ? 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)'
              : 'var(--accent-gradient)',
          }}
        >
          {isDbms ? '🗄️' : '☕'}
        </div>
        <div>
          <div className="brand-title">
            CDAC{' '}
            <span className={isDbms ? 'text-gradient-warm' : 'text-gradient'}>
              {currentSubject === 'JAVA' ? 'Java Core' : currentSubject === 'DBMS' ? 'DBMS & SQL' : 'Hub Pro'}
            </span>
          </div>
          <div className="brand-sub">
            {currentSubject === 'JAVA'
              ? '320 câu trắc nghiệm • 16 chuyên đề'
              : currentSubject === 'DBMS'
              ? '260 câu trắc nghiệm • 13 chuyên đề'
              : 'Hệ thống khảo thí đa môn chuẩn CDAC'}
          </div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Switch Subject Button */}
        <button
          type="button"
          id="nav-btn-switch-subject"
          className="btn btn-secondary"
          onClick={onSwitchSubject}
          style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem', minHeight: '38px' }}
          title="Chọn hoặc chuyển đổi môn học khác"
        >
          <LayoutGrid size={15} color="#06b6d4" />
          <span className="desktop-only-inline">
            {currentSubject ? `Đổi môn (${currentSubject})` : 'Chọn môn'}
          </span>
          <span className="mobile-only-inline">Đổi môn</span>
        </button>

        {currentSubject && currentView !== 'DASHBOARD' && (
          <button
            type="button"
            id="nav-btn-home"
            className="btn btn-secondary"
            onClick={onGoHome}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem', minHeight: '38px' }}
            title="Quay về trang chủ môn học"
          >
            <Home size={15} />
            <span className="desktop-only-inline">Trang chủ</span>
          </button>
        )}

        {currentSubject && (
          <>
            <button
              type="button"
              id="nav-btn-bookmarks"
              className="btn btn-outline"
              onClick={onOpenBookmarks}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem', minHeight: '38px' }}
              title="Xem danh sách các câu đã đánh dấu"
            >
              <Bookmark size={15} color="#f59e0b" />
              <span className="desktop-only-inline">Đã lưu</span>
              <span className="badge badge-amber" style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}>
                {bookmarksCount}
              </span>
            </button>

            <button
              type="button"
              id="nav-btn-mistakes"
              className="btn btn-outline"
              onClick={onOpenMistakes}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem', minHeight: '38px' }}
              title="Sổ tay câu làm sai cần phục thù"
            >
              <AlertCircle size={15} color="#ef4444" />
              <span className="desktop-only-inline">Sổ câu sai</span>
              <span className="badge badge-rose" style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}>
                {mistakesCount}
              </span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};
