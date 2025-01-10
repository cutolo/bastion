export type WarriorType = 'A' | 'B' | 'C';

export interface Warrior {
  type: WarriorType;
  position: [number, number];
}

export interface Monster {
  id: string;
  hp: number;
  position: [number, number];
  debuff?: string;
}

export type TileType = 'Quarry' | 'Fountain' | 'Tower' | 'Tavern' | 'Trebuchet' | 'Market' | 'Dispensary' | 'Crypt' | 'Armory';

export interface Tile {
  type: TileType;
  position: [number, number];
}

export interface GameState {
  warriors: Warrior[];
  monsters: Monster[];
  tiles: Tile[];
  lifePoints: number;
  turnCount: number;
  monstersRemaining: number;
  bossSpawned: boolean;
  traps: [number, number][];
  activeEffects: {
    doubleAttack: boolean;
    removedMalus: boolean;
  };
  warriorActions: {
    [key in WarriorType]: number;
  };
}

export type Action = 'move' | 'attack' | 'activate';

