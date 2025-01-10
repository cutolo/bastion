'use client'
import React from 'react';
import { Tile, Warrior, Monster, TileType } from '../types/gameTypes';
import Tooltip from './Tooltip';

interface WarriorType {
  A: number;
  B: number;
  C: number;
}

interface TileProps {
  tile: Tile;
  warriors: Warrior[];
  monster?: Monster;
  trap: boolean;
  onWarriorSelect: (warrior: Warrior) => void;
  onTileClick: () => void;
  isActive: boolean;
  isSelectable: boolean;
  warriorActions: {
    [key in keyof WarriorType]: number;
  };
  selectedAction: string | null;
  isAttackable: boolean;
}

const tileDescriptions: Record<TileType, string> = {
  Quarry: "Place a trap on a selected tile",
  Fountain: "Remove debuffs from all monsters",
  Tower: "Teleport another warrior to a selected tile",
  Tavern: "Give the selected warrior an extra movement",
  Trebuchet: "Target a monster to apply a debuff",
  Market: "Give the selected warrior extra attack power",
  Dispensary: "Increase life points by 1",
  Crypt: "Remove a selected monster from the board",
  Armory: "Reduce a selected monster's HP by 1 or 2"
};

export default function TileComponent({ tile, warriors, monster, trap, onWarriorSelect, onTileClick, isActive, isSelectable, warriorActions, selectedAction, isAttackable }: TileProps) {
  const handleClick = () => {
    if (warriors.length > 0 && !isSelectable) {
      onWarriorSelect(warriors[0]);
    } else if (isSelectable) {
      onTileClick();
    }
  };

  const isWarriorBRange = warriors.some(w => w.type === 'B') && 
    (Math.abs(tile.position[0] - warriors[0].position[0]) > 1 || 
     Math.abs(tile.position[1] - warriors[0].position[1]) > 1);

  const tileContent = (
    <>
      <div className="text-xs text-center mb-2">{tile.type}</div>
      {warriors.map((warrior, index) => (
        <div 
          key={warrior.type}
          className={`warrior w-8 h-8 rounded-full flex items-center justify-center text-white font-bold absolute`}
          style={{
            backgroundColor: warrior.type === 'A' ? 'rgb(239, 68, 68)' : warrior.type === 'B' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
            top: `${5 + index * 10}px`,
            left: `${5 + index * 10}px`,
            zIndex: index + 1
          }}
        >
          {warrior.type}
          <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-black">
            {warriorActions[warrior.type as keyof WarriorType]}
          </span>
        </div>
      ))}
      {monster && (
        <div className={`monster w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold absolute bottom-2 right-2 ${isAttackable ? 'bg-red-500' : 'bg-purple-500'}`}>
          {monster.hp}
        </div>
      )}
      {trap && (
        <div className="trap absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full"></div>
      )}
    </>
  );

  return (
    <div 
      className={`tile aspect-square flex flex-col items-center justify-center p-2 border-2 
        ${isActive ? 'border-yellow-400' : 'border-gray-300'}
        ${isSelectable ? 'bg-blue-200 cursor-pointer' : ''}
        ${isAttackable ? 'bg-red-200' : ''}
        ${isWarriorBRange ? 'bg-green-100' : ''}
        rounded-lg hover:bg-gray-100 transition-colors relative`}
      onClick={handleClick}
    >
      {selectedAction === 'activate' ? (
        <Tooltip content={tileDescriptions[tile.type]}>
          {tileContent}
        </Tooltip>
      ) : (
        tileContent
      )}
    </div>
  );
}

