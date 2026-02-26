'use client';

interface GameCellProps {
  value: number;
  isNew: boolean;
  isMerged: boolean;
}

export function GameCell({ value, isNew, isMerged }: GameCellProps) {
  const getCellClass = (val: number): string => {
    if (val === 0) return 'cell-empty';
    if (val <= 2048) return `cell-${val}`;
    return 'cell-super';
  };

  return (
    <div
      className={`cell ${getCellClass(value)} ${isNew ? 'cell-new' : ''} ${
        isMerged ? 'cell-merged' : ''
      }`}
      role="gridcell"
    >
      {value > 0 && value}
    </div>
  );
}
