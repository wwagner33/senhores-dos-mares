
import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, User } from '../types';
import { GameSetup } from './GameSetup';
import { BattlePhase } from './BattlePhase';
import { saveGame } from '../services/storageService';

interface GameProps {
  initialGameState: GameState;
  currentUser: User;
  onGameOver: (gameState: GameState) => void;
}

export const Game: React.FC<GameProps> = ({ initialGameState, currentUser, onGameOver }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const isPlayer1 = currentUser.id === gameState.player1.id;
  const myPlayerState = isPlayer1 ? gameState.player1 : gameState.player2;
  const opponentPlayerState = isPlayer1 ? gameState.player2 : gameState.player1;

  const updateGameState = useCallback((newGameState: GameState) => {
    setGameState(newGameState);
    saveGame(newGameState);
  }, []);

  useEffect(() => {
    if (gameState.status === 'setup' && gameState.player1.isReady && gameState.player2.isReady) {
      // Both players are ready, start the game
      const firstPlayerId = Math.random() < 0.5 ? gameState.player1.id : gameState.player2.id;
      const newGameState: GameState = {
        ...gameState,
        status: 'playing',
        currentPlayerId: firstPlayerId,
      };
      updateGameState(newGameState);
    }
  }, [gameState, updateGameState]);
  
  if (gameState.status === 'finished') {
    return (
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">Game Over</h2>
        <p className="text-2xl text-cyan-400 mb-8">
          {gameState.winnerId === currentUser.id ? "You Won!" : "You Lost!"}
        </p>
        <button 
            onClick={() => onGameOver(gameState)} 
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-md text-lg transition"
        >
            Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div>
      {myPlayerState.isReady ? (
         <BattlePhase 
            gameState={gameState} 
            setGameState={updateGameState}
            currentUser={currentUser}
            onGameOver={onGameOver}
         />
      ) : (
        <GameSetup
          gameState={gameState}
          setGameState={updateGameState}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
