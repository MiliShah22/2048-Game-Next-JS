'use client';

import { GridSize } from '@/lib/gameTypes';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  score: number;
  best: number;
  gridSize: GridSize;
  soundEnabled: boolean;
  onBack: () => void;
  onPause?: () => void;
  onSoundToggle: () => void;
}

export function Header({ score, best, gridSize, soundEnabled, onBack, onPause, onSoundToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'night') {
      setTheme('day');
    } else {
      setTheme('night');
    }
  };

  return (
    <>
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
          {onPause && (
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
          )}
          <button
            className="sound-btn"
            onClick={onSoundToggle}
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            title="Toggle sound"
          >
            {soundEnabled ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="m19.07 4.93-2.29 2.29" />
                <path d="m19.07 19.07-2.29-2.29" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              </svg>
            )}
          </button>
          <button
            className="theme-btn"
            onClick={cycleTheme}
            aria-label={`Toggle Day/Night theme`}
            title="Toggle Day/Night theme"
          >
            {theme === 'day' ? <Moon className="size-5" /> : <Sun className="size-5" />}
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
      <style jsx>{`
        .theme-btn {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: 1px solid var(--border-light);
          background: var(--glass);
          color: var(--fg);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .theme-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 0 20px var(--accent-glow);
        }
        .theme-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}

