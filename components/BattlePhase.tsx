
import React from 'react';
import type { GameState, User, Ship, CellState } from '../types';
import { GameBoard } from './GameBoard';
import { ShipDisplay } from './ShipDisplay';

interface BattlePhaseProps {
  gameState: GameState;
  setGameState: (newGameState: GameState) => void;
  currentUser: User;
  onGameOver: (gameState: GameState) => void;
}

export const BattlePhase: React.FC<BattlePhaseProps> = ({ gameState, setGameState, currentUser, onGameOver }) => {
    const isPlayer1 = currentUser.id === gameState.player1.id;
    const myPlayerState = isPlayer1 ? gameState.player1 : gameState.player2;
    const opponentPlayerState = isPlayer1 ? gameState.player2 : gameState.player1;

    const isMyTurn = gameState.currentPlayerId === currentUser.id;

    const handleFire = (x: number, y: number) => {
        if (!isMyTurn || gameState.status !== 'playing') return;
        
        const opponentBoard = opponentPlayerState.board.map(row => [...row]);
        if (opponentBoard[x][y] === 'hit' || opponentBoard[x][y] === 'miss' || opponentBoard[x][y] === 'sunk') return;

        let newGameState = { ...gameState };
        let newOpponentState = JSON.parse(JSON.stringify(opponentPlayerState));
        let hitShip: Ship | undefined;

        if (opponentBoard[x][y] === 'ship') {
            opponentBoard[x][y] = 'hit';
            
            newOpponentState.ships.forEach((ship: Ship) => {
                const wasHit = ship.positions.some(p => p.x === x && p.y === y);
                if (wasHit) {
                    ship.hits.push({ x, y });
                    if (ship.hits.length === ship.length) {
                        ship.isSunk = true;
                        hitShip = ship;
                    }
                }
            });

            if (hitShip) {
                hitShip.positions.forEach(p => {
                    opponentBoard[p.x][p.y] = 'sunk';
                });
            }
        } else {
            opponentBoard[x][y] = 'miss';
        }

        newOpponentState.board = opponentBoard;
        
        const allShipsSunk = newOpponentState.ships.every((s: Ship) => s.isSunk);
        
        if (allShipsSunk) {
            newGameState.status = 'finished';
            newGameState.winnerId = currentUser.id;
        } else {
            newGameState.currentPlayerId = opponentPlayerState.id;
        }

        if (isPlayer1) {
            newGameState.player2 = newOpponentState;
        } else {
            newGameState.player1 = newOpponentState;
        }
        
        newGameState.shots.push({ x, y, playerId: currentUser.id });
        setGameState(newGameState);

        if(newGameState.status === 'finished'){
            // Delay to show the final board state before ending
            setTimeout(() => onGameOver(newGameState), 2000);
        }
    };

    const opponentShipsSunkCount = opponentPlayerState.ships.filter(s => s.isSunk).length;

    return (
        <div>
            <div className="text-center mb-6 p-4 bg-slate-800 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold">
                    {gameState.status === 'playing' ? (isMyTurn ? 'Your Turn' : `Waiting for ${opponentPlayerState.name}...`) : 'Game Over'}
                </h2>
                {isMyTurn && <p className="text-cyan-400">Select a coordinate on the enemy's grid to fire.</p>}
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-2 text-center">Your Waters</h3>
                    <GameBoard board={myPlayerState.board} isEnemyBoard={false} />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2 text-center">Enemy Waters</h3>
                    <GameBoard board={opponentPlayerState.board} onCellClick={handleFire} isEnemyBoard={true} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-center text-cyan-400">Your Fleet Status</h4>
                <div className="space-y-2">
                  {myPlayerState.ships.map(ship => <ShipDisplay key={ship.id} shipType={ship.type} isSunk={ship.isSunk} />)}
                </div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-center text-cyan-400">Enemy Fleet Status</h4>
                <p className="text-center mb-2">{opponentShipsSunkCount} / {opponentPlayerState.ships.length} ships sunk</p>
                <div className="space-y-2">
                  {opponentPlayerState.ships.map(ship => <ShipDisplay key={ship.id} shipType={ship.type} isSunk={ship.isSunk} />)}
                </div>
              </div>
            </div>
        </div>
    );
};
