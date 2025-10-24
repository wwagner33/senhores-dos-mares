
import React, { useState, useEffect } from 'react';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { Stats } from './components/Stats';
import type { User, GameState, MatchRecord } from './types';
import { getCurrentUser, saveCurrentUser, getStoredUsers, getStoredGames, saveGame, getMatchHistory, saveMatchHistory, removeGame } from './services/storageService';

type View = 'lobby' | 'game' | 'stats';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('lobby');
  const [activeGame, setActiveGame] = useState<GameState | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allGames, setAllGames] = useState<GameState[]>([]);
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    refreshData();
  }, []);

  const refreshData = () => {
    setAllUsers(getStoredUsers());
    setAllGames(getStoredGames());
    setMatchHistory(getMatchHistory());
  };

  const handleLogin = (username: string) => {
    const user = saveCurrentUser(username);
    setCurrentUser(user);
    refreshData();
  };

  const handleStartGame = (game: GameState) => {
    saveGame(game);
    setActiveGame(game);
    setView('game');
    refreshData();
  };
  
  const handleSelectGame = (game: GameState) => {
    setActiveGame(game);
    setView('game');
  };

  const handleGameOver = (finishedGame: GameState) => {
    const winnerId = finishedGame.winnerId;
    if (winnerId && currentUser) {
        const opponentId = finishedGame.player1.id === currentUser.id ? finishedGame.player2.id : finishedGame.player1.id;
        const newHistory = getMatchHistory();
        let record = newHistory.find(r => r.opponentId === opponentId && r.userId === currentUser.id);

        const opponent = allUsers.find(u => u.id === opponentId);
        const opponentName = opponent ? opponent.name : 'Unknown';

        if (!record) {
            record = {
                userId: currentUser.id,
                opponentId: opponentId,
                opponentNames: [opponentName],
                wins: 0,
                losses: 0,
            };
            newHistory.push(record);
        } else {
            if (!record.opponentNames.includes(opponentName)) {
                record.opponentNames.push(opponentName);
            }
        }

        if (winnerId === currentUser.id) {
            record.wins++;
        } else {
            record.losses++;
        }
        
        saveMatchHistory(newHistory);
    }
    removeGame(finishedGame.id);
    setActiveGame(null);
    setView('lobby');
    refreshData();
  };

  const navigateTo = (newView: View) => {
    setView(newView);
    refreshData();
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-lg shadow-2xl">
          <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Battleship</h1>
          <p className="text-center text-slate-300 mb-6">Enter your username to begin.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const username = (e.currentTarget.elements.namedItem('username') as HTMLInputElement).value;
            if (username.trim()) {
              handleLogin(username.trim());
            }
          }}>
            <input 
              name="username"
              type="text" 
              placeholder="Username" 
              className="w-full bg-slate-700 text-white p-3 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition duration-300">
              Enter Lobby
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'stats':
        return <Stats matchHistory={matchHistory} allUsers={allUsers} currentUserId={currentUser.id} />;
      case 'game':
        if (activeGame) {
          return <Game 
            initialGameState={activeGame} 
            currentUser={currentUser}
            onGameOver={handleGameOver}
            />;
        }
        // Fallback to lobby if no active game
        setView('lobby');
        return null;
      case 'lobby':
      default:
        return <Lobby 
          currentUser={currentUser} 
          users={allUsers} 
          games={allGames}
          onStartGame={handleStartGame} 
          onSelectGame={handleSelectGame}
          onRefresh={refreshData}
          />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-700">
        <h1 className="text-4xl font-bold text-cyan-400">Battleship</h1>
        <nav className="flex items-center gap-4">
          <button onClick={() => navigateTo('lobby')} className={`px-4 py-2 rounded-md transition ${view === 'lobby' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-700'}`}>Lobby</button>
          <button onClick={() => navigateTo('stats')} className={`px-4 py-2 rounded-md transition ${view === 'stats' ? 'bg-cyan-600 text-white' : 'hover:bg-slate-700'}`}>Stats</button>
          <div className="text-right">
            <div className="font-semibold">{currentUser.name}</div>
            <div className="text-xs text-slate-400 truncate max-w-[100px]">{currentUser.id}</div>
          </div>
        </nav>
      </header>
      <main>
        {renderContent()}
      </main>
      <footer className="text-center mt-12 text-xs text-slate-500">
        <p>This game is licensed under the GPLv3.</p>
      </footer>
    </div>
  );
};

export default App;
