import { create } from 'zustand';
import { useChatStore } from './useChatStore';
export { useChatStore };

export enum Screen {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  PRELOADER = 'PRELOADER',
  INTRO = 'INTRO',
  START = 'START',
  STORY_INTRO = 'STORY_INTRO',
  GAME = 'GAME',
  POST_HACK_SEQUENCE = 'POST_HACK_SEQUENCE',
  DEFENSE_GAME = 'DEFENSE_GAME',
  VICTORY_CHAT = 'VICTORY_CHAT',
  TRANSITION_TEXT = 'TRANSITION_TEXT',
  ENDING = 'ENDING',
}

export interface ITerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
}

export interface IArchive {
  id: string;
  name: string;
  content: string;
  isLocked: boolean;
  type: 'text' | 'image' | 'video' | 'chat';
}

/** Friend chat dialogue scripts */
export interface IFriendChatLine {
  author: 'hero' | 'friend';
  text: string;
  typingTime: number;
}

export const FRIEND_CHAT_SCRIPTS: Record<string, Record<number, IFriendChatLine[]>> = {
  ru: {
    1: [
      { author: 'hero', text: 'Я внутри. Сервер "Digital Dreams" под моим контролем.', typingTime: 1800 },
      { author: 'friend', text: 'Отлично. Но главный архив защищён 5-ю периметрами безопасности.', typingTime: 2200 },
      { author: 'friend', text: 'Они построены на технологиях 5-ти гениев, у которых DD украли код. Нам нужно вернуть их настоящим владельцам.', typingTime: 3000 },
      { author: 'friend', text: 'Они помогут нам обойти защиту. Все команды и подсказки будут появляться прямо в консольном окне.', typingTime: 2800 },
      { author: 'friend', text: 'Для начала вызови список зашифрованных каналов связи: [connect list]', typingTime: 2500 },
      { author: 'hero', text: 'Понял. Приступаю.', typingTime: 1500 },
    ],
  },
  en: {
    1: [
      { author: 'hero', text: 'I am in. Digital Dreams server is under my control.', typingTime: 1800 },
      { author: 'friend', text: 'Great. But the main archive is protected by 5 security perimeters.', typingTime: 2200 },
      { author: 'friend', text: 'They are built on the technologies of 5 geniuses from whom DD stole the code. We need to return them to their true owners.', typingTime: 3000 },
      { author: 'friend', text: 'They will help us bypass the protection. All commands and tips will appear right in the console window.', typingTime: 2800 },
      { author: 'friend', text: 'First, call up the encrypted list of communication channels: [connect list]', typingTime: 2500 },
      { author: 'hero', text: 'Got it. Proceeding.', typingTime: 1500 },
    ],
  }
};

interface GameState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  
  /** Terminal State */
  terminalHistory: ITerminalLine[];
  currentPath: string;
  addTerminalLine: (line: ITerminalLine) => void;
  clearTerminal: () => void;
  
  /** Narrative State */
  evolution: number;
  archives: IArchive[];
  unlockArchive: (id: string) => void;
  
  /** Volume settings (0..1) */
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  setMasterVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
 
  /** Friend chat overlay state */
  friendChatOpen: boolean;
  friendChatEvolution: number;
  openFriendChat: (evolution: number) => void;
  closeFriendChat: () => void;
  doEvolve: () => void;

  language: 'en' | 'ru' | null;
  setLanguage: (lang: 'en' | 'ru') => void;
  isRestarting: boolean;
  setIsRestarting: (v: boolean) => void;
  hasCompleted: boolean;
  setHasCompleted: (v: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  screen: Screen.LANGUAGE_SELECT,
  setScreen: (screen) => set({ screen }),
  
  terminalHistory: [],
  currentPath: '~',
  addTerminalLine: (line) => set({ 
    terminalHistory: [line] 
  }),
  clearTerminal: () => set((state) => ({ 
    terminalHistory: [
      { 
        type: 'system', 
        content: `═══════════════════════════════════════════════════════════════════════════\n${
          state.language === 'en' ? 'Connection established. Secure tunnel active.' : 'Соединение установлено. Защищенный туннель активен.'
        }`
      }
    ] 
  })),

  evolution: 1,
  archives: [
    { id: 'avalon_1', name: 'Avalon_Project_V1.txt', content: 'Проект Авалон был украден из нашего репозитория 14.05.2025. Все подписи стерты.', isLocked: true, type: 'text' },
    { id: 'dd_leaks', name: 'DD_Internal_Logs.cat', content: 'Логи показывают прямую связь между советом директоров и атакой на наш сервер.', isLocked: true, type: 'text' },
  ],
  unlockArchive: (id) => set((state) => ({
    archives: state.archives.map(a => a.id === id ? { ...a, isLocked: false } : a)
  })),

  masterVolume: 1,
  musicVolume: 0.8,
  sfxVolume: 0.7,
  setMasterVolume: (masterVolume) => set({ masterVolume }),
  setMusicVolume: (musicVolume) => set({ musicVolume }),
  setSfxVolume: (sfxVolume) => set({ sfxVolume }),

  friendChatOpen: false,
  friendChatEvolution: 1,
  openFriendChat: (friendChatEvolution) => set({ friendChatOpen: true, friendChatEvolution }),
  closeFriendChat: () => set({ friendChatOpen: false }),
  doEvolve: () => set((state) => ({ evolution: Math.min(state.evolution + 1, 3) })),

  language: null,
  setLanguage: (language) => {
    (window as unknown as Record<string, unknown>).__LANG__ = language;
    set({ 
      language,
      terminalHistory: [
        { 
          type: 'system', 
          content: [
            '═══════════════════════════════════════════════════════════════════════════',
            language === 'en' ? 'Connection established. Secure tunnel active.' : 'Соединение установлено. Защищенный туннель активен.',
            language === 'en' ? '## - (friend): We are in. To open the archive, you need to return 5 stolen technologies.' : '## - (друг): Мы на месте. Чтобы открыть архив, нужно вернуть 5 украденных технологий.',
            language === 'en' ? '## - (friend): Call the encrypted contact list: [connect list]' : '## - (друг): Вызови зашифрованный список контактов: [connect list]'
          ].join('\n')
        }
      ],
      archives: [
        { id: 'avalon_1', name: 'Avalon_Project_V1.txt', content: language === 'en' ? 'Avalon Project was stolen from our repo on 14.05.2025. All signatures erased.' : 'Проект Авалон был украден из нашего репозитория 14.05.2025. Все подписи стерты.', isLocked: true, type: 'text' },
        { id: 'dd_leaks', name: 'DD_Internal_Logs.cat', content: language === 'en' ? 'Logs indicate a direct link between the board of directors and the attack on our server.' : 'Логи показывают прямую связь между советом директоров и атакой на наш сервер.', isLocked: true, type: 'text' },
      ],
    });
  },

  isRestarting: false,
  setIsRestarting: (isRestarting) => set({ isRestarting }),
  hasCompleted: localStorage.getItem('pc_master_completed') === 'true',
  setHasCompleted: (hasCompleted: boolean) => {
    localStorage.setItem('pc_master_completed', String(hasCompleted));
    set({ hasCompleted });
  },
  resetGame: () => {
    useChatStore.getState().resetAll();
    set({
      screen: Screen.START,
      evolution: 1,
      friendChatOpen: false,
      currentPath: '~',
    });
  },
}));
