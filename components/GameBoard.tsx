
import React from 'react';
import type { GameBoard as BoardType } from '../types';
import { BOARD_SIZE } from '../constants';

interface GameBoardProps {
  board: BoardType;
  onCellClick?: (x: number, y: number) => void;
  isEnemyBoard: boolean;
}

const Cell: React.FC<{ state: string; onClick: () => void; isEnemyBoard: boolean }> = ({ state, onClick, isEnemyBoard }) => {
  const baseClasses = "w-full h-full border border-slate-700 flex items-center justify-center transition-colors duration-300";
  let stateClasses = "bg-slate-800";
  let content = null;
  
  const clickableClasses = isEnemyBoard ? "cursor-crosshair hover:bg-slate-600" : "cursor-default";

  switch (state) {
    case 'ship':
      stateClasses = isEnemyBoard ? "bg-slate-800" : "bg-slate-500";
      break;
    case 'miss':
      stateClasses = "bg-slate-700";
      content = <div className="w-2 h-2 bg-slate-400 rounded-full" />;
      break;
    case 'hit':
      stateClasses = "bg-yellow-600";
      content = <div className="text-xl">🔥</div>;
      break;
    case 'sunk':
        stateClasses = "bg-red-800";
        content = <div className="text-xl">💀</div>;
        break;
  }

  return (
    <div className={`aspect-square ${baseClasses} ${stateClasses} ${onClick ? clickableClasses : ''}`} onClick={onClick}>
        {content}
    </div>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, isEnemyBoard }) => {
  const labels = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="inline-grid grid-cols-1 grid-rows-1 gap-2 p-2 bg-slate-900 rounded-lg">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        {/* Empty corner */}
        <div></div> 
        {/* Column labels */}
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <div key={i} className="text-center font-bold text-cyan-400">{i + 1}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        {/* Row labels */}
        <div className="grid grid-rows-10 gap-1">
          {labels.map(label => (
            <div key={label} className="flex items-center justify-center font-bold text-cyan-400 pr-2">{label}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-10 grid-rows-10 gap-1 bg-slate-700">
          {board.map((row, x) =>
            row.map((cell, y) => (
              <Cell 
                key={`${x}-${y}`} 
                state={cell}
                onClick={() => onCellClick?.(x, y)}
                isEnemyBoard={isEnemyBoard}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
