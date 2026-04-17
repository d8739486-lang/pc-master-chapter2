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
import leverSfx from '@/textures/sfx/main/lever.mp3';
// @ts-ignore
import leverMSfx from '@/textures/sfx/main/leverM.mp3';
// @ts-ignore
import completeSfx from '@/textures/sfx/main/complete.mp3';
// @ts-ignore
import elINSfx from '@/textures/sfx/main/elIN.mp3';
// @ts-ignore
import elPICKSfx from '@/textures/sfx/main/elPICK.mp3';
// @ts-ignore
import elDROPSfx from '@/textures/sfx/main/elDROP.mp3';

// --- Cutscene SFX (Added for v0.2.1) ---
// @ts-ignore
import chaosSfx from '@/textures/sfx/menu cutscene/chaos.mp3';
// @ts-ignore
import fadeSfx from '@/textures/sfx/menu cutscene/fade.mp3';
// @ts-ignore
import messageCutsceneSfx from '@/textures/sfx/menu cutscene/message.mp3';
// @ts-ignore
import textSfx from '@/textures/sfx/menu cutscene/text.mp3';
// @ts-ignore
import typingSfx from '@/textures/sfx/menu cutscene/typing.mp3';
// @ts-ignore
import carSfx from '@/textures/sfx/main/car.mp3';

// --- Defense Game SFX ---
// @ts-ignore
import weap1Sfx from '@/textures/sfx/defend game/1_shoot.mp3';
// @ts-ignore
import weap2Sfx from '@/textures/sfx/defend game/2_shoot.mp3';
// @ts-ignore
import weap3Sfx from '@/textures/sfx/defend game/3_shoot.mp3';
// @ts-ignore
import weap4Sfx from '@/textures/sfx/defend game/4_shoot.mp3';
// @ts-ignore
import defDamageSfx from '@/textures/sfx/defend game/damage.mp3';
// @ts-ignore
import countdownSfx from '@/textures/sfx/defend game/countdown.mp3';
// @ts-ignore
import spawnSfx from '@/textures/sfx/defend game/spawn.mp3';
// @ts-ignore
import buySfx from '@/textures/sfx/defend game/buy.mp3';
// @ts-ignore
import unbuySfx from '@/textures/sfx/defend game/unbuy.mp3';

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
let damagePlayed = false;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let ambientGain: GainNode | null = null;

let currentMusicSource: AudioBufferSourceNode | null = null;
let currentMusicPath: string | null = null;
let currentAmbientSource: AudioBufferSourceNode | null = null;
const activeLoops: Map<string, { source: AudioBufferSourceNode, gain: GainNode }> = new Map();
const activeSfxSources: Set<AudioBufferSourceNode> = new Set();

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
        leverSfx, leverMSfx, completeSfx,
        elINSfx, elPICKSfx, elDROPSfx,
        weap1Sfx, weap2Sfx, weap3Sfx, weap4Sfx, defDamageSfx, 
        countdownSfx, spawnSfx, buySfx, unbuySfx,
        menuMusic, gameMusic, defendMusic, wthSfx,
        // Cutscene specific SFX
        chaosSfx, fadeSfx, messageCutsceneSfx, textSfx, typingSfx, carSfx
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

  playSfx: async (path: string, volumeScale: number = 1) => {
    if (!audioCtx || !sfxGain) return null;
    
    let buffer = audioBuffers.get(path);
    
    // Defensive: Load on the fly if not preloaded
    if (!buffer) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers.set(path, buffer);
      } catch (e) {
        console.error(`Failed to play SFX on the fly: ${path}`, e);
        return null;
      }
    }

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
    
    source.onended = () => {
      activeSfxSources.delete(source);
    };
    activeSfxSources.add(source);
    
    source.start();
    return source;
  },

  playMusic: async (path: string, loop: boolean = true) => {
    if (!audioCtx || !musicGain) return;
    
    if (currentMusicPath === path && currentMusicSource) return;

    if (currentMusicSource) {
      try { currentMusicSource.stop(); currentMusicSource.disconnect(); } catch (e) {}
    }

    let buffer = audioBuffers.get(path);
    if (!buffer) {
       try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers.set(path, buffer);
      } catch (e) {
        console.error(`Failed to play Music on the fly: ${path}`, e);
        return;
      }
    }

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

  playLoop: async (path: string, key: string, volumeScale: number = 1, fadeInMs: number = 0) => {
    if (!audioCtx || !sfxGain) return;
    audioManager.stopLoop(key);

    let buffer = audioBuffers.get(path);
    if (!buffer) {
       try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioBuffers.set(path, buffer);
      } catch (e) {
        console.error(`Failed to play Loop on the fly: ${path}`, e);
        return;
      }
    }

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

  // --- Synthetic 8-bit Audio Generators ---
  playSynth: (type: OscillatorType, freq: number, duration: number, vol: number = 0.5) => {
    if (!audioCtx || !sfxGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(sfxGain);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  },

  gridNote: (index: number) => {
    // C major pentatonic scale approx frequencies + offset
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]; 
    const freq = scale[index % scale.length];
    audioManager.playSynth('square', freq, 0.15, 0.3);
  },

  signalTick: () => {
    audioManager.playSynth('sawtooth', 880, 0.05, 0.1);
  },

  pulseTick: () => {
    audioManager.playSynth('square', 1200, 0.1, 0.4);
    setTimeout(() => {
      audioManager.playSynth('square', 1600, 0.1, 0.4);
    }, 50);
  },
  // ----------------------------------------

  click: () => audioManager.playSfx(clickSfx),
  chat: (isOpen: boolean) => audioManager.playSfx(isOpen ? chatInSfx : chatOutSfx),
  menuShow: () => audioManager.playSfx(menuShowSfx),
  delete: () => audioManager.playSfx(deleteSfx, 0.8),
  message: () => audioManager.playSfx(messageSfx, 0.5),
  cmdT: () => audioManager.playSfx(cmdTSfx, 0.6),
  cmdL: () => audioManager.playSfx(cmdLSfx, 0.6),
  lose: () => audioManager.playSfx(loseSfx, 1.0),
  damage: () => {
    if (!damagePlayed) {
      audioManager.playSfx(damageSfx, 1.0);
      damagePlayed = true;
    }
  },
  destroy: () => audioManager.playSfx(deleteSfx, 1.2), 
  wth: () => audioManager.playSfx(wthSfx, 1.2),
  
  // Defense Game
  weap1: () => audioManager.playSfx(weap1Sfx, 0.32),
  weap2: () => audioManager.playSfx(weap2Sfx, 0.5),
  weap3: () => audioManager.playSfx(weap3Sfx, 0.6),
  weap4: () => audioManager.playSfx(weap4Sfx, 0.5),
  defDamage: () => {
    if (!damagePlayed) {
      audioManager.playSfx(defDamageSfx, 1.0);
      damagePlayed = true;
    }
  },
  countdown: () => audioManager.playSfx(countdownSfx, 0.7),
  spawn: () => audioManager.playSfx(spawnSfx, 0.6),
  buy: () => audioManager.playSfx(buySfx, 0.6),
  unbuy: () => audioManager.playSfx(unbuySfx, 0.6),
  lOFF: () => {
    // Heavy switch/relay sound
    audioManager.playSynth('square', 60, 0.4, 0.1);
    setTimeout(() => audioManager.playSynth('sine', 40, 0.2, 0.3), 50);
  },
  spark: () => {
    // High-pitched electric discharge (8-bit spark)
    audioManager.playSynth('sawtooth', 800, 0.3, 0.1);
    setTimeout(() => audioManager.playSynth('sawtooth', 400, 0.2, 0.2), 50);
  },
  lever: () => audioManager.playSfx(leverSfx, 1.0),
  leverM: () => audioManager.playSfx(leverMSfx, 1.0),
  complete: () => audioManager.playSfx(completeSfx, 1.0),
  elIN: () => audioManager.playSfx(elINSfx, 1.0),
  elPICK: () => audioManager.playSfx(elPICKSfx, 1.0),
  elDROP: () => audioManager.playSfx(elDROPSfx, 1.0),

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
  
  stopAll: () => {
    audioManager.stopMusic();
    audioManager.stopAllLoops();
    
    // Stop all active one-off SFX
    activeSfxSources.forEach(source => {
      try { source.stop(); source.disconnect(); } catch (e) {}
    });
    activeSfxSources.clear();

    if (currentAmbientSource) {
      try { currentAmbientSource.stop(); currentAmbientSource.disconnect(); } catch (e) {}
      currentAmbientSource = null;
    }
  },

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
