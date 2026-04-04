import { create } from 'zustand';
import { audioManager } from '@/core/audio';

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
  bossHp: 100,
  bossMaxHp: 100,
  bossAttacks: [],
  bossVulnerable: false,
  vulnTimer: 0,
  attackIdCounter: 0,
  totalKills: 0,

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
    // When sector takes damage from an attack reaching it, that enemy is "resolved"
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
    const toRemove: number[] = [];

    for (const atk of state.attacks) {
      const newProgress = atk.progress + atk.speed * dt;
      if (newProgress >= 1) {
        // Attack reached sector
        toRemove.push(atk.id);
        audioManager.damage();
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

  resetDefense: () => set({
    phase: 'intro',
    wave: 0,
    score: 0,
    enemiesTotal: 0,
    enemiesKilled: 0,
    prepCountdown: 3,
    sectors: INITIAL_SECTORS.map(s => ({ ...s })),
    attacks: [],
    bossHp: 100,
    bossMaxHp: 100,
    bossAttacks: [],
    bossVulnerable: false,
    vulnTimer: 0,
    attackIdCounter: 0,
    totalKills: 0,
  }),
}));
