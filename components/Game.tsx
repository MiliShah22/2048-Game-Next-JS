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
import { Board, NewTile, Direction, GridSize, MovingTile, GameState } from '@/lib/gameTypes';
import { saveGame, loadGame, clearSave } from '@/lib/gamePersistence';
import { audio } from '@/lib/audioManager';
import { Volume2, VolumeX } from 'lucide-react';

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
  const [movingTiles, setMovingTiles] = useState<Array<MovingTile>>([]);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [swipeTrail, setSwipeTrail] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Use refs to avoid stale closures
  const gameStateRef = useRef({ gameOver, showMenu, board, score, best, won, gridSize });
  useEffect(() => {
    gameStateRef.current = { gameOver, showMenu, board, score, best, won, gridSize, soundEnabled };
  }, [gameOver, showMenu, board, score, best, won, gridSize, soundEnabled]);

  // Auto-save on state change
  useEffect(() => {
    if (!showMenu && board.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentGame();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [board, score, gameOver, won, gridSize, soundEnabled, showMenu]);

  // Save on page visibility change / pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showMenu && board.length > 0) {
        saveCurrentGame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', saveCurrentGame);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', saveCurrentGame);
    };
  }, [board.length, showMenu]);

  // Initialize best score on mount & audio
  useEffect(() => {
    if (mounted) return;
    setMounted(true);
    const savedBest = localStorage.getItem('best2048Dynamic');
    const initialBest = savedBest ? parseInt(savedBest, 10) : 0;
    setBest(initialBest);
    audio.setEnabled(soundEnabled);
  }, []); // Note: soundEnabled defaults true

  const handleNewSize = (size: GridSize) => {
    setGridSize(size);
    setShowMenu(false);
    startNewGame(size);
  };

  const handleContinueSize = (size: GridSize) => {
    const savedState = loadGame(size);
    if (savedState) {
      setGridSize(size);
      setShowMenu(false);
      setBoard(savedState.board);
      setScore(savedState.score);
      setGameOver(savedState.gameOver);
      setWon(savedState.won);
      if (savedState.soundEnabled !== undefined) {
        setSoundEnabled(savedState.soundEnabled);
        audio.setEnabled(savedState.soundEnabled);
      }
      // Resume - don't force new tiles
      setNewTile(null);
      setMergedCells([]);
      return;
    }
    // Fallback to new if no save
    handleNewSize(size);
  };

  const startNewGame = (size?: GridSize, forceNew: boolean = false) => {
    const boardSize = size || gridSize;
    if (!forceNew) {
      const savedState = loadGame(boardSize);
      if (savedState) {
        setBoard(savedState.board);
        setScore(savedState.score);
        setGameOver(savedState.gameOver);
        setWon(savedState.won);
        if (savedState.soundEnabled !== undefined) {
          setSoundEnabled(savedState.soundEnabled);
          audio.setEnabled(savedState.soundEnabled);
        }
        // Add initial tiles for resume
        setTimeout(() => {
          const tile1 = addRandomTile(savedState.board);
          setNewTile(tile1);
          setMergedCells([]);
        }, 100);
        return;
      }
    }
    // New game fallback
    const newBoard = createEmptyBoard(boardSize);
    const tile1 = addRandomTile(newBoard);
    addRandomTile(newBoard);
    clearSave(boardSize);

    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setNewTile(tile1);
    setMergedCells([]);
  };

  const handleNewGame = () => {
    startNewGame(undefined, true);
  };

  const saveCurrentGame = () => {
    saveGame(gridSize, board, score, gameOver, won, soundEnabled);
  };

  const handleBackToMenu = () => {
    saveCurrentGame();
    setShowMenu(true);
  };

  const processMove = useCallback((direction: Direction) => {
    const { gameOver: isGameOver, showMenu: isMenu, board: currentBoard, score: currentScore, best: currentBest, won: hasWon } = gameStateRef.current;

    if (isGameOver || isMenu) return;
    if (!currentBoard || currentBoard.length === 0) return;

    const boardCopy = currentBoard.map((row) => [...row]);
    const result = handleMove(boardCopy, direction);

    if (!result.moved) return;

    audio.play('swipe');

    let newScore = currentScore;
    let newWon = hasWon;

    // Calculate score from merged cells
    result.mergedCells.forEach(({ r, c }) => {
      const tileValue = boardCopy[r][c];
      newScore += tileValue;
      audio.play('merge', { pitch: Math.log2(tileValue) / 4 });
      if (tileValue === 2048 && !newWon) {
        newWon = true;
      }
    });

    const tile = addRandomTile(boardCopy);
    setBoard(boardCopy);
    setScore(newScore);
    setNewTile(tile);
    setMergedCells(result.mergedCells);
    audio.play('spawn');
    // Clear moving tiles after animation (200ms)
    setTimeout(() => setMovingTiles([]), 200);
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
        audio.play('win');
      } else if (checkGameOver(boardCopy)) {
        setGameOver(true);
        audio.play('gameover');
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

    let direction: Direction | null = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > minSwipe) {
        direction = dx > 0 ? 'right' : 'left';
        setSwipeTrail(direction);
      }
    } else {
      if (Math.abs(dy) > minSwipe) {
        direction = dy > 0 ? 'down' : 'up';
        setSwipeTrail(direction);
      }
    }

    if (direction) {
      processMove(direction);
      setTimeout(() => setSwipeTrail(null), 300);
    }
  };

  if (!mounted) return null;

  if (showMenu) {
    return (
      <MenuScreen
        onNewGame={handleNewSize}
        onContinue={handleContinueSize}
        gridSize={gridSize}
      />
    );
  }

  return (
    <div className="game-container">
      <Header
        score={score}
        best={best}
        gridSize={gridSize}
        soundEnabled={soundEnabled}
        onBack={handleBackToMenu}
        onPause={handleBackToMenu}
        onSoundToggle={() => {
          const newEnabled = !soundEnabled;
          setSoundEnabled(newEnabled);
          audio.setEnabled(newEnabled);
          saveGame(gridSize, board, score, gameOver, won, newEnabled);
        }}
      />

      <div style={{ position: 'relative', width: '80%', height: 'auto' }}>
        <div className={`swipe-indicator ${swipeTrail || ''}`} />
        <GameBoard
          board={board}
          gridSize={gridSize}
          newTile={newTile}
          mergedCells={mergedCells}
          movingTiles={movingTiles}
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

