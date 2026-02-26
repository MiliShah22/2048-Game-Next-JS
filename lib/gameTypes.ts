export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface SlideResult {
  result: number[];
  merged: number[];
}

export interface MoveResult {
  moved: boolean;
  mergedCells: Array<{ r: number; c: number }>;
}

export interface NewTile {
  r: number;
  c: number;
}

export interface GameState {
  board: Board;
  score: number;
  best: number;
  gameOver: boolean;
  won: boolean;
}
