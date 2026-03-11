export type Board = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';
export type GridSize = 4 | 5 | 6 | 7 | 8;

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

export interface GridOption {
  size: GridSize;
  label: string;
  difficulty: string;
}
