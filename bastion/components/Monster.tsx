import React from 'react';
import { Monster } from '../types/gameTypes';

interface MonsterProps {
  monster: Monster;
}

export default function MonsterComponent({ monster }: MonsterProps) {
  return (
    <div className="monster">
      HP: {monster.hp}
      {monster.debuff && <span className="debuff">{monster.debuff}</span>}
    </div>
  );
}

