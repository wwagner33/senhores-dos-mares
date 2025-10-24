
import React from 'react';
import type { ShipType } from '../types';
import { SHIP_DEFINITIONS } from '../constants';
import { CarrierIcon, BattleshipIcon, CruiserIcon, SubmarineIcon, DestroyerIcon } from './icons/ShipIcons';

interface ShipDisplayProps {
  shipType: ShipType;
  isPlaced?: boolean;
  isSunk?: boolean;
}

const shipIcons: Record<ShipType, React.FC<{className?: string}>> = {
  carrier: CarrierIcon,
  battleship: BattleshipIcon,
  cruiser: CruiserIcon,
  submarine: SubmarineIcon,
  destroyer: DestroyerIcon,
};

export const ShipDisplay: React.FC<ShipDisplayProps> = ({ shipType, isPlaced, isSunk }) => {
  const definition = SHIP_DEFINITIONS[shipType];
  const Icon = shipIcons[shipType];

  let statusText = '';
  let statusColor = 'text-slate-400';

  if (isSunk) {
    statusText = 'SUNK';
    statusColor = 'text-red-500 line-through';
  } else if (isPlaced === true) {
    statusText = 'Placed';
    statusColor = 'text-green-500';
  } else if (isPlaced === false) {
    statusText = 'Awaiting Placement';
    statusColor = 'text-yellow-500';
  }

  return (
    <div className={`flex items-center justify-between p-2 rounded-md ${isSunk ? 'bg-slate-900 opacity-60' : 'bg-slate-700'}`}>
        <div className="flex items-center gap-3">
            <Icon className={`w-16 h-auto ${isSunk ? 'fill-red-900' : 'fill-slate-400'}`} />
            <span className={`font-semibold ${isSunk ? 'line-through text-slate-500' : ''}`}>{definition.name}</span>
        </div>
        {statusText && <span className={`text-sm font-bold ${statusColor}`}>{statusText}</span>}
    </div>
  );
};
