import { create } from 'zustand';

export enum TerminalStep {
  BOOT = 'BOOT',
  CONNECT_LIST = 'CONNECT_LIST',
  CONNECT_LUMINA = 'CONNECT_LUMINA',
  HACK_LUMINA = 'HACK_LUMINA',
  CONNECT_KAELEN = 'CONNECT_KAELEN',
  HACK_KAELEN = 'HACK_KAELEN',
  CONNECT_VORTEX = 'CONNECT_VORTEX',
  HACK_VORTEX = 'HACK_VORTEX',
  CONNECT_CIPHER = 'CONNECT_CIPHER',
  HACK_CIPHER = 'HACK_CIPHER',
  CONNECT_AURA = 'CONNECT_AURA',
  HACK_AURA = 'HACK_AURA',
  READY_AVALON = 'READY_AVALON',
  AVALON_PART_1 = 'AVALON_PART_1',
  AVALON_PART_2 = 'AVALON_PART_2',
  LUMINA = 'LUMINA',
  KAELEN = 'KAELEN',
  VORTEX = 'VORTEX',
  CIPHER = 'CIPHER',
  AURA = 'AURA',
  AVALON_SEQUENCE = 'AVALON_SEQUENCE',
}

export type TaskType = 'WIRES' | 'LEVERS' | 'SORT' | 'GRID' | 'SIGNAL' | 'PULSE' | null;

interface ITerminalGameState {
  step: TerminalStep;
  hackedSectors: number;
  isTyping: boolean;
  loadingPercent: number | null;
  loadingLabel: string;
  isGameOver: boolean;

  /** Active mini-task overlay during loading */
  activeTask: TaskType;
  /** Callback to resume loading after task completion */
  onTaskComplete: (() => void) | null;
  
  setStep: (step: TerminalStep) => void;
  setHackedSectors: (sectors: number) => void;
  setIsTyping: (isTyping: boolean) => void;
  setLoading: (percent: number | null, label?: string) => void;
  setIsGameOver: (over: boolean) => void;
  setActiveTask: (task: TaskType, onComplete?: () => void) => void;
  completeTask: () => void;
  resetTerminalGame: () => void;
  addLine: (line: any) => void;
  clearLines: () => void;
}

export const useTerminalGameStore = create<ITerminalGameState>((set, get) => ({
  step: TerminalStep.BOOT,
  hackedSectors: 0,
  isTyping: false,
  loadingPercent: null,
  loadingLabel: 'LOADING...',
  isGameOver: false,
  activeTask: null,
  onTaskComplete: null,
  
  setStep: (step) => set({ step }),
  setHackedSectors: (hackedSectors) => set({ hackedSectors }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setLoading: (percent, label = 'LOADING...') => set({ loadingPercent: percent, loadingLabel: label }),
  setIsGameOver: (over) => set({ isGameOver: over }),
  setActiveTask: (task, onComplete) => set({ activeTask: task, onTaskComplete: onComplete ?? null }),
  completeTask: () => {
    const { onTaskComplete } = get();
    set({ activeTask: null, onTaskComplete: null });
    onTaskComplete?.();
  },
  resetTerminalGame: () => set({ 
    step: TerminalStep.BOOT, 
    hackedSectors: 0, 
    isTyping: false, 
    loadingPercent: null,
    isGameOver: false,
    activeTask: null,
    onTaskComplete: null,
  }),
  addLine: (line) => {
    // This is a bridge to the global terminal history if needed, 
    // but typically useTerminalCommands should call useGameStore directly.
    // However, for compatibility with existing calls:
  },
  clearLines: () => {
    // Same as above
  },
}));
