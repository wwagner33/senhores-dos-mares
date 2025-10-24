
import React from 'react';
import { SHIP_DEFINITIONS } from '../constants';
import { CarrierIcon, BattleshipIcon, CruiserIcon, SubmarineIcon, DestroyerIcon } from './icons/ShipIcons';
import type { ShipType } from '../types';

interface HelpModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const shipData = [
    { type: 'carrier' as ShipType, icon: CarrierIcon },
    { type: 'battleship' as ShipType, icon: BattleshipIcon },
    { type: 'cruiser' as ShipType, icon: CruiserIcon },
    { type: 'submarine' as ShipType, icon: SubmarineIcon },
    { type: 'destroyer' as ShipType, icon: DestroyerIcon },
]

export const HelpModal: React.FC<HelpModalProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 text-slate-200 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-cyan-400">How to Play Battleship</h2>
            <button onClick={onClose} className="text-3xl text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6 space-y-6">
            <section>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-3">Objective</h3>
                <p>The objective of Battleship is to sink all of your opponent's ships before they sink all of yours. The game is played on a grid, and each player's fleet is hidden from their opponent.</p>
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-3">Game Setup</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>From the lobby, challenge another "online" player.</li>
                    <li>Choose your game options (number of ships).</li>
                    <li>You will be taken to the setup screen. You have 10 minutes to place your fleet on your grid.</li>
                    <li>Select a ship from the list, use the "Rotate" button to change its orientation, and click on the grid to place it.</li>
                    <li>Ships cannot overlap or be placed outside the grid.</li>
                    <li>If you don't place all ships within the time limit, the remaining ships will be placed for you automatically.</li>
                    <li>Once all your ships are placed, click "Confirm Placement" to ready up. The battle begins when both players are ready.</li>
                </ol>
            </section>
            
            <section>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-3">Gameplay</h3>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>A coin toss decides who goes first.</li>
                    <li>On your turn, click a cell on the "Enemy Waters" grid to fire a shot.</li>
                    <li>A <span className="text-yellow-400 font-bold">'Hit'</span> is marked by a 🔥 icon if you hit an opponent's ship.</li>
                    <li>A <span className="text-slate-400 font-bold">'Miss'</span> is marked by a small dot.</li>
                    <li>When all positions of a ship have been hit, it is <span className="text-red-500 font-bold">'Sunk'</span> and marked with a 💀 icon.</li>
                    <li>After your shot, your turn ends, and your opponent fires.</li>
                    <li>The first player to sink all of the opponent's ships wins the game.</li>
                </ol>
            </section>

            <section>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-3">The Fleet</h3>
                <p className="mb-4">The standard game uses a fleet of 5 ships. You can also choose to play with 3 or 7.</p>
                <div className="space-y-3">
                    {shipData.map(({type, icon: Icon}) => (
                        <div key={type} className="flex items-center gap-4 p-3 bg-slate-700 rounded-md">
                            <Icon className="w-20 h-auto fill-slate-300 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-lg">{SHIP_DEFINITIONS[type].name}</h4>
                                <p className="text-sm text-slate-400">Length: {SHIP_DEFINITIONS[type].size} squares</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
             <section>
                <h3 className="text-2xl font-semibold text-cyan-300 mb-3">Persistence</h3>
                <p>Game progress is saved automatically after every move. If you close the browser or lose connection, you can resume your game from the lobby as long as you are using the same browser.</p>
            </section>
        </div>
        <div className="sticky bottom-0 bg-slate-800 p-4 border-t border-slate-700 text-right">
             <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-md">Close</button>
        </div>
      </div>
    </div>
  );
};
