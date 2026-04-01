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
}

interface ITerminalGameState {
  step: TerminalStep;
  hackedSectors: number;
  isTyping: boolean;
  loadingPercent: number | null;
  loadingLabel: string;
  isGameOver: boolean;
  
  setStep: (step: TerminalStep) => void;
  setHackedSectors: (sectors: number) => void;
  setIsTyping: (isTyping: boolean) => void;
  setLoading: (percent: number | null, label?: string) => void;
  setIsGameOver: (over: boolean) => void;
  resetTerminalGame: () => void;
}

export const useTerminalGameStore = create<ITerminalGameState>((set) => ({
  step: TerminalStep.BOOT,
  hackedSectors: 0,
  isTyping: false,
  loadingPercent: null,
  loadingLabel: 'LOADING...',
  isGameOver: false,
  
  setStep: (step) => set({ step }),
  setHackedSectors: (hackedSectors) => set({ hackedSectors }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setLoading: (percent, label = 'LOADING...') => set({ loadingPercent: percent, loadingLabel: label }),
  setIsGameOver: (over) => set({ isGameOver: over }),
  resetTerminalGame: () => set({ 
    step: TerminalStep.BOOT, 
    hackedSectors: 0, 
    isTyping: false, 
    loadingPercent: null,
    isGameOver: false
  }),
}));
