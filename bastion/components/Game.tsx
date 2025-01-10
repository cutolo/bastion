'use client'
import React, { useState, useEffect } from 'react';
import { GameState, Warrior, Monster, Tile, TileType, Action, WarriorType } from '../types/gameTypes';
import Board from './Board';
import ActionMenu from './ActionMenu';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_LIFE_POINTS = 3;
const TOTAL_MONSTERS = 50;
const ACTIONS_PER_WARRIOR = 2;

const initialTiles: TileType[] = [
  'Quarry', 'Fountain', 'Tower', 'Tavern', 'Trebuchet',
  'Market', 'Dispensary', 'Crypt', 'Armory'
];

const initialWarriors: Warrior[] = [
  { type: 'A', position: [1, 1] },
  { type: 'B', position: [0, 1] },
  { type: 'C', position: [2, 1] },
];

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    warriors: initialWarriors,
    monsters: [],
    tiles: initialTiles.map((type, index) => ({
      type,
      position: [index % 3, Math.floor(index / 3)]
    })),
    lifePoints: INITIAL_LIFE_POINTS,
    turnCount: 0,
    monstersRemaining: TOTAL_MONSTERS,
    traps: [],
    activeEffects: {
      extraMovement: null,
      extraAttack: null,
    },
    warriorActions: {
      A: ACTIONS_PER_WARRIOR,
      B: ACTIONS_PER_WARRIOR,
      C: ACTIONS_PER_WARRIOR,
    },
  });

  const [activeWarrior, setActiveWarrior] = useState<Warrior | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionTarget, setActionTarget] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (gameState.lifePoints <= 0) {
      alert("Game Over! You've run out of life points.");
    } else if (gameState.monstersRemaining <= 0) {
      alert("Congratulations! You've defeated all the monsters!");
    }
  }, [gameState.lifePoints, gameState.monstersRemaining]);

  const getAvailableActions = (warrior: Warrior): Action[] => {
    if (gameState.warriorActions[warrior.type] === 0) return [];
    return ['move', 'attack', 'activate'];
  };

  const handleWarriorSelect = (warrior: Warrior) => {
    setActiveWarrior(warrior);
    setSelectedAction(null);
    setActionTarget(null);
  };

  const handleActionSelect = (action: Action) => {
    setSelectedAction(action);
    setActionTarget(null);
  };

  const handleTileClick = (position: [number, number]) => {
    if (!activeWarrior || !selectedAction) return;

    setActionTarget(position);

    switch (selectedAction) {
      case 'move':
        moveWarrior(activeWarrior, position);
        break;
      case 'attack':
        attackMonster(activeWarrior, position);
        return; // Don't reset state here, it's handled in attackMonster
      case 'activate':
        activateTile(activeWarrior, position);
        break;
    }

    // Decrease action count for the active warrior (except for attack, which is handled separately)
    if (selectedAction !== 'attack') {
      setGameState(prev => ({
        ...prev,
        warriorActions: {
          ...prev.warriorActions,
          [activeWarrior.type]: prev.warriorActions[activeWarrior.type] - 1
        }
      }));
    }

    // Reset after action (except for attack, which is handled separately)
    if (selectedAction !== 'attack') {
      setActiveWarrior(null);
      setSelectedAction(null);
      setActionTarget(null);
    }
  };

  const moveWarrior = (warrior: Warrior, target: [number, number]) => {
    setGameState(prev => ({
      ...prev,
      warriors: prev.warriors.map(w =>
        w.type === warrior.type ? { ...w, position: target } : w
      )
    }));
  };

  const attackMonster = (warrior: Warrior, target: [number, number]) => {
    let damagedMonsters: Monster[] = [];

    switch (warrior.type) {
      case 'A':
        damagedMonsters = gameState.monsters.filter(m => 
          (Math.abs(m.position[0] - warrior.position[0]) + Math.abs(m.position[1] - warrior.position[1]) === 1) &&
          m.position[0] === target[0] && m.position[1] === target[1]
        );
        damagedMonsters.forEach(m => m.hp -= 3);
        break;
      case 'B':
        damagedMonsters = gameState.monsters.filter(m => 
          ((m.position[0] === warrior.position[0] && Math.abs(m.position[1] - warrior.position[1]) > 1) ||
          (m.position[1] === warrior.position[1] && Math.abs(m.position[0] - warrior.position[0]) > 1)) &&
          m.position[0] === target[0] && m.position[1] === target[1]
        );
        damagedMonsters.forEach(m => m.hp -= 2);
        break;
      case 'C':
        damagedMonsters = gameState.monsters.filter(m => 
          m.position[0] === warrior.position[0] || m.position[1] === warrior.position[1]
        );
        damagedMonsters.forEach(m => m.hp -= 1);
        break;
    }

    if (damagedMonsters.length > 0) {
      setGameState(prev => {
        const updatedMonsters = prev.monsters.map(m => {
          const damagedMonster = damagedMonsters.find(dm => dm.id === m.id);
          return damagedMonster ? { ...m, hp: damagedMonster.hp } : m;
        }).filter(m => m.hp > 0);

        return {
          ...prev,
          monsters: updatedMonsters,
          monstersRemaining: prev.monstersRemaining - (prev.monsters.length - updatedMonsters.length),
          warriorActions: {
            ...prev.warriorActions,
            [warrior.type]: prev.warriorActions[warrior.type] - 1
          }
        };
      });
    }

    // Reset after action, regardless of whether the attack was successful
    setActiveWarrior(null);
    setSelectedAction(null);
    setActionTarget(null);
  };

  const getAttackablePositions = (warrior: Warrior): [number, number][] => {
    switch (warrior.type) {
      case 'A':
        return [
          [warrior.position[0] - 1, warrior.position[1]],
          [warrior.position[0] + 1, warrior.position[1]],
          [warrior.position[0], warrior.position[1] - 1],
          [warrior.position[0], warrior.position[1] + 1],
        ];
      case 'B':
        return [
          [0, warrior.position[1]], [1, warrior.position[1]], [2, warrior.position[1]],
          [warrior.position[0], 0], [warrior.position[0], 1], [warrior.position[0], 2]
        ].filter(pos => 
          Math.abs(pos[0] - warrior.position[0]) > 1 || 
          Math.abs(pos[1] - warrior.position[1]) > 1
        );
      case 'C':
        return [
          [0, warrior.position[1]], [1, warrior.position[1]], [2, warrior.position[1]],
          [warrior.position[0], 0], [warrior.position[0], 1], [warrior.position[0], 2]
        ];
      default:
        return [];
    }
  };

  const activateTile = (warrior: Warrior, target: [number, number]) => {
    const tile = gameState.tiles.find(t => 
      t.position[0] === target[0] && t.position[1] === target[1]
    );

    if (!tile) return;

    switch (tile.type) {
      case 'Quarry':
        setGameState(prev => ({
          ...prev,
          traps: [...prev.traps, target]
        }));
        break;
      case 'Fountain':
        setGameState(prev => ({
          ...prev,
          monsters: prev.monsters.map(m => ({ ...m, debuff: undefined }))
        }));
        break;
      case 'Tower':
        // Handled in UI - allows teleporting another warrior
        break;
      case 'Tavern':
        setGameState(prev => ({
          ...prev,
          activeEffects: { ...prev.activeEffects, extraMovement: warrior.type }
        }));
        break;
      case 'Trebuchet':
        // Handled in UI - allows targeting a monster
        break;
      case 'Market':
        setGameState(prev => ({
          ...prev,
          activeEffects: { ...prev.activeEffects, extraAttack: warrior.type }
        }));
        break;
      case 'Dispensary':
        setGameState(prev => ({
          ...prev,
          lifePoints: Math.min(prev.lifePoints + 1, INITIAL_LIFE_POINTS)
        }));
        break;
      case 'Crypt':
        // Handled in UI - allows removing a monster
        break;
      case 'Armory':
        // Handled in UI - allows reducing a monster's HP
        break;
    }
  };

  const spawnMonsters = () => {
    const newMonsters: Monster[] = [];
    const edgeTiles = [
      [0, 0], [1, 0], [2, 0],
      [0, 2], [1, 2], [2, 2],
      [0, 1], [2, 1]
    ];

    const spawnCount = Math.floor(Math.random() * 2) + 1; // Spawn 1-2 monsters

    for (let i = 0; i < spawnCount; i++) {
      const availableEdges = edgeTiles.filter(tile => 
        !gameState.monsters.some(m => m.position[0] === tile[0] && m.position[1] === tile[1]) &&
        !newMonsters.some(m => m.position[0] === tile[0] && m.position[1] === tile[1])
      );

      if (availableEdges.length === 0) {
        setGameState(prev => ({ ...prev, lifePoints: prev.lifePoints - 1 }));
        break;
      }

      const randomEdge = availableEdges[Math.floor(Math.random() * availableEdges.length)];
      const newMonster: Monster = {
        id: uuidv4(),
        hp: Math.floor(Math.random() * 4) + 3, // 3 to 6 HP
        position: randomEdge as [number, number],
      };

      if (gameState.traps.some(trap => trap[0] === randomEdge[0] && trap[1] === randomEdge[1])) {
        // Monster is killed by trap
        setGameState(prev => ({
          ...prev,
          traps: prev.traps.filter(trap => trap[0] !== randomEdge[0] || trap[1] !== randomEdge[1]),
          monstersRemaining: Math.max(0, prev.monstersRemaining - 1)
        }));
      } else {
        newMonsters.push(newMonster);
      }
    }

    setGameState(prev => ({
      ...prev,
      monsters: [...prev.monsters, ...newMonsters],
      monstersRemaining: Math.max(0, prev.monstersRemaining - newMonsters.length),
    }));
  };

  const endTurn = () => {
    spawnMonsters();
    setGameState(prev => ({
      ...prev,
      turnCount: prev.turnCount + 1,
      warriorActions: {
        A: ACTIONS_PER_WARRIOR,
        B: ACTIONS_PER_WARRIOR,
        C: ACTIONS_PER_WARRIOR,
      },
    }));
  };

  return (
    <div className="game-container p-4">
      <h1 className="text-2xl font-bold mb-4">Bastion Defense</h1>
      <div className="game-info mb-4 flex justify-between w-full max-w-md">
        <p>Life: {gameState.lifePoints}</p>
        <p>Turn: {gameState.turnCount}</p>
        <p>Monsters: {gameState.monstersRemaining}</p>
      </div>
      <div className="flex space-x-4">
        <Board
          warriors={gameState.warriors}
          monsters={gameState.monsters}
          tiles={gameState.tiles}
          traps={gameState.traps}
          onWarriorSelect={handleWarriorSelect}
          onTileClick={handleTileClick}
          activeWarrior={activeWarrior}
          selectedAction={selectedAction}
          warriorActions={gameState.warriorActions}
          attackablePositions={activeWarrior && selectedAction === 'attack' ? getAttackablePositions(activeWarrior) : []}
        />
        <div className="flex flex-col space-y-4">
          <ActionMenu
            availableActions={activeWarrior ? getAvailableActions(activeWarrior) : []}
            onAction={handleActionSelect}
            disabled={!activeWarrior}
          />
          <div className="warrior-actions">
            {Object.entries(gameState.warriorActions).map(([warrior, actions]) => (
              <p key={warrior}>Warrior {warrior}: {actions} actions left</p>
            ))}
          </div>
        </div>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={endTurn}
      >
        End Turn
      </button>
    </div>
  );
}

