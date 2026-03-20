'use client';

import React, { useMemo } from 'react';
import { GameCell } from './GameCell';
import { Board, NewTile, GridSize, MovingTile } from '@/lib/gameTypes';

interface GameBoardProps {
  board: Board;
  gridSize: GridSize;
  newTile: NewTile | null;
  mergedCells: Array<{ r: number; c: number }>;
  movingTiles: Array<MovingTile>;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export function GameBoard({
  board,
  gridSize,
  newTile,
  mergedCells,
  movingTiles,
  onTouchStart,
  onTouchEnd,
}: GameBoardProps) {
  const cells = useMemo(() => {
    return Array.from({ length: gridSize }, (_, r) =>
      Array.from({ length: gridSize }, (_, c) => {
        const value = board[r]?.[c] ?? 0;
        const isNew = newTile ? newTile.r === r && newTile.c === c : false;
        const isMerged = mergedCells.some((m) => m.r === r && m.c === c);
        const movingTile = movingTiles.find((t) => t.toR === r && t.toC === c);
        const isMovingFromHere = movingTiles.some((t) => t.fromR === r && t.fromC === c);

        return {
          key: `${r}-${c}`,
          value,
          isNew,
          isMerged,
          movingTile,
          isMovingFromHere,
        };
      })
    );
  }, [board, gridSize, newTile, mergedCells, movingTiles]);

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
      {cells.map((row) =>
        row.map((cell) => (
          <GameCell
            key={cell.key}
            value={cell.value}
            isNew={cell.isNew}
            isMerged={cell.isMerged}
            movingTile={cell.movingTile}
            isMovingFromHere={cell.isMovingFromHere}
          />
        ))
      )}
    </div>
  );
}

