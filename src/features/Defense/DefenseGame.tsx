import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDefenseStore, WAVE_CONFIG, WAVE_SECTOR_MAP } from './useDefenseStore';
import { useGameStore, Screen } from '@/core/store';
import { audioManager } from '@/core/audio';
import { Shield, Zap, Skull, Heart } from 'lucide-react';
import { useI18n } from '@/core/i18n';

// @ts-ignore
import defendMusic from '@/textures/soundtracks/defend.mp3';

/**
 * AVALON DEFENSE — 10-wave sector defense mini-game
 * After PostHackSequence, the player defends recovered data sectors
 * from DD counter-attacks, then fights the DD_CORE_ARCHITECT boss.
 */
export const DefenseGame = () => {
  const { setScreen } = useGameStore();
  const {
    phase, wave, score, waveTimer, sectors, attacks,
    bossHp, bossMaxHp, bossAttacks, bossVulnerable, vulnTimer, totalKills,
    setPhase, setWave, setWaveTimer, addScore,
    setSectors, spawnAttack, removeAttack, advanceAttacks,
    damageBoss, setBossVulnerable, setVulnTimer,
    spawnBossAttack, removeBossAttack, advanceBossAttacks,
    clearAllAttacks, addKill, resetDefense,
  } = useDefenseStore();
  const { t } = useI18n();

  const gameLoopRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameRef = useRef<number>(0);
  const spawnCountRef = useRef<number>(0);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Start defense music & cleanup on unmount
  useEffect(() => {
    const music = new Audio(defendMusic);
    music.loop = true;
    music.volume = 0.4;
    music.play().catch(() => {});
    musicRef.current = music;

    return () => {
      music.pause();
      musicRef.current = null;
      cancelAnimationFrame(gameLoopRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, []);

  // INTRO phase → start wave 1 after 3s
  useEffect(() => {
    if (phase === 'intro') {
      resetDefense();
      const t = setTimeout(() => {
        startWave(1);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Game loop for advancing attacks
  useEffect(() => {
    if (phase !== 'combat' && phase !== 'boss' && phase !== 'boss_vulnerable') return;

    const loop = (timestamp: number) => {
      const dt = lastFrameRef.current ? (timestamp - lastFrameRef.current) / 16.67 : 1;
      lastFrameRef.current = timestamp;

      if (phase === 'combat') {
        advanceAttacks(dt);
      } else if (phase === 'boss' || phase === 'boss_vulnerable') {
        advanceBossAttacks();
      }
      gameLoopRef.current = requestAnimationFrame(loop);
    };

    lastFrameRef.current = 0;
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [phase, advanceAttacks, advanceBossAttacks]);

  // Wave and Combat logic
  useEffect(() => {
    if (phase === 'combat') {
      const checkWaveCleared = setInterval(() => {
        const state = useDefenseStore.getState();
        const cfg = WAVE_CONFIG[state.wave];
        // If all enemies spawned and none left on screen
        if (spawnCountRef.current >= cfg.attackCount && state.attacks.length === 0) {
          clearInterval(checkWaveCleared);
          if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
          if (waveTimerRef.current) clearInterval(waveTimerRef.current);
          
          audioManager.cmdT();
          if (state.wave >= 10) {
            setPhase('boss_intro');
          } else {
            setPhase('wave_clear');
          }
        }
      }, 500);
      return () => clearInterval(checkWaveCleared);
    }
  }, [phase, wave]);

  // Wave timer countdown (purely visual or for extra pressure)
  useEffect(() => {
    if (phase === 'combat' && waveTimer > 0) {
      waveTimerRef.current = setInterval(() => {
        const current = useDefenseStore.getState().waveTimer;
        if (current > 0) {
          setWaveTimer(current - 1);
        } else {
          if (waveTimerRef.current) clearInterval(waveTimerRef.current);
        }
      }, 1000);
      return () => { if (waveTimerRef.current) clearInterval(waveTimerRef.current); };
    }
  }, [phase, waveTimer]);

  // Wave clear → next wave after 4s
  useEffect(() => {
    if (phase === 'wave_clear') {
      const t = setTimeout(() => {
        startWave(wave + 1);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [phase, wave]);

  // Boss intro → boss fight after 4s
  useEffect(() => {
    if (phase === 'boss_intro') {
      const t = setTimeout(() => {
        setPhase('boss');
        startBossSpawn();
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Boss vulnerability timer
  useEffect(() => {
    if (phase === 'boss_vulnerable') {
      const interval = setInterval(() => {
        const current = useDefenseStore.getState().vulnTimer;
        if (current <= 1) {
          clearInterval(interval);
          setBossVulnerable(false);
          setPhase('boss');
          startBossSpawn();
        } else {
          setVulnTimer(current - 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Check boss death
  useEffect(() => {
    if ((phase === 'boss' || phase === 'boss_vulnerable') && bossHp <= 0) {
      if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
      clearAllAttacks();
      musicRef.current?.pause();
      audioManager.cmdT();
      setPhase('victory');
    }
  }, [bossHp, phase]);

  // Victory → transition
  useEffect(() => {
    if (phase === 'victory') {
      const t = setTimeout(() => {
        setScreen(Screen.VICTORY_CHAT);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [phase, setScreen]);

  // Defeat handler
  useEffect(() => {
    if (phase === 'defeat') {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
      clearAllAttacks();
      musicRef.current?.pause();
      audioManager.stopAllLoops();
    }
  }, [phase]);

  const startWave = useCallback((waveNum: number) => {
    setWave(waveNum);
    setPhase('prep');
    spawnCountRef.current = 0;

    // Activate correct sectors
    const activeSectorIds = WAVE_SECTOR_MAP[waveNum] ?? [1];
    const updatedSectors = useDefenseStore.getState().sectors.map(s => ({
      ...s,
      active: activeSectorIds.includes(s.id),
    }));
    setSectors(updatedSectors);

    // Prep phase 4s → combat
    setTimeout(() => {
      const cfg = WAVE_CONFIG[waveNum];
      setWaveTimer(cfg.combatDuration);
      setPhase('combat');

      // Start spawning attacks
      spawnTimerRef.current = setInterval(() => {
        const state = useDefenseStore.getState();
        if (state.phase !== 'combat' || spawnCountRef.current >= cfg.attackCount) {
          if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
          return;
        }
        const activeSectors = state.sectors.filter(s => s.active);
        if (activeSectors.length === 0) return;

        spawnCountRef.current += 1;
        const target = activeSectors[Math.floor(Math.random() * activeSectors.length)];
        const angle = Math.random() * Math.PI * 2;
        const radius = 300 + Math.random() * 200;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;

        state.spawnAttack({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          targetSectorId: target.id,
          speed: cfg.speed + Math.random() * 0.003,
          size: 20 + Math.random() * 15,
          progress: 0,
        });
      }, cfg.spawnInterval);
    }, 4000);
  }, [setWave, setPhase, setSectors, setWaveTimer]);

  const startBossSpawn = useCallback(() => {
    bossSpawnRef.current = setInterval(() => {
      const state = useDefenseStore.getState();
      if (state.phase !== 'boss') {
        if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
        return;
      }
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2 - 50;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2;

      state.spawnBossAttack({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 18 + Math.random() * 10,
      });
    }, 1500);
  }, []);

  // --- Click Handlers ---
  const handleAttackClick = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeAttack(id);
    addScore(10);
    addKill();
    audioManager.click();
  }, [removeAttack, addScore, addKill]);

  const handleBossAttackClick = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBossAttack(id);
    addScore(15);
    addKill();
    audioManager.click();

    // Check if all boss attacks destroyed → vulnerability window
    const remaining = useDefenseStore.getState().bossAttacks.length;
    if (remaining <= 1) { // about to be 0 after this removal
      if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
      setBossVulnerable(true);
      setVulnTimer(10);
      setPhase('boss_vulnerable');
    }
  }, [removeBossAttack, addScore, addKill, setBossVulnerable, setVulnTimer, setPhase]);

  const handleBossClick = useCallback(() => {
    if (!bossVulnerable) return;
    damageBoss(5);
    addScore(50);
    audioManager.click();
  }, [bossVulnerable, damageBoss, addScore]);

  const handleRestart = useCallback(() => {
    resetDefense();
    setPhase('intro');
  }, [resetDefense, setPhase]);

  // --- Sector Positions (circle layout) ---
  const getSectorPosition = (index: number) => {
    const cx = 50; // % center
    const cy = 45;
    const radius = 22; // % radius
    const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
    return {
      left: `${cx + Math.cos(angle) * radius}%`,
      top: `${cy + Math.sin(angle) * radius}%`,
    };
  };

  // Attack position interpolation
  const getAttackPosition = (attack: typeof attacks[0]) => {
    const sectorIdx = sectors.findIndex(s => s.id === attack.targetSectorId);
    const sectorPos = getSectorPosition(sectorIdx);
    const targetX = parseFloat(sectorPos.left) / 100 * window.innerWidth;
    const targetY = parseFloat(sectorPos.top) / 100 * window.innerHeight;

    const x = attack.x + (targetX - attack.x) * attack.progress;
    const y = attack.y + (targetY - attack.y) * attack.progress;
    return { x, y };
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none font-mono"
         style={{ cursor: (phase === 'combat' || phase === 'boss' || phase === 'boss_vulnerable') ? 'crosshair' : 'default' }}>
      
      {/* Ambient grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(16,185,129,0.3) 40px, rgba(16,185,129,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(16,185,129,0.3) 40px, rgba(16,185,129,0.3) 41px)' }}
      />

      {/* HUD - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-black/80 border-b border-emerald-500/20">
        <div className="flex items-center gap-6">
          <div className="text-emerald-500 text-xs uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>{t('defense.hud_wave', { n: wave })}</span>
          </div>
          <div className="text-zinc-400 text-xs uppercase tracking-widest">
            {t('defense.hud_score', { n: score })}
          </div>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">
            {t('defense.hud_kills', { n: totalKills })}
          </div>
        </div>
        {phase === 'combat' && (
          <div className={`text-xs uppercase tracking-widest font-bold ${waveTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
            {waveTimer}s
          </div>
        )}
        {(phase === 'boss' || phase === 'boss_vulnerable') && (
          <div className="flex items-center gap-4">
            <span className="text-red-500 text-xs uppercase tracking-widest font-bold animate-pulse">
              <Skull className="w-4 h-4 inline mr-1" />{t('defense.boss_label')}
            </span>
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-red-500"
                animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
              />
            </div>
            <span className="text-red-400 text-[10px]">{bossHp}%</span>
          </div>
        )}
      </div>

      {/* Sector Grid */}
      <AnimatePresence>
        {(phase === 'combat' || phase === 'prep' || phase === 'wave_clear') && sectors.map((sector, i) => {
          const pos = getSectorPosition(i);
          const hpPercent = (sector.hp / sector.maxHp) * 100;
          return (
            <motion.div
              key={sector.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: sector.active ? 1 : 0.15, scale: sector.active ? 1 : 0.7 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{ left: pos.left, top: pos.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className={`w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
                sector.active 
                  ? hpPercent > 50 ? 'border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : hpPercent > 25 ? 'border-yellow-500/50 bg-yellow-950/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                    : 'border-red-500/50 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'
                  : 'border-zinc-700/30 bg-zinc-900/20'
              }`}>
                <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold">{sector.name}</span>
                {sector.active && (
                  <div className="w-14 h-1.5 bg-black/50 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                )}
                {sector.active && (
                  <span className="text-[8px] text-white/40 mt-1">{Math.round(hpPercent)}%</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Attacks (Virus Nodes) */}
      {phase === 'combat' && attacks.map(attack => {
        const pos = getAttackPosition(attack);
        return (
          <motion.button
            key={attack.id}
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={(e) => handleAttackClick(attack.id, e)}
            style={{ left: pos.x, top: pos.y, width: attack.size, height: attack.size }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-crosshair z-20 bg-red-500/80 border border-red-400/60 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:bg-red-400 hover:scale-110 transition-transform active:scale-90"
          />
        );
      })}

      {/* Boss */}
      <AnimatePresence>
        {(phase === 'boss' || phase === 'boss_vulnerable' || phase === 'boss_intro') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] z-30"
          >
            <button
              type="button"
              onClick={handleBossClick}
              disabled={!bossVulnerable}
              className={`w-32 h-32 rounded-full text-center flex flex-col items-center justify-center transition-all duration-300 ${
                bossVulnerable
                  ? 'bg-red-500/30 border-2 border-yellow-400 shadow-[0_0_60px_rgba(234,179,8,0.6)] cursor-crosshair animate-pulse'
                  : 'bg-zinc-900 border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] cursor-not-allowed'
              }`}
            >
              <Skull className={`w-10 h-10 ${bossVulnerable ? 'text-yellow-400' : 'text-red-500'}`} />
              <span className="text-[8px] uppercase tracking-widest text-white/60 mt-1">DD_CORE</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss Attacks */}
      {(phase === 'boss' || phase === 'boss_vulnerable') && bossAttacks.map(ba => (
        <motion.button
          key={ba.id}
          type="button"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={(e) => handleBossAttackClick(ba.id, e)}
          style={{ left: ba.x, top: ba.y, width: ba.size, height: ba.size }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-crosshair z-20 bg-purple-500/70 border border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.5)] hover:bg-purple-400 hover:scale-110 transition-transform active:scale-90"
        />
      ))}

      {/* Boss Vulnerability Timer */}
      {phase === 'boss_vulnerable' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
        >
          <div className="text-yellow-400 font-black text-lg animate-pulse tracking-widest uppercase flex items-center gap-3">
            <Zap className="w-5 h-5" />
            {t('defense.vuln_timer', { n: vulnTimer })}
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-yellow-400/60 text-[10px] tracking-widest uppercase mt-2">{t('defense.click_boss')}</p>
        </motion.div>
      )}

      {/* --- Overlays --- */}

      {/* Intro */}
      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
        >
          <Shield className="w-16 h-16 text-emerald-500 animate-pulse mb-6" />
          <h1 className="text-3xl font-black uppercase tracking-[0.5em] text-white mb-4">AVALON DEFENSE</h1>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">{t('defense.sys_activating')}</p>
        </motion.div>
      )}

      {/* Prep Phase */}
      {phase === 'prep' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8 }}
            className="text-6xl font-black text-emerald-500 uppercase tracking-[0.3em] mb-4"
          >
            {t('defense.wave_title', { n: wave })}
          </motion.div>
          <p className="text-zinc-400 text-sm tracking-widest uppercase">
            {t('defense.active_sectors', { n: (WAVE_SECTOR_MAP[wave] ?? [1]).length })}
          </p>
        </motion.div>
      )}

      {/* Wave Clear */}
      {phase === 'wave_clear' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 pointer-events-none"
        >
          <h2 className="text-4xl font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">{t('defense.wave_cleared', { n: wave })}</h2>
          <p className="text-zinc-500 text-sm tracking-widest uppercase">{t('defense.next_wave')}</p>
        </motion.div>
      )}

      {/* Boss Intro */}
      {phase === 'boss_intro' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Skull className="w-20 h-20 text-red-500 mb-6" />
          </motion.div>
          <h2 className="text-4xl font-black text-red-500 uppercase tracking-[0.5em] mb-4 animate-pulse">
            {t('defense.boss_name')}
          </h2>
          <p className="text-zinc-400 text-sm tracking-widest uppercase">{t('defense.boss_subtitle')}</p>
        </motion.div>
      )}

      {/* Victory */}
      {phase === 'victory' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <Zap className="w-20 h-20 text-emerald-400 mb-6" />
          </motion.div>
          <h2 className="text-5xl font-black text-emerald-400 uppercase tracking-[0.5em] mb-6">{t('defense.victory_title')}</h2>
          <p className="text-zinc-400 text-sm tracking-widest uppercase mb-2">{t('defense.victory_subtitle')}</p>
          <p className="text-zinc-600 text-xs tracking-widest uppercase">{t('defense.hud_score', { n: score })} | {t('defense.hud_kills', { n: totalKills })}</p>
        </motion.div>
      )}

      {/* Defeat */}
      {phase === 'defeat' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95"
        >
          <Heart className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-4xl font-black text-red-500 uppercase tracking-[0.4em] mb-6">{t('defense.defeat_title')}</h2>
          <p className="text-zinc-500 text-sm tracking-widest uppercase mb-8">{t('defense.defeat_subtitle')}</p>
          <button
            type="button"
            onClick={handleRestart}
            className="px-12 py-3 border border-red-500/30 hover:border-red-500 text-red-400 text-xs uppercase tracking-[0.6em] transition-all hover:bg-red-500/10 cursor-pointer"
          >
            {t('defense.restart')}
          </button>
        </motion.div>
      )}

      {/* Sector HP indicators - bottom bar */}
      {(phase === 'combat' || phase === 'prep') && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-4 px-8 py-3 bg-black/80 border-t border-emerald-500/10">
          {sectors.filter(s => s.active).map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{s.name}</span>
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    s.hp > 50 ? 'bg-emerald-500' : s.hp > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(s.hp / s.maxHp) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
