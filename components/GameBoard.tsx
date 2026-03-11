'use client';

import { GameCell } from './GameCell';
import { Board, NewTile, GridSize } from '@/lib/gameTypes';

interface GameBoardProps {
  board: Board;
  gridSize: GridSize;
  newTile: NewTile | null;
  mergedCells: Array<{ r: number; c: number }>;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export function GameBoard({
  board,
  gridSize,
  newTile,
  mergedCells,
  onTouchStart,
  onTouchEnd,
}: GameBoardProps) {
  return (
    <div
      className="grid-container"
      role="grid"
      aria-label="2048 game board"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {Array.from({ length: gridSize }).map((_, r) =>
        Array.from({ length: gridSize }).map((_, c) => {
          const value = board[r]?.[c] ?? 0;
          const isNew = newTile ? newTile.r === r && newTile.c === c : false;
          const isMerged = mergedCells.some((m) => m.r === r && m.c === c);

          return (
            <GameCell
              key={`${r}-${c}`}
              value={value}
              isNew={isNew}
              isMerged={isMerged}
            />
          );
        })
      )}
    </div>
  );
}

