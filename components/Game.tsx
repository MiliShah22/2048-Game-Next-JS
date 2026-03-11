'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from './Header';
import { GameBoard } from './GameBoard';
import { GameOverOverlay } from './GameOverOverlay';
import { MenuScreen } from './MenuScreen';
import {
  createEmptyBoard,
  addRandomTile,
  handleMove,
  checkGameOver,
} from '@/lib/gameLogic';
import { Board, NewTile, Direction, GridSize } from '@/lib/gameTypes';

export function Game() {
  const [showMenu, setShowMenu] = useState(true);
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [newTile, setNewTile] = useState<NewTile | null>(null);
  const [mergedCells, setMergedCells] = useState<Array<{ r: number; c: number }>>([]);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Use refs to avoid stale closures
  const gameStateRef = useRef({ gameOver, showMenu, board, score, best, won, gridSize });
  useEffect(() => {
    gameStateRef.current = { gameOver, showMenu, board, score, best, won, gridSize };
  }, [gameOver, showMenu, board, score, best, won, gridSize]);

  // Initialize best score on mount
  useEffect(() => {
    setMounted(true);
    const savedBest = localStorage.getItem('best2048Dynamic');
    const initialBest = savedBest ? parseInt(savedBest, 10) : 0;
    setBest(initialBest);
  }, []);

  const handleSelectSize = (size: GridSize) => {
    setGridSize(size);
    setShowMenu(false);
    startNewGame(size);
  };

  const startNewGame = (size?: GridSize) => {
    const boardSize = size || gridSize;
    const newBoard = createEmptyBoard(boardSize);
    const tile1 = addRandomTile(newBoard);
    addRandomTile(newBoard);

    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setNewTile(tile1);
    setMergedCells([]);
  };

  const handleNewGame = () => {
    startNewGame();
  };

  const handleBackToMenu = () => {
    setShowMenu(true);
  };

  const processMove = useCallback((direction: Direction) => {
    const { gameOver: isGameOver, showMenu: isMenu, board: currentBoard, score: currentScore, best: currentBest, won: hasWon } = gameStateRef.current;

    if (isGameOver || isMenu) return;
    if (!currentBoard || currentBoard.length === 0) return;

    const boardCopy = currentBoard.map((row) => [...row]);
    const result = handleMove(boardCopy, direction);

    if (!result.moved) return;

    let newScore = currentScore;
    let newWon = hasWon;

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
    if (newScore > currentBest) {
      setBest(newScore);
      localStorage.setItem('best2048Dynamic', newScore.toString());
    }

    // Check game states
    setTimeout(() => {
      if (newWon && !isGameOver) {
        setGameOver(true);
      } else if (checkGameOver(boardCopy)) {
        setGameOver(true);
      }
    }, 300);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { showMenu: isMenu } = gameStateRef.current;
      if (isMenu) return;

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
        e.stopPropagation();
        processMove(keyMap[e.key]);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [processMove]);

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

  if (showMenu) {
    return <MenuScreen onSelectSize={handleSelectSize} />;
  }

  return (
    <div className="game-container">
      <Header
        score={score}
        best={best}
        gridSize={gridSize}
        onBack={handleBackToMenu}
      />

      <div style={{ position: 'relative', width: '80%', height: 'auto' }}>
        <GameBoard
          board={board}
          gridSize={gridSize}
          newTile={newTile}
          mergedCells={mergedCells}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        <GameOverOverlay
          isActive={gameOver}
          won={won}
          onPlayAgain={handleNewGame}
          onMenu={handleBackToMenu}
        />
      </div>

      <p className="instructions">
        Use <span className="key">↑</span> <span className="key">↓</span>{' '}
        <span className="key">←</span> <span className="key">→</span> or swipe to
        move tiles. Combine matching numbers to reach 2048!
      </p>
    </div>
  );
}

