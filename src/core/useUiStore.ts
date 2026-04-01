import { create } from 'zustand';

/**
 * UI Effects Store — controls screen shake, blur, red flash, glitch text.
 * All effects are toggled by the TimelineEngine, never by components directly.
 */

type ShakeIntensity = 'small' | 'medium' | 'large';

interface IUiState {
  /** Screen shake */
  shake: boolean;
  shakeIntensity: ShakeIntensity;

  /** Full-screen blur overlay */
  blurActive: boolean;

  /** Red flash overlay */
  redFlash: boolean;

  /** Glitch text overlay (null = hidden) */
  glitchText: string | null;

  /** DD Warning Popup (Uncloseable) */
  ddPopupOpen: boolean;
  ddPopupExploding: boolean;

  /** Actions */
  triggerShake: (intensity: ShakeIntensity, durationMs?: number) => void;
  setBlur: (active: boolean) => void;
  triggerRedFlash: (durationMs?: number) => void;
  setGlitchText: (text: string | null) => void;
  setDdPopupOpen: (open: boolean) => void;
  setDdPopupExploding: (exploding: boolean) => void;
  resetAll: () => void;
}

export const useUiStore = create<IUiState>((set) => ({
  shake: false,
  shakeIntensity: 'small',
  blurActive: false,
  redFlash: false,
  glitchText: null,
  ddPopupOpen: false,
  ddPopupExploding: false,

  triggerShake: (intensity, durationMs = 400) => {
    set({ shake: true, shakeIntensity: intensity });
    setTimeout(() => set({ shake: false }), durationMs);
  },

  setBlur: (active) => set({ blurActive: active }),

  triggerRedFlash: (durationMs = 300) => {
    set({ redFlash: true });
    setTimeout(() => set({ redFlash: false }), durationMs);
  },

  setGlitchText: (text) => set({ glitchText: text }),

  setDdPopupOpen: (open) => set({ ddPopupOpen: open }),
  setDdPopupExploding: (exploding) => set({ ddPopupExploding: exploding }),

  resetAll: () => set({
    shake: false,
    shakeIntensity: 'small',
    blurActive: false,
    redFlash: false,
    glitchText: null,
    ddPopupOpen: false,
    ddPopupExploding: false,
  }),
}));
