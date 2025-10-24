
import type { User, GameState, MatchRecord } from '../types';

const USERS_KEY = 'battleship_users';
const CURRENT_USER_ID_KEY = 'battleship_current_user_id';
const GAMES_KEY = 'battleship_games';
const MATCH_HISTORY_KEY = 'battleship_match_history';

// --- User Management ---

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getStoredUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
  if (!currentUserId) return null;
  const users = getStoredUsers();
  return users.find(u => u.id === currentUserId) || null;
};

export const saveCurrentUser = (username: string): User => {
  let currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
  const users = getStoredUsers();
  let currentUser = users.find(u => u.id === currentUserId);

  if (currentUser) {
    currentUser.name = username;
  } else {
    const existingUserByName = users.find(u => u.name === username);
    if(existingUserByName) {
        currentUser = existingUserByName;
    } else {
        currentUser = { id: generateUUID(), name: username };
        users.push(currentUser);
    }
  }
  
  localStorage.setItem(CURRENT_USER_ID_KEY, currentUser.id);
  saveUsers(users);
  return currentUser;
};

// --- Game Management ---

export const getStoredGames = (): GameState[] => {
  const gamesJson = localStorage.getItem(GAMES_KEY);
  return gamesJson ? JSON.parse(gamesJson) : [];
};

export const saveGames = (games: GameState[]) => {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
};

export const saveGame = (game: GameState) => {
  const games = getStoredGames();
  const gameIndex = games.findIndex(g => g.id === game.id);
  if (gameIndex > -1) {
    games[gameIndex] = game;
  } else {
    games.push(game);
  }
  saveGames(games);
};

export const removeGame = (gameId: string) => {
    let games = getStoredGames();
    games = games.filter(g => g.id !== gameId);
    saveGames(games);
};


// --- Match History ---

export const getMatchHistory = (): MatchRecord[] => {
    const historyJson = localStorage.getItem(MATCH_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
};

export const saveMatchHistory = (history: MatchRecord[]) => {
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));
};
