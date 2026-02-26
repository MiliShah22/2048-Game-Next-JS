'use client';

import { GameCell } from './GameCell';
import { Board, NewTile } from '@/lib/gameTypes';
import { BOARD_SIZE } from '@/lib/gameLogic';

interface GameBoardProps {
  board: Board;
  newTile: NewTile | null;
  mergedCells: Array<{ r: number; c: number }>;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export function GameBoard({
  board,
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
    >
      {Array.from({ length: BOARD_SIZE }).map((_, r) =>
        Array.from({ length: BOARD_SIZE }).map((_, c) => {
          const value = board[r][c];
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
