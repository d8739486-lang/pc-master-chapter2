import { useGameStore } from './store';

// Import SFX
// @ts-ignore
import clickSfx from '@/textures/sfx/main/click.mp3';
// @ts-ignore
import menuShowSfx from '@/textures/sfx/main/menu_show.mp3';
// @ts-ignore
import chatInSfx from '@/textures/sfx/main/chat_in.mp3';
// @ts-ignore
import chatOutSfx from '@/textures/sfx/main/chat_out.mp3';
// @ts-ignore
import rainSfx from '@/textures/sfx/main/rain.mp3';
// @ts-ignore
import thunderSfx from '@/textures/sfx/main/thunder.mp3';
// @ts-ignore
import thunderSmallSfx from '@/textures/sfx/main/thunder_small.mp3';
// @ts-ignore
import deleteSfx from '@/textures/sfx/main/delete.mp3';
// @ts-ignore
import dangerSfx from '@/textures/sfx/main/danger.mp3';
// @ts-ignore
import messageSfx from '@/textures/sfx/main/message.mp3';
// @ts-ignore
import cmdTSfx from '@/textures/sfx/main/cmdT.mp3';
// @ts-ignore
import cmdLSfx from '@/textures/sfx/main/cmdL.mp3';
// @ts-ignore
import loseSfx from '@/textures/sfx/main/lose.mp3';

let currentAmbient: HTMLAudioElement | null = null;

// Import Music
// @ts-ignore
import menuMusic from '@/textures/soundtracks/menu.mp3';
// @ts-ignore
import gameMusic from '@/textures/soundtracks/game.mp3';

let currentMusic: HTMLAudioElement | null = null;
let currentMusicPath: string | null = null;

/** Named audio loops (breathing, etc.) tracked for stop/cleanup */
const activeLoops: Map<string, HTMLAudioElement> = new Map();

/**
 * Centralized Audio Controller
 * Handles SFX, Music, and Loop playback with volume scaling.
 */
export const audioManager = {
  playSfx: (path: string, volumeScale: number = 1) => {
    const { masterVolume, sfxVolume } = useGameStore.getState();
    const sfx = new Audio(path);
    sfx.volume = masterVolume * sfxVolume * volumeScale;
    sfx.play().catch(() => {});
    return sfx;
  },

  playMusic: (path: string, loop: boolean = true) => {
    // Guard: don't restart if same track is already playing
    if (currentMusicPath === path && currentMusic && !currentMusic.paused) return;
    
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.src = '';
    }

    const { masterVolume, musicVolume } = useGameStore.getState();
    const music = new Audio(path);
    music.loop = loop;
    // Music is now 15% louder overall, and menu music is baseline 1.0 instead of 0.85
    const volScale = path.includes('menu') ? 1.0 : 1.15;
    music.volume = masterVolume * musicVolume * volScale;
    music.play().catch(() => {
        // Fallback for autoplay blocks
        const startMusic = () => {
            music.play().catch(() => {});
            window.removeEventListener('click', startMusic);
        };
        window.addEventListener('click', startMusic);
    });

    currentMusic = music;
    currentMusicPath = path;

    // Re-check volume on state change
    const unsub = useGameStore.subscribe((state) => {
      if (currentMusic) {
        const currentVolScale = currentMusicPath?.includes('menu') ? 1.0 : 1.15;
        currentMusic.volume = state.masterVolume * state.musicVolume * currentVolScale;
      }
    });

    return () => {
      unsub();
      music.pause();
      music.src = '';
      if (currentMusicPath === path) {
          currentMusic = null;
          currentMusicPath = null;
      }
    };
  },

  /**
   * Play a looping SFX with a named key for later stopping.
   * Supports fade-in over `fadeInMs` milliseconds.
   */
  playLoop: (path: string, key: string, volumeScale: number = 1, fadeInMs: number = 0) => {
    // Stop existing loop with same key
    audioManager.stopLoop(key);

    const { masterVolume, sfxVolume } = useGameStore.getState();
    const targetVolume = masterVolume * sfxVolume * volumeScale;
    const audio = new Audio(path);
    audio.loop = true;
    audio.volume = fadeInMs > 0 ? 0 : targetVolume;
    audio.play().catch(() => {});

    activeLoops.set(key, audio);

    // Fade in
    if (fadeInMs > 0) {
      const steps = 20;
      const stepTime = fadeInMs / steps;
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(targetVolume, (currentStep / steps) * targetVolume);
        if (currentStep >= steps) clearInterval(fadeInterval);
      }, stepTime);
    }
  },

  /**
   * Stop a named loop, optionally with fade-out.
   */
  stopLoop: (key: string, fadeOutMs: number = 0) => {
    const audio = activeLoops.get(key);
    if (!audio) return;

    if (fadeOutMs > 0) {
      const initialVolume = audio.volume;
      const steps = 20;
      const stepTime = fadeOutMs / steps;
      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, initialVolume * (1 - currentStep / steps));
        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.src = '';
          activeLoops.delete(key);
        }
      }, stepTime);
    } else {
      audio.pause();
      audio.src = '';
      activeLoops.delete(key);
    }
  },

  /** Stop all active loops */
  stopAllLoops: () => {
    for (const key of Array.from(activeLoops.keys())) {
      audioManager.stopLoop(key);
    }
    if (currentAmbient) {
      currentAmbient.pause();
      currentAmbient.src = '';
      currentAmbient = null;
    }
  },

  /** Stop the current background music immediately */
  stopMusic: () => {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.src = '';
      currentMusic = null;
      currentMusicPath = null;
    }
  },

  // Named SFX helpers
  click: () => audioManager.playSfx(clickSfx),
  chat: (isOpen: boolean) => audioManager.playSfx(isOpen ? chatInSfx : chatOutSfx),
  menuShow: () => audioManager.playSfx(menuShowSfx),
  delete: () => audioManager.playSfx(deleteSfx, 0.8),
  message: () => audioManager.playSfx(messageSfx, 0.5),
  cmdT: () => audioManager.playSfx(cmdTSfx, 0.6),
  cmdL: () => audioManager.playSfx(cmdLSfx, 0.6), // 20% quieter than previous 0.8
  lose: () => audioManager.playSfx(loseSfx, 1.0),

  /** Danger SFX loop — starts with fade-in */
  dangerStart: (fadeInMs: number = 2000) => {
    audioManager.playLoop(dangerSfx, 'danger', 0.8, fadeInMs);
  },

  /** Danger SFX loop — stops */
  dangerStop: (fadeOutMs: number = 0) => {
    audioManager.stopLoop('danger', fadeOutMs);
  },


  // Named Music helpers
  menu: () => audioManager.playMusic(menuMusic),
  game: () => audioManager.playMusic(gameMusic),
  
  rain: () => {
    if (currentAmbient) {
      currentAmbient.pause();
      currentAmbient.src = '';
    }
    const { masterVolume, sfxVolume } = useGameStore.getState();
    const rain = new Audio(rainSfx);
    rain.loop = true;
    rain.volume = masterVolume * sfxVolume * 0.56;
    rain.play().catch(() => {});
    currentAmbient = rain;
    return () => {
      rain.pause();
      rain.src = '';
      if (currentAmbient === rain) currentAmbient = null;
    };
  },
  
  thunder: (isBig: boolean = true) => {
    if (isBig) {
       audioManager.playSfx(thunderSfx, 1.0);
    } else {
       audioManager.playSfx(thunderSmallSfx, 0.625);
    }
  },

  fadeOut: (duration: number = 2000) => {
    const step = 50;
    const iterations = duration / step;
    
    const elements = [currentMusic, currentAmbient].filter(Boolean) as HTMLAudioElement[];
    if (elements.length === 0) return;

    const initialVolumes = elements.map(el => el.volume);
    let currentIteration = 0;

    const interval = setInterval(() => {
      currentIteration++;
      const progress = currentIteration / iterations;
      
      elements.forEach((el, i) => {
        el.volume = Math.max(0, initialVolumes[i] * (1 - progress));
      });

      if (currentIteration >= iterations) {
        clearInterval(interval);
        elements.forEach(el => {
          el.pause();
          el.src = '';
        });
        currentMusic = null;
        currentMusicPath = null;
        currentAmbient = null;
      }
    }, step);
  }
};
