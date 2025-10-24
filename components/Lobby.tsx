
import React, { useState } from 'react';
import type { User, GameState, GameOptions, PlayerState } from '../types';
import { SHIPS_BY_COUNT, BOARD_SIZE } from '../constants';
import { HelpModal } from './HelpModal';

interface LobbyProps {
  currentUser: User;
  users: User[];
  games: GameState[];
  onStartGame: (game: GameState) => void;
  onSelectGame: (game: GameState) => void;
  onRefresh: () => void;
}

const createEmptyBoard = (): PlayerState['board'] => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('empty'));

export const Lobby: React.FC<LobbyProps> = ({ currentUser, users, games, onStartGame, onSelectGame, onRefresh }) => {
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [opponent, setOpponent] = useState<User | null>(null);
  const [gameOptions, setGameOptions] = useState<GameOptions>({ shipCount: 5, timed: false });

  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const userGames = games.filter(g => g.player1.id === currentUser.id || g.player2.id === currentUser.id);

  const handleCreateGame = () => {
    if (!opponent) return;

    const newGame: GameState = {
      id: `game-${currentUser.id}-${opponent.id}-${Date.now()}`,
      player1: { id: currentUser.id, name: currentUser.name, board: createEmptyBoard(), ships: [], isReady: false },
      player2: { id: opponent.id, name: opponent.name, board: createEmptyBoard(), ships: [], isReady: false },
      currentPlayerId: null,
      winnerId: null,
      status: 'setup',
      options: gameOptions,
      shots: [],
    };
    onStartGame(newGame);
    setShowNewGameModal(false);
  };
  
  const handleChallenge = (user: User) => {
    setOpponent(user);
    setShowNewGameModal(true);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Current Games */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Your Games</h2>
          {userGames.length > 0 ? (
            <ul className="space-y-3">
              {userGames.map(game => {
                const opponentState = game.player1.id === currentUser.id ? game.player2 : game.player1;
                return (
                  <li key={game.id} className="bg-slate-700 p-4 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold">vs. {opponentState.name}</p>
                      <p className="text-sm text-slate-400 capitalize">{game.status}, {game.options.shipCount} ships</p>
                    </div>
                    <button onClick={() => onSelectGame(game)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition">
                      {game.status === 'setup' ? 'Setup' : 'Resume'}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-slate-400">You have no active games. Challenge another player!</p>
          )}
        </div>

        {/* Online Players */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400">Online Players</h2>
            <button onClick={onRefresh} className="text-sm text-cyan-400 hover:text-cyan-300">Refresh</button>
          </div>
          <p className="text-xs text-slate-500 mb-4">(This is a simulation. To test with multiple users, open this app in another tab and create a new user.)</p>
          {otherUsers.length > 0 ? (
            <ul className="space-y-3">
              {otherUsers.map(user => (
                <li key={user.id} className="bg-slate-700 p-4 rounded-md flex justify-between items-center">
                  <span className="font-semibold">{user.name}</span>
                  <button onClick={() => handleChallenge(user)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition">
                    Challenge
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">No other players found. Open another tab to simulate more players.</p>
          )}
        </div>

      </div>
       <div className="mt-8 text-center">
        <button onClick={() => setShowHelpModal(true)} className="bg-slate-700 hover:bg-slate-600 text-cyan-300 font-bold py-2 px-6 rounded-md transition">
            How to Play
        </button>
       </div>

      {/* New Game Modal */}
      {showNewGameModal && opponent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-4 text-cyan-400">New Game vs. {opponent.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">Number of Ships</label>
                <select 
                  value={gameOptions.shipCount} 
                  onChange={(e) => setGameOptions(prev => ({...prev, shipCount: parseInt(e.target.value) as 3|5|7}))}
                  className="w-full bg-slate-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="3">3 Ships</option>
                  <option value="5">5 Ships (Standard)</option>
                  <option value="7">7 Ships</option>
                </select>
              </div>
              <div className="flex items-center">
                <input 
                  id="timed-game"
                  type="checkbox" 
                  checked={gameOptions.timed} 
                  onChange={(e) => setGameOptions(prev => ({...prev, timed: e.target.checked}))}
                  className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="timed-game" className="ml-3 text-slate-300">Timed Game (Not implemented)</label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setShowNewGameModal(false)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
              <button onClick={handleCreateGame} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Start Game</button>
            </div>
          </div>
        </div>
      )}

      <HelpModal isVisible={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
};
