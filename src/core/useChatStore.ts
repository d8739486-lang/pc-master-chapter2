import { create } from 'zustand';

/**
 * In-game Chat Store — manages DD threats and Friend messages
 * during the Avalon penetration sequence.
 */

export interface IChatMessage {
  id: string;
  author: string;
  text: string;
  type: 'normal' | 'threat' | 'system';
  timestamp: number;
}

interface IChatState {
  /** All messages across channels */
  messages: IChatMessage[];

  /** Currently viewed tab: 'dd' | 'friend' | null */
  activeChat: 'dd' | 'friend' | null;

  /** Is the chat panel visible */
  chatOpen: boolean;

  /** Prevents user input while sequence runs */
  inputLocked: boolean;

  /** Badge count for unread messages */
  unreadCount: number;

  /** Actions */
  addMessage: (msg: Omit<IChatMessage, 'id' | 'timestamp'>) => void;
  removeMessage: (id: string) => void;
  removeMessagesByAuthor: (author: string) => void;
  setActiveChat: (chat: 'dd' | 'friend' | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setInputLocked: (locked: boolean) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  resetAll: () => void;
}

let nextMsgId = 0;

export const useChatStore = create<IChatState>((set) => ({
  messages: [],
  activeChat: null,
  chatOpen: false,
  inputLocked: false,
  unreadCount: 0,

  addMessage: (msg) => set((state) => {
    // Check if exactly same message was added in last 500ms to prevent double-trigger bugs
    const now = Date.now();
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg && lastMsg.text === msg.text && now - lastMsg.timestamp < 500) {
      return state;
    }

    return {
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `msg_${nextMsgId++}_${now}`,
          timestamp: now,
        },
      ],
    };
  }),

  removeMessage: (id) => set((state) => ({
    messages: state.messages.filter((m) => m.id !== id),
  })),

  removeMessagesByAuthor: (author) => set((state) => ({
    messages: state.messages.filter((m) => m.author !== author),
  })),

  setActiveChat: (chat) => set({ activeChat: chat }),

  openChat: () => set({ chatOpen: true }),
  closeChat: () => set({ chatOpen: false }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),

  setInputLocked: (locked) => set({ inputLocked: locked }),

  incrementUnread: () => set((state) => ({
    unreadCount: state.unreadCount + 1,
  })),

  clearUnread: () => set({ unreadCount: 0 }),

  resetAll: () => {
    nextMsgId = 0;
    set({
      messages: [],
      activeChat: null,
      chatOpen: false,
      inputLocked: false,
      unreadCount: 0,
    });
  },
}));
