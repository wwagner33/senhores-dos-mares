
import type { ShipType } from './types';

export const BOARD_SIZE = 10;

export const SHIP_DEFINITIONS: Record<ShipType, { size: number; name: string }> = {
  carrier: { size: 5, name: 'Carrier' },
  battleship: { size: 4, name: 'Battleship' },
  cruiser: { size: 3, name: 'Cruiser' },
  submarine: { size: 3, name: 'Submarine' },
  destroyer: { size: 2, name: 'Destroyer' },
};

export const SHIPS_BY_COUNT = {
  3: ['destroyer', 'submarine', 'battleship'] as ShipType[],
  5: ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier'] as ShipType[],
  7: [
    'destroyer', 
    'destroyer', 
    'submarine', 
    'cruiser', 
    'battleship', 
    'battleship',
    'carrier'
    ] as ShipType[],
};
