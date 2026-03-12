'use client';

import { GridSize } from '@/lib/gameTypes';

interface HeaderProps {
  score: number;
  best: number;
  gridSize: GridSize;
  onBack: () => void;
  onPause?: () => void;
}

export function Header({ score, best, gridSize, onBack, onPause }: HeaderProps) {
  return (
    <div className="header">
      <button className="back-btn" onClick={onBack} aria-label="Back to menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="header-center">
        <span className="current-grid-label">{gridSize}x{gridSize}</span>
      </div>
      <div className="header-actions">
        <button
          className="pause-btn"
          onClick={onPause}
          aria-label="Pause game"
          title="Pause (P)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      </div>
      <div className="scores">
        <div className="score-box score-anim">
          <div className="score-label">Score</div>
          <div className="score-value" data-score={score}>
            {score.toLocaleString()}
          </div>
        </div>
        <div className="score-box">
          <div className="score-label">Best</div>
          <div className="score-value best-score" data-best={best}>
            {best.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

