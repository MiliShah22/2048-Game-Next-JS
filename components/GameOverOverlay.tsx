'use client';

interface GameOverOverlayProps {
  isActive: boolean;
  won: boolean;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export function GameOverOverlay({
  isActive,
  won,
  onPlayAgain,
  onMenu,
}: GameOverOverlayProps) {
  return (
    <div className={`game-over-overlay ${isActive ? 'active' : ''}`}>
      <div className={`game-over-text ${won ? 'win-text' : 'lose-text'}`}>
        {won ? 'You Win!' : 'Game Over'}
      </div>
      <div className="overlay-buttons">
        <button className="btn primary" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="btn secondary" onClick={onMenu}>
          Menu
        </button>
      </div>
    </div>
  );
}

