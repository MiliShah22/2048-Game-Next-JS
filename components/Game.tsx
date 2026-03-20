'use client';

import { useEffect, useState, useCallback, useRef, useReducer } from 'react';
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

interface BoardState {
  board: Board;
  newTile: NewTile | null;
  mergedCells: Array<{ r: number; c: number }>;
  movingTiles: Array<MovingTile>;
}

type BoardAction =
  | { type: 'RESET'; board: Board; newTile: NewTile | null; gridSize: GridSize }
  | { type: 'MOVE'; direction: Direction; board: Board; mergedCells: Array<{ r: number; c: number }>; newTile: NewTile | null }
  | { type: 'CLEAR_ANIMS' };

const boardReducer = (state: BoardState, action: BoardAction): BoardState => {
  switch (action.type) {
    case 'RESET':
      return {
        board: action.board,
        newTile: action.newTile,
        mergedCells: [],
        movingTiles: [],
      };
    case 'MOVE':
      return {
        board: action.board,
        newTile: action.newTile,
        mergedCells: action.mergedCells,
        movingTiles: [],
      };
    case 'CLEAR_ANIMS':
      return {
        ...state,
        newTile: null,
        mergedCells: [],
        movingTiles: [],
      };
    default:
      return state;
  }
};

export function Game() {
  const [showMenu, setShowMenu] = useState(true);
  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [boardState, dispatch] = useReducer(boardReducer, {
    board: [],
    newTile: null,
    mergedCells: [],
    movingTiles: [],
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [swipeTrail, setSwipeTrail] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Use refs to avoid stale closures
  const gameStateRef = useRef({ gameOver, showMenu, boardState, score, best, won, gridSize });
  useEffect(() => {
    gameStateRef.current = { gameOver, showMenu, boardState, score, best, won, gridSize, soundEnabled };
  }, [gameOver, showMenu, boardState, score, best, won, gridSize, soundEnabled]);

  // Toggle game-active class on body for CSS perf
  useEffect(() => {
    if (!showMenu && mounted) {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }
    return () => document.body.classList.remove('game-active');
  }, [showMenu, mounted]);

  // Auto-save on state change
  useEffect(() => {
    if (!showMenu && boardState.board.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCurrentGame();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [boardState, score, gameOver, won, gridSize, soundEnabled, showMenu]);

  // Save on page visibility change / pause
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showMenu && boardState.board.length > 0) {
        saveCurrentGame();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', saveCurrentGame);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', saveCurrentGame);
    };
  }, [boardState.board.length, showMenu]);

  // Initialize best score on mount & audio
  useEffect(() => {
    if (mounted) return;
    setMounted(true);
    const savedBest = localStorage.getItem('best2048Dynamic');
    const initialBest = savedBest ? parseInt(savedBest, 10) : 0;
    setBest(initialBest);
    audio.setEnabled(soundEnabled);
  }, []);

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
      dispatch({ type: 'RESET', board: savedState.board, newTile: null, gridSize: size });
      setScore(savedState.score);
      setGameOver(savedState.gameOver);
      setWon(savedState.won);
      if (savedState.soundEnabled !== undefined) {
        setSoundEnabled(savedState.soundEnabled);
        audio.setEnabled(savedState.soundEnabled);
      }
      return;
    }
    handleNewSize(size);
  };

  const startNewGame = (size?: GridSize, forceNew: boolean = false) => {
    const boardSize = size || gridSize;
    if (!forceNew) {
      const savedState = loadGame(boardSize);
      if (savedState) {
        dispatch({ type: 'RESET', board: savedState.board, newTile: null, gridSize: boardSize });
        setScore(savedState.score);
        setGameOver(savedState.gameOver);
        setWon(savedState.won);
        if (savedState.soundEnabled !== undefined) {
          setSoundEnabled(savedState.soundEnabled);
          audio.setEnabled(savedState.soundEnabled);
        }
        setTimeout(() => {
          const tile1 = addRandomTile(savedState.board);
          dispatch({ type: 'MOVE', direction: 'none' as Direction, board: [...savedState.board], mergedCells: [], newTile: tile1 });
        }, 100);
        return;
      }
    }
    const newBoard = createEmptyBoard(boardSize);
    const tile1 = addRandomTile(newBoard);
    addRandomTile(newBoard);
    clearSave(boardSize);
    dispatch({ type: 'RESET', board: newBoard, newTile: tile1, gridSize: boardSize });
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const handleNewGame = () => {
    startNewGame(undefined, true);
  };

  const saveCurrentGame = () => {
    saveGame(gridSize, boardState.board, score, gameOver, won, soundEnabled);
  };

  const handleBackToMenu = () => {
    saveCurrentGame();
    setShowMenu(true);
  };

  const processMove = useCallback((direction: Direction) => {
    const { gameOver: isGameOver, showMenu: isMenu, boardState: currentState, score: currentScore, best: currentBest, won: hasWon } = gameStateRef.current;

    if (isGameOver || isMenu) return;
    if (!currentState.board || currentState.board.length === 0) return;

    const boardCopy = currentState.board.map((row) => [...row]);
    const result = handleMove(boardCopy, direction);

    if (!result.moved) return;

    audio.play('swipe');

    let newScore = currentScore;
    let newWon = hasWon;

    result.mergedCells.forEach(({ r, c }) => {
      const tileValue = boardCopy[r][c];
      newScore += tileValue;
      audio.play('merge', { pitch: Math.log2(tileValue) / 4 });
      if (tileValue === 2048 && !newWon) {
        newWon = true;
      }
    });

    const tile = addRandomTile(boardCopy);

    // Batch board + tile updates
    dispatch({ type: 'MOVE', direction, board: boardCopy, mergedCells: result.mergedCells, newTile: tile });
    setScore(newScore);
    audio.play('spawn');
    setTimeout(() => dispatch({ type: 'CLEAR_ANIMS' }), 200);
    setWon(newWon);

    if (newScore > currentBest) {
      setBest(newScore);
      localStorage.setItem('best2048Dynamic', newScore.toString());
    }

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
          saveGame(gridSize, boardState.board, score, gameOver, won, newEnabled);
        }}
      />

      <div style={{ position: 'relative', width: '80%', height: 'auto' }}>
        <div className={`swipe-indicator ${swipeTrail || ''}`} />
        <GameBoard
          board={boardState.board}
          gridSize={gridSize}
          newTile={boardState.newTile}
          mergedCells={boardState.mergedCells}
          movingTiles={boardState.movingTiles}
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

