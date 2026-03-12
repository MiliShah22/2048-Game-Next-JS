'use client';

import { GridSize, GridOption } from '@/lib/gameTypes';
import { loadGame } from '@/lib/gamePersistence';

const gridOptions: GridOption[] = [
    { size: 4, label: 'Classic', difficulty: 'Easy' },
    { size: 5, label: 'Extended', difficulty: 'Medium' },
    { size: 6, label: 'Challenge', difficulty: 'Hard' },
    { size: 7, label: 'Expert', difficulty: 'Extreme' },
    { size: 8, label: 'Master', difficulty: 'Insane' },
];

interface MenuScreenProps {
    onNewGame: (size: GridSize) => void;
    onContinue: (size: GridSize) => void;
    gridSize?: GridSize;
}

export function MenuScreen({ onNewGame, onContinue, gridSize: currentGridSize }: MenuScreenProps) {
    return (
        <div className="menu-screen">
            <div className="menu-content" style={{ top: '15px' }}>
                <div className="logo-section">
                    <h1 className="logo-title">2048</h1>
                    <div className="logo-glow"></div>
                    <p className="logo-subtitle">Dynamic Edition</p>
                </div>

                <p className="select-prompt">Select grid size to begin</p>

                <div className="grid-options" role="group" aria-label="Grid size selection">
                    {gridOptions.map((option) => {
                        const saved = loadGame(option.size);
                        const hasSave = saved !== null && !saved.gameOver;
                        return (
                            <button
                                key={option.size}
                                className={`grid-option ${hasSave ? 'has-save' : ''}`}
                                data-size={option.size}
                                onClick={hasSave ? () => onContinue(option.size) : () => onNewGame(option.size)}
                                aria-label={`${option.size} by ${option.size} ${hasSave ? 'continue' : 'new'} game, ${option.label} mode`}
                            >
                                <span className="option-size">{option.size}x{option.size}</span>
                                <span className="option-label">{option.label}</span>
                                <span className="option-difficulty">{option.difficulty}</span>
                                <span className="option-action">{hasSave ? 'Continue' : 'New Game'}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="menu-footer">
                    Use <kbd>Arrow Keys</kbd> or swipe to move tiles
                </p>
            </div>
        </div>
    );
}

