
export interface User {
  id: string;
  name: string;
}

export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export interface Ship {
  id: number;
  type: ShipType;
  length: number;
  positions: { x: number; y: number }[];
  hits: { x: number; y: number }[];
  isSunk: boolean;
}

export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';

export type GameBoard = CellState[][];

export interface PlayerState {
  id: string;
  name:string;
  board: GameBoard;
  ships: Ship[];
  isReady: boolean;
}

export interface GameOptions {
  shipCount: 3 | 5 | 7;
  timed: boolean;
}

export interface GameState {
  id: string;
  player1: PlayerState;
  player2: PlayerState;
  currentPlayerId: string | null;
  winnerId: string | null;
  status: 'setup' | 'playing' | 'finished';
  options: GameOptions;
  shots: { x: number, y: number, playerId: string }[];
}

export interface MatchRecord {
  userId: string;
  opponentId: string;
  opponentNames: string[];
  wins: number;
  losses: number;
}
