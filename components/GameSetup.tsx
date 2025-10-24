
import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, User, Ship, ShipType, PlayerState } from '../types';
import { GameBoard } from './GameBoard';
import { ShipDisplay } from './ShipDisplay';
import { SHIPS_BY_COUNT, SHIP_DEFINITIONS, BOARD_SIZE } from '../constants';

interface GameSetupProps {
  gameState: GameState;
  setGameState: (newGameState: GameState) => void;
  currentUser: User;
}

export const GameSetup: React.FC<GameSetupProps> = ({ gameState, setGameState, currentUser }) => {
  const isPlayer1 = currentUser.id === gameState.player1.id;
  const myInitialPlayerState = isPlayer1 ? gameState.player1 : gameState.player2;

  const [playerState, setPlayerState] = useState<PlayerState>(myInitialPlayerState);
  const [selectedShipType, setSelectedShipType] = useState<ShipType | null>(null);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const shipsToPlace = SHIPS_BY_COUNT[gameState.options.shipCount];
  const placedShipTypes = playerState.ships.map(s => s.type);

  const nextShipToPlace = shipsToPlace.find(type => {
      const placedCount = placedShipTypes.filter(t => t === type).length;
      const requiredCount = shipsToPlace.filter(t => t === type).length;
      return placedCount < requiredCount;
  });

  useEffect(() => {
    if (nextShipToPlace) {
      setSelectedShipType(nextShipToPlace);
    }
  }, [nextShipToPlace]);
  
  const canPlaceShip = useCallback((x: number, y: number, shipType: ShipType, currentOrientation: 'horizontal' | 'vertical', board: PlayerState['board']): boolean => {
    const shipLength = SHIP_DEFINITIONS[shipType].size;
    if (currentOrientation === 'horizontal') {
      if (y + shipLength > BOARD_SIZE) return false;
      for (let i = 0; i < shipLength; i++) {
        if (board[x][y + i] !== 'empty') return false;
      }
    } else {
      if (x + shipLength > BOARD_SIZE) return false;
      for (let i = 0; i < shipLength; i++) {
        if (board[x + i][y] !== 'empty') return false;
      }
    }
    return true;
  }, []);

  const placeShip = (x: number, y: number) => {
    if (!selectedShipType || !canPlaceShip(x, y, selectedShipType, orientation, playerState.board)) {
        // Maybe add a visual cue for invalid placement
        return;
    }

    const newBoard = playerState.board.map(row => [...row]);
    const shipLength = SHIP_DEFINITIONS[selectedShipType].size;
    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < shipLength; i++) {
        if (orientation === 'horizontal') {
            newBoard[x][y + i] = 'ship';
            positions.push({ x, y: y + i });
        } else {
            newBoard[x + i][y] = 'ship';
            positions.push({ x: x + i, y });
        }
    }

    const newShip: Ship = {
        id: playerState.ships.length + 1,
        type: selectedShipType,
        length: shipLength,
        positions,
        hits: [],
        isSunk: false
    };

    setPlayerState(prev => ({
        ...prev,
        board: newBoard,
        ships: [...prev.ships, newShip],
    }));
  };

  const autoPlaceShips = useCallback(() => {
      let currentBoard = playerState.board.map(row => [...row]);
      let currentShips = [...playerState.ships];
      const shipsToPlaceNow = shipsToPlace.filter(type => {
          const placedCount = currentShips.map(s => s.type).filter(t => t === type).length;
          const requiredCount = shipsToPlace.filter(t => t === type).length;
          return placedCount < requiredCount;
      });

      for (const shipType of shipsToPlaceNow) {
          let placed = false;
          while (!placed) {
              const currentOrientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
              const x = Math.floor(Math.random() * BOARD_SIZE);
              const y = Math.floor(Math.random() * BOARD_SIZE);

              if (canPlaceShip(x, y, shipType, currentOrientation, currentBoard)) {
                  const shipLength = SHIP_DEFINITIONS[shipType].size;
                  const positions: { x: number; y: number }[] = [];
                  for (let i = 0; i < shipLength; i++) {
                      if (currentOrientation === 'horizontal') {
                          currentBoard[x][y + i] = 'ship';
                          positions.push({ x, y: y + i });
                      } else {
                          currentBoard[x + i][y] = 'ship';
                          positions.push({ x: x + i, y });
                      }
                  }
                  currentShips.push({ id: currentShips.length + 1, type: shipType, length: shipLength, positions, hits: [], isSunk: false });
                  placed = true;
              }
          }
      }
      setPlayerState(prev => ({ ...prev, board: currentBoard, ships: currentShips }));
  }, [playerState, shipsToPlace, canPlaceShip]);

  useEffect(() => {
    if (timeLeft === 0) {
      autoPlaceShips();
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, autoPlaceShips]);


  const handleConfirmPlacement = () => {
    if (playerState.ships.length !== shipsToPlace.length) {
        autoPlaceShips();
    }
    const finalPlayerState = {...playerState, isReady: true};
    
    // Have to update playerState first to ensure auto-placement is captured
    setPlayerState(finalPlayerState)
    
    setGameState({
        ...gameState,
        [isPlayer1 ? 'player1' : 'player2']: finalPlayerState,
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const allShipsPlaced = playerState.ships.length === shipsToPlace.length;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold mb-4">Place Your Ships</h2>
        <GameBoard board={playerState.board} onCellClick={placeShip} isEnemyBoard={false} />
      </div>
      <div className="w-full lg:w-80 bg-slate-800 p-6 rounded-lg shadow-lg">
        <div className="text-center text-xl font-mono mb-4 p-2 bg-slate-900 rounded-md">
            Time Left: {minutes}:{seconds < 10 ? '0' : ''}{seconds}
        </div>
        <h3 className="text-xl font-bold mb-4">Your Fleet</h3>
        <div className="space-y-4 mb-6">
            {shipsToPlace.map((shipType, index) => {
                const placed = playerState.ships.some((s, i) => s.id === i + 1 && placedShipTypes[i] === shipType);
                const isSelected = selectedShipType === shipType && !placed && nextShipToPlace === shipType;
                return (
                    <div key={index} className={`${isSelected ? 'ring-2 ring-cyan-400' : ''} p-2 rounded-md bg-slate-700`}>
                        <ShipDisplay shipType={shipType} isPlaced={placed} />
                    </div>
                );
            })}
        </div>
        <div className="space-y-4">
          <button 
            onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Rotate Ship ({orientation})
          </button>
          <button
            onClick={autoPlaceShips}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition"
            disabled={allShipsPlaced}
          >
            Auto-Place Remaining
          </button>
          <button 
            onClick={handleConfirmPlacement}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md text-lg transition"
          >
            Confirm Placement
          </button>
        </div>
      </div>
    </div>
  );
};
