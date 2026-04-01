import { create } from 'zustand';

export enum MODAL_TYPES {
  NETWORK = 'NETWORK',
  LOGS = 'LOGS',
  SETTINGS = 'SETTINGS',
  STORY = 'STORY',
  UPDATE_LOGS = 'UPDATE_LOGS',
}

interface ModalData {
  id: MODAL_TYPES;
  props?: Record<string, unknown>;
}

interface ModalStore {
  modals: ModalData[];
  openModal: (id: MODAL_TYPES, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modals: [],
  openModal: (id, props) =>
    set((state) => {
      // Prevent duplicate modals in stack
      if (state.modals.some((m) => m.id === id)) return state;
      return { modals: [...state.modals, { id, props }] };
    }),
  closeModal: () =>
    set((state) => ({ modals: state.modals.slice(0, -1) })),
  closeAllModals: () => set({ modals: [] }),
}));
