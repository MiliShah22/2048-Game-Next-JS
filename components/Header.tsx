'use client';

interface HeaderProps {
  score: number;
  best: number;
}

export function Header({ score, best }: HeaderProps) {
  return (
    <div className="header">
      <h1 className="title">2048</h1>
      <div className="scores">
        <div className="score-box">
          <div className="score-label">Score</div>
          <div className="score-value">{score}</div>
        </div>
        <div className="score-box">
          <div className="score-label">Best</div>
          <div className="score-value">{best}</div>
        </div>
      </div>
    </div>
  );
}
