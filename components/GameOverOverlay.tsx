'use client';

interface GameOverOverlayProps {
  isActive: boolean;
  won: boolean;
  onPlayAgain: () => void;
}

export function GameOverOverlay({
  isActive,
  won,
  onPlayAgain,
}: GameOverOverlayProps) {
  return (
    <div className={`game-over-overlay ${isActive ? 'active' : ''}`}>
      <div className={`game-over-text ${won ? 'win-text' : 'lose-text'}`}>
        {won ? 'You Win!' : 'Game Over'}
      </div>
      <button className="btn" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
}
