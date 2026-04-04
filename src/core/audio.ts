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
import cmdLSfx from '@/textures/sfx/main/cmdL.mp3';
// @ts-ignore
import cmdTSfx from '@/textures/sfx/main/cmdT.mp3';
// @ts-ignore
import loseSfx from '@/textures/sfx/main/lose.mp3';
// @ts-ignore
import damageSfx from '@/textures/sfx/main/damage.mp3';

// @ts-ignore
import menuMusic from '@/textures/soundtracks/menu.mp3';
// @ts-ignore
import gameMusic from '@/textures/soundtracks/game.mp3';
// @ts-ignore
import defendMusic from '@/textures/soundtracks/defend.mp3';
// @ts-ignore
import wthSfx from '@/textures/soundtracks/WTH.mp3';

export let audioCtx: AudioContext | null = null;
const audioBuffers: Map<string, AudioBuffer> = new Map();
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let ambientGain: GainNode | null = null;

let currentMusicSource: AudioBufferSourceNode | null = null;
let currentMusicPath: string | null = null;
let currentAmbientSource: AudioBufferSourceNode | null = null;
const activeLoops: Map<string, { source: AudioBufferSourceNode, gain: GainNode }> = new Map();

let fadeOutTimeout: number | null = null;

export const audioManager = {
  initialize: async (onProgress?: (p: number) => void) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioCtxClass();

      masterGain = audioCtx.createGain();
      sfxGain = audioCtx.createGain();
      musicGain = audioCtx.createGain();
      ambientGain = audioCtx.createGain();

      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      ambientGain.connect(masterGain);
      masterGain.connect(audioCtx.destination);

      const state = useGameStore.getState();
      masterGain.gain.value = state.masterVolume;
      sfxGain.gain.value = state.sfxVolume;
      musicGain.gain.value = state.musicVolume;
      ambientGain.gain.value = Math.max(0, state.sfxVolume * 0.56);

      useGameStore.subscribe((newState) => {
        if (!audioCtx) return;
        if (masterGain) masterGain.gain.setTargetAtTime(newState.masterVolume, audioCtx.currentTime, 0.1);
        if (sfxGain) sfxGain.gain.setTargetAtTime(newState.sfxVolume, audioCtx.currentTime, 0.1);
        if (musicGain) musicGain.gain.setTargetAtTime(newState.musicVolume, audioCtx.currentTime, 0.1);
        if (ambientGain) ambientGain.gain.setTargetAtTime(Math.max(0, newState.sfxVolume * 0.56), audioCtx.currentTime, 0.1);
      });

      const assets = [
        clickSfx, menuShowSfx, chatInSfx, chatOutSfx, rainSfx, 
        thunderSfx, thunderSmallSfx, deleteSfx, dangerSfx, 
        messageSfx, cmdLSfx, cmdTSfx, loseSfx, damageSfx, 
        menuMusic, gameMusic, defendMusic, wthSfx
      ];

      let loaded = 0;
      const promises = assets.map(async (url) => {
        try {
          if (!audioBuffers.has(url)) {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtx!.decodeAudioData(arrayBuffer);
            audioBuffers.set(url, audioBuffer);
          }
        } catch (e) {
          console.error(`Failed to preload audio: ${url}`, e);
        } finally {
          loaded++;
          if (onProgress) onProgress((loaded / assets.length) * 100);
        }
      });

      await Promise.all(promises);

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
    } catch (e) {
      console.error("Audio Context Init Error", e);
    }
  },

  playSfx: (path: string, volumeScale: number = 1) => {
    if (!audioCtx || !sfxGain) return null;
    const buffer = audioBuffers.get(path);
    if (!buffer) return null;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    if (volumeScale !== 1) {
      const localGain = audioCtx.createGain();
      localGain.gain.value = volumeScale;
      source.connect(localGain);
      localGain.connect(sfxGain);
    } else {
      source.connect(sfxGain);
    }
    
    source.start();
    return source;
  },

  playMusic: (path: string, loop: boolean = true) => {
    if (!audioCtx || !musicGain) return;
    
    if (currentMusicPath === path && currentMusicSource) return;

    if (currentMusicSource) {
      try { currentMusicSource.stop(); currentMusicSource.disconnect(); } catch (e) {}
    }

    const buffer = audioBuffers.get(path);
    if (!buffer) return;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;

    const volScale = path.includes('menu') ? 1.0 : 1.15;
    const localGain = audioCtx.createGain();
    localGain.gain.value = volScale;

    source.connect(localGain);
    localGain.connect(musicGain);

    source.start();
    
    currentMusicSource = source;
    currentMusicPath = path;

    return () => {
      try { source.stop(); source.disconnect(); } catch (e) {}
      if (currentMusicPath === path) {
        currentMusicSource = null;
        currentMusicPath = null;
      }
    };
  },

  playLoop: (path: string, key: string, volumeScale: number = 1, fadeInMs: number = 0) => {
    if (!audioCtx || !sfxGain) return;
    audioManager.stopLoop(key);

    const buffer = audioBuffers.get(path);
    if (!buffer) return;

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const localGain = audioCtx.createGain();
    localGain.gain.value = fadeInMs > 0 ? 0 : volumeScale;

    source.connect(localGain);
    localGain.connect(sfxGain);
    
    source.start();
    activeLoops.set(key, { source, gain: localGain });

    if (fadeInMs > 0) {
      localGain.gain.setTargetAtTime(volumeScale, audioCtx.currentTime, fadeInMs / 1000);
    }
  },

  stopLoop: (key: string, fadeOutMs: number = 0) => {
    if (!audioCtx) return;
    const loop = activeLoops.get(key);
    if (!loop) return;

    if (fadeOutMs > 0) {
      loop.gain.gain.setTargetAtTime(0, audioCtx.currentTime, fadeOutMs / 1000);
      window.setTimeout(() => {
        try { loop.source.stop(); loop.source.disconnect(); } catch (e) {}
      }, fadeOutMs);
    } else {
      try { loop.source.stop(); loop.source.disconnect(); } catch (e) {}
    }
    activeLoops.delete(key);
  },

  stopAllLoops: () => {
    for (const key of Array.from(activeLoops.keys())) {
      audioManager.stopLoop(key);
    }
    if (currentAmbientSource) {
      try { currentAmbientSource.stop(); currentAmbientSource.disconnect(); } catch (e) {}
      currentAmbientSource = null;
    }
  },

  stopMusic: () => {
    if (currentMusicSource) {
      try { currentMusicSource.stop(); currentMusicSource.disconnect(); } catch (e) {}
      currentMusicSource = null;
      currentMusicPath = null;
    }
  },

  click: () => audioManager.playSfx(clickSfx),
  chat: (isOpen: boolean) => audioManager.playSfx(isOpen ? chatInSfx : chatOutSfx),
  menuShow: () => audioManager.playSfx(menuShowSfx),
  delete: () => audioManager.playSfx(deleteSfx, 0.8),
  message: () => audioManager.playSfx(messageSfx, 0.5),
  cmdT: () => audioManager.playSfx(cmdTSfx, 0.6),
  cmdL: () => audioManager.playSfx(cmdLSfx, 0.6),
  lose: () => audioManager.playSfx(loseSfx, 1.0),
  damage: () => audioManager.playSfx(damageSfx, 1.0),
  destroy: () => audioManager.playSfx(deleteSfx, 1.2), 
  wth: () => audioManager.playSfx(wthSfx, 1.2),

  dangerStart: (fadeInMs: number = 2000) => {
    if (activeLoops.has('danger')) return;
    audioManager.playLoop(dangerSfx, 'danger', 0.8, fadeInMs);
  },

  dangerStop: (fadeOutMs: number = 0) => {
    audioManager.stopLoop('danger', fadeOutMs);
  },

  menu: () => audioManager.playMusic(menuMusic),
  game: () => audioManager.playMusic(gameMusic),
  defend: () => audioManager.playMusic(defendMusic),
  
  rain: () => {
    if (!audioCtx || !ambientGain) return () => {};
    if (currentAmbientSource) {
      try { currentAmbientSource.stop(); currentAmbientSource.disconnect(); } catch (e) {}
      currentAmbientSource = null;
    }

    const buffer = audioBuffers.get(rainSfx);
    if (!buffer) return () => {};

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    source.connect(ambientGain);
    source.start();
    
    currentAmbientSource = source;

    return () => {
      try { source.stop(); source.disconnect(); } catch (e) {}
      if (currentAmbientSource === source) currentAmbientSource = null;
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
    if (!audioCtx) return;
    
    if (currentMusicSource && musicGain) {
      musicGain.gain.setTargetAtTime(0, audioCtx.currentTime, duration / 1000);
    }
    if (currentAmbientSource && ambientGain) {
      ambientGain.gain.setTargetAtTime(0, audioCtx.currentTime, duration / 1000);
    }

    if (fadeOutTimeout) window.clearTimeout(fadeOutTimeout);
    
    fadeOutTimeout = window.setTimeout(() => {
      if (currentMusicSource) {
        try { currentMusicSource.stop(); currentMusicSource.disconnect(); } catch(e){}
        currentMusicSource = null;
        currentMusicPath = null;
      }
      if (currentAmbientSource) {
        try { currentAmbientSource.stop(); currentAmbientSource.disconnect(); } catch(e){}
        currentAmbientSource = null;
      }
    }, duration);
  }
};
