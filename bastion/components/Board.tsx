'use client'
import React from 'react';
import { Warrior, Monster, Tile, Action, WarriorType } from '../types/gameTypes';
import TileComponent from './Tile';

interface BoardProps {
  warriors: Warrior[];
  monsters: Monster[];
  tiles: Tile[];
  traps: [number, number][];
  onWarriorSelect: (warrior: Warrior) => void;
  onTileClick: (position: [number, number]) => void;
  activeWarrior: Warrior | null;
  selectedAction: Action | null;
  warriorActions: {
    [key in WarriorType]: number;
  };
  attackablePositions: [number, number][];
}

export default function Board({ warriors, monsters, tiles, traps, onWarriorSelect, onTileClick, activeWarrior, selectedAction, warriorActions, attackablePositions }: BoardProps) {
  return (
    <div className="board grid grid-cols-3 gap-2 w-full max-w-md">
      {tiles.map((tile, index) => (
        <TileComponent
          key={index}
          tile={tile}
          warriors={warriors.filter(w => w.position[0] === tile.position[0] && w.position[1] === tile.position[1])}
          monster={monsters.find(m => m.position[0] === tile.position[0] && m.position[1] === tile.position[1])}
          trap={traps.some(t => t[0] === tile.position[0] && t[1] === tile.position[1])}
          onWarriorSelect={onWarriorSelect}
          onTileClick={() => onTileClick(tile.position)}
          isActive={activeWarrior?.position[0] === tile.position[0] && activeWarrior?.position[1] === tile.position[1]}
          isSelectable={!!activeWarrior && !!selectedAction}
          warriorActions={warriorActions}
          selectedAction={selectedAction}
          isAttackable={attackablePositions.some(pos => pos[0] === tile.position[0] && pos[1] === tile.position[1])}
        />
      ))}
    </div>
  );
}

