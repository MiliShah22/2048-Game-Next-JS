'use client';

import { MovingTile } from '@/lib/gameTypes';

interface GameCellProps {
  value: number;
  isNew: boolean;
  isMerged: boolean;
  movingTile?: MovingTile;
  isMovingFromHere?: boolean;
}

export function GameCell({ value, isNew, isMerged, movingTile, isMovingFromHere }: GameCellProps) {
  const getCellClass = (val: number): string => {
    if (val === 0) return 'cell-empty';
    if (val <= 2048) return `cell-${val}`;
    return 'cell-super';
  };

  const cellClasses = [
    'cell',
    getCellClass(value),
    isNew ? 'cell-new' : '',
    isMerged ? 'cell-merged' : '',
    movingTile ? 'cell-moving-to' : '',
    isMovingFromHere ? 'cell-moving-from' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cellClasses}
      role="gridcell"
      style={movingTile ? {
        '--move-from-x': `${movingTile.fromC * 100}%`,
        '--move-from-y': `${movingTile.fromR * 100}%`,
      } as React.CSSProperties : {}}
    >
      {movingTile ? movingTile.value : (value > 0 && value)}
    </div>
  );
}
