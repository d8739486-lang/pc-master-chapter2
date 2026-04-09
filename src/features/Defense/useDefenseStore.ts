import { create } from 'zustand';
import { audioManager } from '@/core/audio';

// ─── Enemy Types ───────────────────────────────────────────────
export type EnemyType = 'DRONE' | 'SHIELD' | 'STEALTH' | 'SPLITTER' | 'MINI';

// ─── Weapon Types ──────────────────────────────────────────────
export type WeaponType = 'PISTOL' | 'SHOTGUN' | 'SNIPER' | 'MINIGUN';

/** Weapon effectiveness matrix: weapon → enemy → multiplier */
export const WEAPON_EFFECTIVENESS: Record<WeaponType, Record<EnemyType, number>> = {
  PISTOL:   { DRONE: 2,   SHIELD: 0.05, STEALTH: 0.05, SPLITTER: 0.05, MINI: 1.5 },
  SHOTGUN:  { DRONE: 0.1, SHIELD: 3,    STEALTH: 0.1,  SPLITTER: 0.1,  MINI: 0.1 },
  SNIPER:   { DRONE: 0.1, SHIELD: 0.1,  STEALTH: 3,    SPLITTER: 0.1,  MINI: 0.1 },
  MINIGUN:  { DRONE: 0.1, SHIELD: 0.1,  STEALTH: 0.1,  SPLITTER: 3,    MINI: 2   },
};

/** Weapon shop config */
export interface IWeaponConfig {
  type: WeaponType;
  cost: number;
  icon: string;
}

export const WEAPON_SHOP: IWeaponConfig[] = [
  { type: 'SHOTGUN', cost: 50,  icon: '💥' },
  { type: 'SNIPER',  cost: 75,  icon: '🔭' },
  { type: 'MINIGUN', cost: 100, icon: '🔥' },
];

/** Points awarded per enemy type kill */
export const KILL_POINTS: Record<EnemyType, number> = {
  DRONE: 10,
  SHIELD: 20,
  STEALTH: 25,
  SPLITTER: 30,
  MINI: 5,
};

// ─── Interfaces ────────────────────────────────────────────────

export interface ISector {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  active: boolean;
}

export interface IAttack {
  id: number;
  x: number;
  y: number;
  targetSectorId: number;
  speed: number;
  size: number;
  /** 0-1 progress toward its target sector */
  progress: number;
  /** Enemy type for visual/mechanic differentiation */
  type: EnemyType;
  /** Shield HP (only for SHIELD type, starts at 1) */
  shieldHp: number;
  /** Fractional HP for weak-weapon hits */
  hp: number;
}

export interface IBossAttack {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

type DefensePhase = 'intro' | 'prep' | 'combat' | 'wave_clear' | 'boss_intro' | 'boss' | 'boss_vulnerable' | 'victory' | 'defeat';

interface IDefenseState {
  phase: DefensePhase;
  wave: number;
  score: number;
  enemiesTotal: number;
  enemiesKilled: number;
  prepCountdown: number;
  sectors: ISector[];
  attacks: IAttack[];
  bossHp: number;
  bossMaxHp: number;
  bossAttacks: IBossAttack[];
  bossVulnerable: boolean;
  vulnTimer: number;
  attackIdCounter: number;
  totalKills: number;

  /** Weapon inventory: 4 slots, null = empty */
  inventory: (WeaponType | null)[];
  /** Currently active inventory slot (0-3) */
  activeSlot: number;
  /** Whether shop overlay is visible */
  showShop: boolean;

  setPhase: (phase: DefensePhase) => void;
  setWave: (wave: number) => void;
  setEnemiesTotal: (n: number) => void;
  setEnemiesKilled: (n: number) => void;
  setPrepCountdown: (n: number) => void;
  addScore: (pts: number) => void;
  setSectors: (sectors: ISector[]) => void;
  damageSector: (sectorId: number, dmg: number) => void;
  spawnAttack: (attack: Omit<IAttack, 'id'>) => void;
  removeAttack: (id: number) => void;
  advanceAttacks: (dt: number) => void;
  setBossHp: (hp: number) => void;
  damageBoss: (dmg: number) => void;
  setBossVulnerable: (v: boolean) => void;
  setVulnTimer: (t: number) => void;
  spawnBossAttack: (a: Omit<IBossAttack, 'id'>) => void;
  removeBossAttack: (id: number) => void;
  advanceBossAttacks: () => void;
  clearAllAttacks: () => void;
  addKill: () => void;
  resetDefense: () => void;

  /** Inventory actions */
  setActiveSlot: (slot: number) => void;
  buyWeapon: (weaponType: WeaponType, cost: number) => boolean;
  setShowShop: (v: boolean) => void;
  /** Get the currently equipped weapon type */
  getActiveWeapon: () => WeaponType;
}

const INITIAL_SECTORS: ISector[] = [
  { id: 1, name: 'ALPHA', hp: 100, maxHp: 100, active: false },
];

/** Which sectors are active on each wave */
export const WAVE_SECTOR_MAP: Record<number, number[]> = {
  1: [1],
  2: [1],
  3: [1],
  4: [1],
  5: [1],
};

/** Enemy type distribution per wave */
export const WAVE_ENEMY_TYPES: Record<number, EnemyType[]> = {
  1: ['DRONE'],
  2: ['DRONE', 'DRONE', 'SHIELD'],
  3: ['DRONE', 'SHIELD', 'STEALTH'],
  4: ['DRONE', 'SHIELD', 'STEALTH', 'SPLITTER'],
  5: ['DRONE', 'SHIELD', 'STEALTH', 'SPLITTER', 'SPLITTER'],
};

/** Wave config: spawnInterval (ms), attackCount, attackSpeed, combatDuration (s) */
export const WAVE_CONFIG: Record<number, { spawnInterval: number; attackCount: number; speed: number; combatDuration: number }> = {
  1:  { spawnInterval: 2500, attackCount: 5,  speed: 0.003, combatDuration: 20 },
  2:  { spawnInterval: 2000, attackCount: 10, speed: 0.0035, combatDuration: 25 },
  3:  { spawnInterval: 1800, attackCount: 15, speed: 0.004, combatDuration: 30 },
  4:  { spawnInterval: 1400, attackCount: 22, speed: 0.005, combatDuration: 35 },
  5:  { spawnInterval: 1000,  attackCount: 10, speed: 0.006, combatDuration: 45 },
};

export const useDefenseStore = create<IDefenseState>((set, get) => ({
  phase: 'intro',
  wave: 0,
  score: 0,
  enemiesTotal: 0,
  enemiesKilled: 0,
  prepCountdown: 3,
  sectors: INITIAL_SECTORS.map(s => ({ ...s })),
  attacks: [],
  bossHp: 40,
  bossMaxHp: 40,
  bossAttacks: [],
  bossVulnerable: false,
  vulnTimer: 0,
  attackIdCounter: 0,
  totalKills: 0,

  inventory: ['PISTOL', null, null, null],
  activeSlot: 0,
  showShop: false,

  setPhase: (phase) => set({ phase }),
  setWave: (wave) => set({ wave }),
  setEnemiesTotal: (enemiesTotal) => set({ enemiesTotal }),
  setEnemiesKilled: (enemiesKilled) => set({ enemiesKilled }),
  setPrepCountdown: (prepCountdown) => set({ prepCountdown }),
  addScore: (pts) => set(s => ({ score: s.score + pts })),
  setSectors: (sectors) => set({ sectors }),

  damageSector: (sectorId, dmg) => set(s => {
    const sectors = s.sectors.map(sec =>
      sec.id === sectorId ? { ...sec, hp: Math.max(0, sec.hp - dmg) } : sec
    );
    const anyDead = sectors.some(sec => sec.active && sec.hp <= 0);
    const isCombat = s.phase === 'combat';
    return { 
      sectors, 
      phase: anyDead ? 'defeat' : s.phase,
      enemiesKilled: isCombat ? s.enemiesKilled + 1 : s.enemiesKilled
    };
  }),

  spawnAttack: (attack) => set(s => ({
    attacks: [...s.attacks, { ...attack, id: s.attackIdCounter }],
    attackIdCounter: s.attackIdCounter + 1,
  })),

  removeAttack: (id) => set(s => ({
    attacks: s.attacks.filter(a => a.id !== id),
    enemiesKilled: s.phase === 'combat' ? s.enemiesKilled + 1 : s.enemiesKilled
  })),

  advanceAttacks: (dt) => {
    const state = get();
    const updated: IAttack[] = [];

    for (const atk of state.attacks) {
      const newProgress = atk.progress + atk.speed * dt;
      if (newProgress >= 1) {
        // Attack reached sector
        audioManager.defDamage();
        state.damageSector(atk.targetSectorId, 12);
      } else {
        updated.push({ ...atk, progress: newProgress });
      }
    }
    set({ attacks: updated });
  },

  setBossHp: (bossHp) => set({ bossHp }),
  damageBoss: (dmg) => set(s => ({ bossHp: Math.max(0, s.bossHp - dmg) })),
  setBossVulnerable: (bossVulnerable) => set({ bossVulnerable }),
  setVulnTimer: (vulnTimer) => set({ vulnTimer }),

  spawnBossAttack: (a) => set(s => ({
    bossAttacks: [...s.bossAttacks, { ...a, id: s.attackIdCounter }],
    attackIdCounter: s.attackIdCounter + 1,
  })),

  removeBossAttack: (id) => set(s => ({
    bossAttacks: s.bossAttacks.filter(a => a.id !== id),
  })),

  advanceBossAttacks: () => set(s => ({
    bossAttacks: s.bossAttacks.map(a => ({
      ...a,
      x: a.x + a.vx,
      y: a.y + a.vy,
    })).filter(a => a.x > -50 && a.x < window.innerWidth + 50 && a.y > -50 && a.y < window.innerHeight + 50),
  })),

  clearAllAttacks: () => set({ attacks: [], bossAttacks: [] }),
  addKill: () => set(s => ({ totalKills: s.totalKills + 1 })),

  // ─── Inventory ──────────────────────────────────────────
  setActiveSlot: (slot) => {
    const inv = get().inventory;
    if (slot >= 0 && slot < 4 && inv[slot] !== null) {
      set({ activeSlot: slot });
    }
  },

  buyWeapon: (weaponType, cost) => {
    const state = get();
    if (state.score < cost) return false;

    // Check if already owned
    if (state.inventory.includes(weaponType)) return false;

    // Find first empty slot
    const emptyIdx = state.inventory.indexOf(null);
    if (emptyIdx === -1) return false;

    const newInventory = [...state.inventory];
    newInventory[emptyIdx] = weaponType;
    set({ 
      inventory: newInventory, 
      score: state.score - cost 
    });
    return true;
  },

  setShowShop: (showShop) => set({ showShop }),

  getActiveWeapon: () => {
    const state = get();
    return state.inventory[state.activeSlot] ?? 'PISTOL';
  },

  resetDefense: () => set({
    phase: 'intro',
    wave: 0,
    score: 0,
    enemiesTotal: 0,
    enemiesKilled: 0,
    prepCountdown: 3,
    sectors: INITIAL_SECTORS.map(s => ({ ...s })),
    attacks: [],
    bossHp: 40,
    bossMaxHp: 40,
    bossAttacks: [],
    bossVulnerable: false,
    vulnTimer: 0,
    attackIdCounter: 0,
    totalKills: 0,
    inventory: ['PISTOL', null, null, null],
    activeSlot: 0,
    showShop: false,
  }),
}));
