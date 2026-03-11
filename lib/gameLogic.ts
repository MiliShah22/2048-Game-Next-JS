import { Board, Direction, SlideResult, MoveResult, NewTile, GridSize } from './gameTypes';

export function createEmptyBoard(size: GridSize = 4): Board {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(0));
}

export function addRandomTile(board: Board): NewTile | null {
  const size = board.length;
  const empty: NewTile[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) {
        empty.push({ r, c });
      }
    }
  }

  if (empty.length === 0) return null;

  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return { r, c };
}

function slide(row: number[], size: number): SlideResult {
  let arr = row.filter((v) => v !== 0);
  const merged: number[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      arr[i + 1] = 0;
      merged.push(i);
    }
  }

  arr = arr.filter((v) => v !== 0);
  while (arr.length < size) arr.push(0);

  return { result: arr, merged };
}

export function moveLeft(board: Board): MoveResult {
  const size = board.length;
  let moved = false;
  const mergedCells: Array<{ r: number; c: number }> = [];

  for (let r = 0; r < size; r++) {
    const original = [...board[r]];
    const { result, merged } = slide(board[r], size);
    board[r] = result;

    if (original.join() !== result.join()) moved = true;

    merged.forEach((idx) => mergedCells.push({ r, c: idx }));
  }

  return { moved, mergedCells };
}

export function moveRight(board: Board): MoveResult {
  const size = board.length;
  let moved = false;
  const mergedCells: Array<{ r: number; c: number }> = [];

  for (let r = 0; r < size; r++) {
    const original = [...board[r]];
    const reversed = [...board[r]].reverse();
    const { result, merged } = slide(reversed, size);
    board[r] = result.reverse();

    if (original.join() !== board[r].join()) moved = true;

    merged.forEach((idx) => mergedCells.push({ r, c: size - 1 - idx }));
  }

  return { moved, mergedCells };
}

export function moveUp(board: Board): MoveResult {
  const size = board.length;
  let moved = false;
  const mergedCells: Array<{ r: number; c: number }> = [];

  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) col.push(board[r][c]);

    const original = [...col];
    const { result, merged } = slide(col, size);

    for (let r = 0; r < size; r++) board[r][c] = result[r];

    if (original.join() !== result.join()) moved = true;

    merged.forEach((idx) => mergedCells.push({ r: idx, c }));
  }

  return { moved, mergedCells };
}

export function moveDown(board: Board): MoveResult {
  const size = board.length;
  let moved = false;
  const mergedCells: Array<{ r: number; c: number }> = [];

  for (let c = 0; c < size; c++) {
    const col: number[] = [];
    for (let r = 0; r < size; r++) col.push(board[r][c]);

    const original = [...col];
    const reversed = [...col].reverse();
    const { result, merged } = slide(reversed, size);
    const finalCol = result.reverse();

    for (let r = 0; r < size; r++) board[r][c] = finalCol[r];

    if (original.join() !== finalCol.join()) moved = true;

    merged.forEach((idx) => mergedCells.push({ r: size - 1 - idx, c }));
  }

  return { moved, mergedCells };
}

export function handleMove(board: Board, direction: Direction): MoveResult {
  switch (direction) {
    case 'left':
      return moveLeft(board);
    case 'right':
      return moveRight(board);
    case 'up':
      return moveUp(board);
    case 'down':
      return moveDown(board);
    default:
      return { moved: false, mergedCells: [] };
  }
}

export function checkGameOver(board: Board): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 0) return false;
      if (c < size - 1 && board[r][c] === board[r][c + 1]) return false;
      if (r < size - 1 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

export const BOARD_SIZE = 4;

