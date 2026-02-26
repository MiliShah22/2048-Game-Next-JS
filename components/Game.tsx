'use client';

import { useEffect, useState } from 'react';
import { Header } from './Header';
import { GameBoard } from './GameBoard';
import { GameOverOverlay } from './GameOverOverlay';
import {
  createEmptyBoard,
  addRandomTile,
  handleMove,
  checkGameOver,
  BOARD_SIZE,
} from '@/lib/gameLogic';
import { Board, NewTile, Direction } from '@/lib/gameTypes';

export function Game() {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [newTile, setNewTile] = useState<NewTile | null>(null);
  const [mergedCells, setMergedCells] = useState<Array<{ r: number; c: number }>>([]);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Initialize game on mount
  useEffect(() => {
    setMounted(true);
    const savedBest = localStorage.getItem('best2048');
    const initialBest = savedBest ? parseInt(savedBest, 10) : 0;
    setBest(initialBest);

    const newBoard = createEmptyBoard();
    const tile1 = addRandomTile(newBoard);
    addRandomTile(newBoard);

    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setNewTile(tile1);
    setMergedCells([]);
  }, []);

  const handleNewGame = () => {
    const newBoard = createEmptyBoard();
    const tile1 = addRandomTile(newBoard);
    addRandomTile(newBoard);

    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setNewTile(tile1);
    setMergedCells([]);
  };

  const processMove = (direction: Direction) => {
    if (gameOver) return;

    const boardCopy = board.map((row) => [...row]);
    const result = handleMove(boardCopy, direction);

    if (!result.moved) return;

    let newScore = score;
    let newWon = won;

    // Calculate score from merged cells
    result.mergedCells.forEach(({ r, c }) => {
      newScore += boardCopy[r][c];
      if (boardCopy[r][c] === 2048 && !newWon) {
        newWon = true;
      }
    });

    const tile = addRandomTile(boardCopy);
    setBoard(boardCopy);
    setScore(newScore);
    setNewTile(tile);
    setMergedCells(result.mergedCells);
    setWon(newWon);

    // Update best score
    if (newScore > best) {
      setBest(newScore);
      localStorage.setItem('best2048', newScore.toString());
    }

    // Check game states
    setTimeout(() => {
      if (newWon && !gameOver) {
        setGameOver(true);
      } else if (checkGameOver(boardCopy)) {
        setGameOver(true);
      }
    }, 300);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right',
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        processMove(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, score, best, won, board]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) {
        processMove(dx > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(dy) > minSwipe) {
        processMove(dy > 0 ? 'down' : 'up');
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="game-container">
      <Header score={score} best={best} />

      <div style={{ position: 'relative' }}>
        <GameBoard
          board={board}
          newTile={newTile}
          mergedCells={mergedCells}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        <GameOverOverlay
          isActive={gameOver}
          won={won}
          onPlayAgain={handleNewGame}
        />
      </div>

      <button className="btn" onClick={handleNewGame} aria-label="Start new game">
        New Game
      </button>

      <p className="instructions">
        Use <span className="key">↑</span> <span className="key">↓</span>{' '}
        <span className="key">←</span> <span className="key">→</span> or swipe to
        move tiles. Combine matching numbers to reach 2048!
      </p>
    </div>
  );
}
