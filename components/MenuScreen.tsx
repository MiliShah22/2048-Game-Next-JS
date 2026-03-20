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
        <div className="menu-screen px-4 sm:px-8 md:px-16 p-8 sm:p-12 md:p-16">
            <div className="menu-content relative">
                <div className="logo-section mb-8 sm:mb-12 md:mb-16 lg:mb-20">
                    <h1 className="logo-title leading-none sm:leading-tight">2048</h1>
                    <div className="logo-glow"></div>
                    <p className="logo-subtitle">Dynamic Edition</p>
                </div>

                <p className="select-prompt text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8">Select grid size to begin</p>

                <div className="grid-options grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2 sm:px-4" role="group" aria-label="Grid size selection">
                    {gridOptions.map((option) => {
                        const saved = loadGame(option.size);
                        const hasSave = saved !== null && !saved.gameOver;
                        return (
                            <button
                                key={option.size}
                                className={`grid-option min-h-[80px] sm:min-h-[100px] p-4 sm:p-6 text-sm sm:text-base ${hasSave ? 'has-save' : ''}`}
                                data-size={option.size}
                                onClick={hasSave ? () => onContinue(option.size) : () => onNewGame(option.size)}
                                aria-label={`${option.size} by ${option.size} ${hasSave ? 'continue' : 'new'} game, ${option.label} mode`}
                            >
                                <span className="option-size text-2xl sm:text-3xl md:text-4xl">{option.size}x{option.size}</span>
                                <span className="option-label">{option.label}</span>
                                <span className="option-difficulty">{option.difficulty}</span>
                                <span className="option-action">{hasSave ? 'Continue' : 'New Game'}</span>
                            </button>
                        );
                    })}
                </div>

                <p className="menu-footer text-xs sm:text-sm px-4">
                    Use <kbd>Arrow Keys</kbd> or swipe to move tiles
                </p>
            </div>
        </div>
    );
}

