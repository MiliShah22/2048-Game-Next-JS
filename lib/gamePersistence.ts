import { Board, GameState, GridSize } from './gameTypes';

export function getSaveKey(gridSize: GridSize): string {
    return `game2048_${gridSize}`;
}

export function saveGame(
    gridSize: GridSize,
    board: Board,
    score: number,
    gameOver: boolean,
    won: boolean
): void {
    const key = getSaveKey(gridSize);
    const state: Omit<GameState, 'best'> = {
        board,
        score,
        gameOver,
        won,
        gridSize,
    };
    localStorage.setItem(key, JSON.stringify(state));
}

export function loadGame(gridSize: GridSize): GameState | null {
    const key = getSaveKey(gridSize);
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    try {
        const state: GameState = JSON.parse(saved);
        // Validate
        if (state.gridSize !== gridSize) return null;
        if (!Array.isArray(state.board) || state.board.length !== gridSize) return null;
        for (let r = 0; r < gridSize; r++) {
            if (!Array.isArray(state.board[r]) || state.board[r].length !== gridSize) return null;
            for (let c = 0; c < gridSize; c++) {
                const val = state.board[r][c];
                if (typeof val !== 'number' || val < 0 || !Number.isInteger(val)) return null;
            }
        }
        return state;
    } catch {
        localStorage.removeItem(key);
        return null;
    }
}

export function clearSave(gridSize: GridSize): void {
    const key = getSaveKey(gridSize);
    localStorage.removeItem(key);
}

