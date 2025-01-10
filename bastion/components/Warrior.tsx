import React from 'react';
import { Warrior } from '../types/gameTypes';

interface WarriorProps {
  warrior: Warrior;
  isActive: boolean;
}

export default function WarriorComponent({ warrior, isActive }: WarriorProps) {
  return (
    <div className={`warrior warrior-${warrior.type} ${isActive ? 'active' : ''}`}>
      {warrior.type}
    </div>
  );
}

