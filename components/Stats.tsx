
import React from 'react';
import type { MatchRecord, User } from '../types';

interface StatsProps {
  matchHistory: MatchRecord[];
  allUsers: User[];
  currentUserId: string;
}

export const Stats: React.FC<StatsProps> = ({ matchHistory, allUsers, currentUserId }) => {
  const userHistory = matchHistory.filter(r => r.userId === currentUserId);

  if (userHistory.length === 0) {
    return (
        <div className="text-center bg-slate-800 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-cyan-400">Statistics</h2>
            <p className="mt-4 text-slate-300">No match history found. Play a game to see your stats!</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-lg shadow-2xl">
      <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Your Match History</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left">
          <thead className="border-b border-slate-600">
            <tr>
              <th className="p-3 text-sm font-semibold text-slate-300">Opponent</th>
              <th className="p-3 text-sm font-semibold text-slate-300 text-center">Wins</th>
              <th className="p-3 text-sm font-semibold text-slate-300 text-center">Losses</th>
              <th className="p-3 text-sm font-semibold text-slate-300 text-center">W/L Ratio</th>
            </tr>
          </thead>
          <tbody>
            {userHistory.map((record, index) => {
              const opponentNames = record.opponentNames.join(', ');
              const winLossRatio = record.losses > 0 ? (record.wins / record.losses).toFixed(2) : '∞';

              return (
                <tr key={index} className="border-b border-slate-700 last:border-0 hover:bg-slate-700/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold text-lg text-white">{opponentNames}</p>
                    <p className="text-xs text-slate-400">{record.opponentId}</p>
                  </td>
                  <td className="p-4 text-center text-green-400 font-bold text-xl">{record.wins}</td>
                  <td className="p-4 text-center text-red-400 font-bold text-xl">{record.losses}</td>
                  <td className="p-4 text-center font-mono text-cyan-400">{winLossRatio}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
