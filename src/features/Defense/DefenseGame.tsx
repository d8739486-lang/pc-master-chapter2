import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useDefenseStore, WAVE_CONFIG, WAVE_SECTOR_MAP, WAVE_ENEMY_TYPES,
  WEAPON_EFFECTIVENESS, WEAPON_SHOP, KILL_POINTS,
  type IAttack, type EnemyType, type WeaponType,
} from './useDefenseStore';
import { useGameStore, Screen } from '@/core/store';
import { audioManager } from '@/core/audio';
import { Shield, Zap, Skull, Heart, Target, Crosshair, Flame, BoxSelect } from 'lucide-react';
import { useI18n } from '@/core/i18n';

// @ts-ignore
import defendMusic from '@/textures/soundtracks/defend.mp3';

/** Weapon icon mapping */
const WEAPON_ICONS: Record<WeaponType, any> = {
  PISTOL: Crosshair,
  SHOTGUN: BoxSelect,
  SNIPER: Target,
  MINIGUN: Flame,
};

/** Weapon color mapping */
const WEAPON_COLORS: Record<WeaponType, string> = {
  PISTOL: 'text-red-400 border-red-500/40 bg-red-500/10',
  SHOTGUN: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
  SNIPER: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
  MINIGUN: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
};

/** Enemy color configs */
const ENEMY_COLORS: Record<EnemyType, { border: string; core: string; glow: string; bg: string }> = {
  DRONE:    { border: 'border-red-500/70',    core: 'bg-red-500',    glow: 'rgba(239,68,68,0.4)',   bg: 'bg-red-500/5' },
  SHIELD:   { border: 'border-blue-400/70',   core: 'bg-blue-400',  glow: 'rgba(96,165,250,0.4)',  bg: 'bg-blue-500/5' },
  STEALTH:  { border: 'border-purple-400/70', core: 'bg-purple-400',glow: 'rgba(192,132,252,0.4)', bg: 'bg-purple-500/5' },
  SPLITTER: { border: 'border-orange-400/70', core: 'bg-orange-400',glow: 'rgba(251,146,60,0.4)',  bg: 'bg-orange-500/5' },
  MINI:     { border: 'border-orange-300/70', core: 'bg-orange-300',glow: 'rgba(253,186,116,0.4)', bg: 'bg-orange-300/5' },
};

/** Smooth mouse follower reticle */
const MouseReticle = ({ weapon }: { weapon: WeaponType }) => {
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const reticleRef = useRef<HTMLDivElement>(null);
  const Icon = WEAPON_ICONS[weapon];
  const color = WEAPON_COLORS[weapon].split(' ')[0]; // Extract text color

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div 
      ref={reticleRef} 
      className="fixed top-0 left-0 w-12 h-12 -ml-6 -mt-6 z-9999 pointer-events-none transition-transform duration-75 ease-out flex items-center justify-center"
    >
      <div className={`relative flex items-center justify-center p-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm ${color}`}>
        <Icon className="w-5 h-5" />
        {/* Animated rings */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 border border-current rounded-full"
        />
        <div className="absolute -inset-4 border border-white/5 rounded-full" />
        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-current opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-current opacity-20" />
      </div>
    </div>
  );
};

/** Mini HP bar for enemies */
const EnemyHPBar = ({ hp, shieldHp, type, colorObj }: { 
  hp: number; 
  shieldHp: number; 
  type: EnemyType;
  colorObj: any;
}) => {
  const hasShield = type === 'SHIELD' && shieldHp > 0;
  // Total potential HP for the bar segments
  const totalHp = type === 'SHIELD' ? 2 : 1;
  
  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/60 rounded-full overflow-hidden border border-white/10">
      <div className="relative w-full h-full">
        {hasShield && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(shieldHp / totalHp) * 100}%` }}
            className="absolute left-0 top-0 h-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"
          />
        )}
        <motion.div 
          animate={{ 
            width: `${(hp / totalHp) * 100}%`,
            left: hasShield ? `${(shieldHp / totalHp) * 100}%` : '0%'
          }}
          className={`absolute top-0 h-full ${colorObj.core} shadow-[0_0_5px_currentcolor]`}
        />
      </div>
    </div>
  );
};

/**
 * AVALON DEFENSE — 5-wave sector defense mini-game
 * Now with 4 enemy types, weapon inventory, and between-wave shop.
 */
export const DefenseGame = () => {
  const { setScreen } = useGameStore();
  const {
    phase, wave, score, enemiesTotal, enemiesKilled, prepCountdown, sectors, attacks,
    bossHp, bossMaxHp, bossAttacks, bossVulnerable, vulnTimer, totalKills,
    inventory, activeSlot, showShop,
    setPhase, setWave, setEnemiesTotal, setEnemiesKilled, setPrepCountdown, addScore,
    setSectors, spawnAttack, removeAttack, advanceAttacks,
    setBossHp, damageBoss, setBossVulnerable, setVulnTimer,
    spawnBossAttack, removeBossAttack, advanceBossAttacks,
    clearAllAttacks, addKill, resetDefense,
    setActiveSlot, buyWeapon, setShowShop,
    getActiveWeapon,
  } = useDefenseStore();
  const { t } = useI18n();

  const gameLoopRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bossSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameRef = useRef<number>(0);
  const spawnCountRef = useRef<number>(0);

  const [showSubtitle, setShowSubtitle] = useState(false);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, color: string, vx: number, vy: number, size?: number}[]>([]);
  const [bossTimer, setBossTimer] = useState(10);
  const [explosion, setExplosion] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [damageFlash, setDamageFlash] = useState(false);
  const [radialFlashes, setRadialFlashes] = useState<{id: number, x: number, y: number}[]>([]);
  const [hitMarkers, setHitMarkers] = useState<{id: number, x: number, y: number, text: string, color: string}[]>([]);
  const particleIdRef = useRef(0);
  const prevSectorsHpRef = useRef<Record<number, number>>({});

  // ─── Keyboard: Weapon Switching (1-4) ────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (key >= '1' && key <= '4') {
        const slot = parseInt(key) - 1;
        setActiveSlot(slot);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setActiveSlot]);

  // ─── Helper: pick random enemy type for wave ────────────
  const pickEnemyType = useCallback((waveNum: number): EnemyType => {
    const types = WAVE_ENEMY_TYPES[waveNum] ?? ['DRONE'];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const startWave = useCallback((waveNum: number) => {
    setWave(waveNum);
    setPhase('prep');
    setPrepCountdown(3);
    setEnemiesKilled(0);
    setEnemiesTotal(WAVE_CONFIG[waveNum]?.attackCount || 10);
    spawnCountRef.current = 0;
    setShowShop(false);
    audioManager.countdown();

    if (waveNum === 1) {
      setShowSubtitle(true);
      setTimeout(() => setShowSubtitle(false), 8000);
    }

    // Activate correct sectors
    const activeSectorIds = WAVE_SECTOR_MAP[waveNum] ?? [1];
    const updatedSectors = useDefenseStore.getState().sectors.map(s => ({
      ...s,
      active: activeSectorIds.includes(s.id),
      hp: Math.min(s.maxHp, s.hp + s.maxHp * 0.2) 
    }));
    setSectors(updatedSectors);

    // Start spawning attacks when combat starts
    const cfg = WAVE_CONFIG[waveNum];
    if (!cfg) return;

    spawnTimerRef.current = setInterval(() => {
      const state = useDefenseStore.getState();
      if (spawnCountRef.current >= cfg.attackCount) {
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
        return;
      }
      if (state.phase !== 'combat') return;

      const activeSectors = state.sectors.filter(s => s.active);
      if (activeSectors.length === 0) return;

      spawnCountRef.current += 1;
      const target = activeSectors[Math.floor(Math.random() * activeSectors.length)];
      const angle = Math.random() * Math.PI * 2;
      const radius = 300 + Math.random() * 200;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const enemyType = pickEnemyType(waveNum);

      state.spawnAttack({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        targetSectorId: target.id,
        speed: enemyType === 'STEALTH' 
          ? cfg.speed * 1.3 + Math.random() * 0.003  // Stealth is faster
          : enemyType === 'SHIELD'
            ? cfg.speed * 0.7 + Math.random() * 0.002  // Shield is slower
            : cfg.speed + Math.random() * 0.003,
        size: enemyType === 'SPLITTER' ? 30 + Math.random() * 10 : 20 + Math.random() * 15,
        progress: 0,
        type: enemyType,
        shieldHp: enemyType === 'SHIELD' ? 1 : 0,
        hp: 1,
      });
    }, cfg.spawnInterval);
  }, [setWave, setPhase, setSectors, setEnemiesTotal, setEnemiesKilled, setPrepCountdown, setShowShop, pickEnemyType]);

  const handleRestart = useCallback(() => {
    resetDefense();
    const store = useGameStore.getState();
    store.setIsRestarting(false); 
    store.resetGame();
    setScreen(Screen.START);
  }, [resetDefense, setScreen]);

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

  // ─── Show hit marker ────────────────────────────────────
  const showHitMarker = useCallback((x: number, y: number, effectiveness: number) => {
    const text = effectiveness >= 2 ? 'CRIT!' : effectiveness <= 0.5 ? 'WEAK' : 'HIT';
    const color = effectiveness >= 2 ? 'text-yellow-400' : effectiveness <= 0.5 ? 'text-zinc-500' : 'text-white';
    const id = particleIdRef.current++;
    setHitMarkers(prev => [...prev, { id, x, y: y - 20, text, color }]);
    setTimeout(() => setHitMarkers(prev => prev.filter(h => h.id !== id)), 800);
  }, []);

  // ─── Click: Attack Enemy ────────────────────────────────
  const handleAttackClick = useCallback((attack: IAttack, e: React.MouseEvent) => {
    e.stopPropagation();
    const weapon = useDefenseStore.getState().getActiveWeapon();
    
    // Play correct firearm sound
    if (weapon === 'PISTOL') audioManager.weap1();
    else if (weapon === 'SHOTGUN') audioManager.weap2();
    else if (weapon === 'SNIPER') audioManager.weap3();
    else if (weapon === 'MINIGUN') audioManager.weap4();

    const effectiveness = WEAPON_EFFECTIVENESS[weapon]?.[attack.type] ?? 1;
    const pos = getAttackPosition(attack);
    
    showHitMarker(pos.x, pos.y, effectiveness);

    // MINIGUN vs SPLITTER: instant kill, no fragments
    if (weapon === 'MINIGUN' && attack.type === 'SPLITTER') {
      removeAttack(attack.id);
      addScore(KILL_POINTS[attack.type]);
      addKill();
      audioManager.destroy();
      spawnDestroyParticles(pos.x, pos.y, 'orange');
      return;
    }

    // SHOTGUN vs SHIELD: instantly break shield
    if (weapon === 'SHOTGUN' && attack.type === 'SHIELD' && attack.shieldHp > 0) {
      // Break shield and kill in one hit
      removeAttack(attack.id);
      addScore(KILL_POINTS[attack.type]);
      addKill();
      audioManager.destroy();
      spawnDestroyParticles(pos.x, pos.y, 'blue');
      return;
    }

    // SNIPER vs STEALTH: instant kill
    if (weapon === 'SNIPER' && attack.type === 'STEALTH') {
      removeAttack(attack.id);
      addScore(KILL_POINTS[attack.type]);
      addKill();
      audioManager.destroy();
      spawnDestroyParticles(pos.x, pos.y, 'purple');
      return;
    }

    // Handle SHIELD enemies (need to break shield first)
    if (attack.type === 'SHIELD' && attack.shieldHp > 0) {
      const dmg = effectiveness >= 2 ? 1 : effectiveness <= 0.5 ? 0.25 : 0.5;
      const newShieldHp = attack.shieldHp - dmg;
      if (newShieldHp <= 0) {
        // Shield broken, update attack
        const updatedAttacks = useDefenseStore.getState().attacks.map(a =>
          a.id === attack.id ? { ...a, shieldHp: 0 } : a
        );
        useDefenseStore.setState({ attacks: updatedAttacks });
        audioManager.delete();
        spawnDestroyParticles(pos.x, pos.y, 'blue');
      } else {
        const updatedAttacks = useDefenseStore.getState().attacks.map(a =>
          a.id === attack.id ? { ...a, shieldHp: newShieldHp } : a
        );
        useDefenseStore.setState({ attacks: updatedAttacks });
        audioManager.click();
      }
      return;
    }

    // Standard damage calculation
    const baseDmg = 1;
    const totalDmg = baseDmg * effectiveness;
    const newHp = attack.hp - totalDmg;

    if (newHp <= 0) {
      // SPLITTER: spawn 2 mini drones on death
      if (attack.type === 'SPLITTER') {
        removeAttack(attack.id);
        addScore(KILL_POINTS.SPLITTER);
        addKill();
        audioManager.destroy();
        spawnDestroyParticles(pos.x, pos.y, 'orange');
        
        // Spawn 2 mini drones
        const state = useDefenseStore.getState();
        for (let i = 0; i < 2; i++) {
          const offset = i === 0 ? -30 : 30;
          state.spawnAttack({
            x: pos.x + offset,
            y: pos.y + (Math.random() - 0.5) * 20,
            targetSectorId: attack.targetSectorId,
            speed: attack.speed * 1.3,
            size: 14,
            progress: attack.progress,
            type: 'MINI',
            shieldHp: 0,
            hp: 1,
          });
        }
        // Increase total enemies by 2 (for the minis), decrease by 1 (splitter died)
        const st = useDefenseStore.getState();
        useDefenseStore.setState({ enemiesTotal: st.enemiesTotal + 2 });
        return;
      }

      // Normal kill
      removeAttack(attack.id);
      addScore(KILL_POINTS[attack.type]);
      addKill();
      audioManager.destroy();
      spawnDestroyParticles(pos.x, pos.y, attack.type === 'STEALTH' ? 'purple' : 'red');
    } else {
      // Partial damage
      const updatedAttacks = useDefenseStore.getState().attacks.map(a =>
        a.id === attack.id ? { ...a, hp: newHp } : a
      );
      useDefenseStore.setState({ attacks: updatedAttacks });
      audioManager.click();
    }
  }, [removeAttack, addScore, addKill, showHitMarker]);

  /** Spawn colored explosion particles */
  const spawnDestroyParticles = useCallback((x: number, y: number, colorKey: string) => {
    const colorMap: Record<string, string[]> = {
      red: ['bg-red-500', 'bg-red-400', 'bg-orange-500'],
      blue: ['bg-blue-400', 'bg-blue-500', 'bg-cyan-400'],
      purple: ['bg-purple-400', 'bg-purple-500', 'bg-violet-400'],
      orange: ['bg-orange-400', 'bg-orange-500', 'bg-amber-400'],
    };
    const colors = colorMap[colorKey] ?? colorMap.red;
    const newParticles: typeof particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      newParticles.push({
        id: particleIdRef.current++,
        x, y,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const handleBossAttackClick = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Play correct firearm sound
    const weapon = useDefenseStore.getState().getActiveWeapon();
    if (weapon === 'PISTOL') audioManager.weap1();
    else if (weapon === 'SHOTGUN') audioManager.weap2();
    else if (weapon === 'SNIPER') audioManager.weap3();
    else if (weapon === 'MINIGUN') audioManager.weap4();

    removeBossAttack(id);
    addScore(15);
    addKill();
    audioManager.destroy(); // Stronger impact for boss projectiles

    const remaining = useDefenseStore.getState().bossAttacks.length;
    if (remaining <= 1) {
      if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
      setBossVulnerable(true);
      setVulnTimer(10);
      setPhase('boss_vulnerable');
    }
  }, [removeBossAttack, addScore, addKill, setBossVulnerable, setVulnTimer, setPhase]);

  const handleBossClick = useCallback((e: React.MouseEvent) => {
    if ((phase !== 'boss' && phase !== 'boss_vulnerable') || bossHp <= 0) return;
    
    // Play correct firearm sound - REMOVED for DD server clicks as per user request
    const weapon = useDefenseStore.getState().getActiveWeapon();
    
    damageBoss(1);
    addScore(100);
    
    const x = e.clientX;
    const y = e.clientY;
    
    const fireColors = ['bg-red-500', 'bg-orange-500', 'bg-orange-400', 'bg-yellow-500', 'bg-amber-500'];
    const smokeColors = ['bg-zinc-400', 'bg-zinc-500', 'bg-zinc-600', 'bg-zinc-700'];
    const electricColors = ['bg-cyan-400', 'bg-blue-400', 'bg-white'];
    const allColors = [...fireColors, ...fireColors, ...smokeColors, ...electricColors];
    
    const newParticles: typeof particles = [];
    const particleCount = bossHp <= 5 ? 30 : bossHp <= 15 ? 20 : 14;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      const isSpark = Math.random() > 0.6;
      newParticles.push({
        id: particleIdRef.current++,
        x, y,
        vx: Math.cos(angle) * speed * (isSpark ? 1.5 : 1),
        vy: Math.sin(angle) * speed - 2,
        color: allColors[Math.floor(Math.random() * allColors.length)],
        size: isSpark ? 2 : (3 + Math.random() * 4)
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    setRadialFlashes(prev => [...prev, { id: particleIdRef.current++, x, y }]);
    setTimeout(() => setRadialFlashes(prev => {
      const next = [...prev];
      next.shift();
      return next;
    }), 400);
    
    const shakeIntensity = bossHp <= 5 ? 12 : bossHp <= 15 ? 6 : 3;
    setScreenShake(shakeIntensity);
    setTimeout(() => setScreenShake(0), 150);

    if (bossHp <= 1) {
      setExplosion(true);
      setTimeout(() => {
        setScreen(Screen.ENDING);
      }, 1000);
    }
  }, [phase, bossHp, damageBoss, addScore, setScreen]);

  // Shake and flash screen on sector damage
  useEffect(() => {
    if (phase !== 'combat') return;
    
    let tookDamage = false;
    sectors.forEach(s => {
      if (prevSectorsHpRef.current[s.id] !== undefined && s.hp < prevSectorsHpRef.current[s.id]) {
        tookDamage = true;
      }
      prevSectorsHpRef.current[s.id] = s.hp;
    });

    if (tookDamage) {
      setDamageFlash(true);
      setScreenShake(8);
      setTimeout(() => {
        setDamageFlash(false);
        setScreenShake(0);
      }, 150);
    }
  }, [sectors, phase]);

  // Start defense music & cleanup on unmount
  useEffect(() => {
    audioManager.stopAllLoops();
    audioManager.stopMusic();
    const cleanupMusic = audioManager.defend();

    return () => {
      if (cleanupMusic) cleanupMusic();
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
      return () => {
        clearTimeout(t);
      };
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
      
      // Advance particles
      setParticles(prev => {
        if (prev.length === 0) return prev;
        return prev.map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 0.2 * dt
        })).filter(p => p.y < window.innerHeight + 100);
      });
      
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
        if (!cfg) return;
        if (state.enemiesKilled >= state.enemiesTotal && state.attacks.length === 0) {
          clearInterval(checkWaveCleared);
          if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
          
          audioManager.cmdT();
          if (state.wave >= 5) {
            setPhase('boss_intro');
          } else {
            setPhase('wave_clear');
            const hasSpace = state.inventory.includes(null);
            if (hasSpace) {
              setShowShop(true);
            }
          }
        }
      }, 500);
      return () => clearInterval(checkWaveCleared);
    }
  }, [phase, wave, setPhase, setShowShop]);

  // Prep countdown logic (3-2-1) — extended to 8s during wave_clear for shop
  useEffect(() => {
    if (phase === 'prep' || phase === 'wave_clear') {
      const countdownStart = phase === 'wave_clear' ? 6 : 3;
      if (useDefenseStore.getState().prepCountdown !== countdownStart) {
        setPrepCountdown(countdownStart);
      }
      
      const timer = setInterval(() => {
        const state = useDefenseStore.getState();
        if (state.prepCountdown > 1) {
          setPrepCountdown(state.prepCountdown - 1);
        } else {
          clearInterval(timer);
          if (phase === 'wave_clear') {
            setShowShop(false);
            startWave(wave + 1);
          } else {
            audioManager.spawn();
            setPhase('combat');
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, wave, setPhase, setPrepCountdown, startWave, setShowShop]);

  // Boss intro → boss fight after 4s
  useEffect(() => {
    if (phase === 'boss_intro') {
      const t = setTimeout(() => {
        setPhase('boss');
        setBossHp(40);
        setBossTimer(15);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [phase, setBossHp, startBossSpawn]);

  // Boss timer logic
  useEffect(() => {
    if (phase === 'boss' && bossTimer > 0) {
      const timer = setInterval(() => {
        setBossTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('defeat');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, bossTimer]);

  // Check boss death → Straight to Victory/Ending whiteout
  useEffect(() => {
    if ((phase === 'boss' || phase === 'boss_vulnerable') && bossHp <= 0) {
      if (bossSpawnRef.current) clearInterval(bossSpawnRef.current);
      clearAllAttacks();
      audioManager.stopMusic();
      audioManager.cmdT();
      
      setExplosion(true);
      setTimeout(() => {
        setScreen(Screen.ENDING);
      }, 1000);
    }
  }, [bossHp, phase, setScreen, clearAllAttacks]);

  // Check defeat
  useEffect(() => {
    if (phase === 'defeat') {
      audioManager.stopAllLoops();
      audioManager.stopMusic();
      audioManager.lose();
    }
  }, [phase]);

  // --- Sector Positions (circle layout) ---
  const getSectorPosition = (_index: number) => {
    return {
      left: `50%`,
      top: `50%`,
    };
  };

  // Attack position interpolation
  const getAttackPosition = (attack: IAttack) => {
    const sectorIdx = sectors.findIndex(s => s.id === attack.targetSectorId);
    const sectorPos = getSectorPosition(sectorIdx);
    const targetX = parseFloat(sectorPos.left) / 100 * window.innerWidth;
    const targetY = parseFloat(sectorPos.top) / 100 * window.innerHeight;

    const x = attack.x + (targetX - attack.x) * attack.progress;
    const y = attack.y + (targetY - attack.y) * attack.progress;
    return { x, y };
  };

  // ─── Shop handler ─────────────────────────────────────
  const handleBuyWeapon = useCallback((weaponType: WeaponType, cost: number) => {
    const success = buyWeapon(weaponType, cost);
    if (success) {
      audioManager.buy();
    } else {
      audioManager.unbuy();
    }
  }, [buyWeapon]);

  // ─── Get active weapon for rendering ───────────────────
  const currentWeapon = inventory[activeSlot] ?? 'PISTOL';

  return (
    <div className={`fixed inset-0 bg-black overflow-hidden select-none font-mono ${ (phase === 'combat') ? 'cursor-none' : '' }`}
         style={{ 
           transform: screenShake ? `translate(${(Math.random() - 0.5) * screenShake}px, ${(Math.random() - 0.5) * screenShake}px)` : 'none',
           transition: screenShake ? 'none' : 'transform 0.1s ease-out'
         }}>
      
       {/* Red flash on damage */}
       <AnimatePresence>
         {damageFlash && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 0.3 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-red-600/30 z-60 pointer-events-none"
           />
         )}
       </AnimatePresence>

      {/* Ambient grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(16,185,129,0.3) 40px, rgba(16,185,129,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(16,185,129,0.3) 40px, rgba(16,185,129,0.3) 41px)' }}
      />

      {/* ═══ CUSTOM RETICLE ═══ */}
      {(phase === 'combat') && (
        <MouseReticle weapon={currentWeapon} />
      )}

      {/* HUD - Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4 bg-black/80 border-b border-emerald-500/20">
        <div className="flex items-center gap-6">
          <div className="text-emerald-500 text-xs uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>ВОЛНА {wave}/5</span>
          </div>
          <div className="text-zinc-400 text-xs uppercase tracking-widest">
            {t('defense.hud_score', { n: score })}
          </div>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">
            {t('defense.hud_kills', { n: totalKills })}
          </div>
          {phase === 'combat' && wave > 0 && (
            <div className="text-emerald-400 text-xs uppercase tracking-widest font-black ml-4 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
              {Math.max(0, enemiesTotal - enemiesKilled)} left
            </div>
          )}
        </div>
        {phase === 'prep' && (
          <div className="text-emerald-400 text-xs uppercase tracking-widest font-bold animate-pulse">
            GET READY
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

      {(phase === 'combat' || phase === 'prep' || phase === 'wave_clear') && (
        <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-auto">
          {/* Top selection line that moves smoothly */}
          <div className="relative h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden mb-1">
            <motion.div 
              animate={{ x: activeSlot * 64 + (activeSlot * 8) }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-16 h-full bg-white shadow-[0_0_10px_white]"
            />
          </div>

          <div className="flex gap-2">
            {inventory.map((weapon, idx) => {
              const isActive = idx === activeSlot;
              const Icon = weapon ? WEAPON_ICONS[weapon] : null;
              const colorClass = weapon ? WEAPON_COLORS[weapon] : '';
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlot(idx)}
                  className={`relative w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 cursor-pointer ${
                    weapon === null 
                      ? 'border-zinc-700/40 bg-zinc-900/60 opacity-40'
                      : isActive
                        ? `${colorClass} border-opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-110 z-10`
                        : `${colorClass} border-opacity-40 opacity-60 hover:opacity-80`
                  }`}
                  aria-label={`Weapon slot ${idx + 1}`}
                >
                  {/* Slot number */}
                  <span className="absolute -top-2 -left-1 text-[9px] text-white/50 font-bold bg-black/80 px-1 rounded">
                    {idx + 1}
                  </span>
                  
                  {Icon ? (
                    <>
                      <Icon className="w-5 h-5" />
                      <span className="text-[7px] uppercase tracking-wider opacity-70">{weapon}</span>
                    </>
                  ) : (
                    <span className="text-[8px] text-zinc-600 uppercase">Empty</span>
                  )}

                  {/* Active indicator */}
                  {isActive && weapon && (
                    <motion.div 
                      layoutId="activeWeaponGlow"
                      className="absolute inset-0 bg-white/5 rounded-lg"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ SHOP OVERLAY — During wave_clear ═══ */}
      <AnimatePresence>
        {showShop && phase === 'wave_clear' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm"
          >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="flex flex-col items-center gap-6 max-w-2xl"
              >
                {/* Shop Header */}
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-2xl font-black uppercase tracking-[0.5em] text-emerald-400">
                    {t('defense.shop_title')}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-xs uppercase tracking-widest">
                      {t('defense.shop_credits')}: 
                    </span>
                    <span className="text-emerald-400 text-lg font-black">{score}</span>
                  </div>
                </div>

                {/* Weapon Cards */}
                <div className="flex gap-4">
                  {WEAPON_SHOP.map(({ type, cost, icon }) => {
                    const owned = inventory.includes(type);
                    const canAfford = score >= cost;
                    const noSlots = !inventory.includes(null);
                    const Icon = WEAPON_ICONS[type];
                    const colorClass = WEAPON_COLORS[type];
                    
                    // Sequential logic:
                    // SHOTGUN: always open
                    // SNIPER: requires SHOTGUN
                    // MINIGUN: requires SNIPER
                    const isSequenceLocked = (
                      (type === 'SNIPER' && !inventory.includes('SHOTGUN')) ||
                      (type === 'MINIGUN' && !inventory.includes('SNIPER'))
                    );

                    // Recommendation logic based on upcoming wave
                    const nextWave = wave + 1;
                    const isRecommended = (
                      (nextWave === 2 && type === 'SHOTGUN') || 
                      (nextWave === 3 && type === 'SNIPER')  || 
                      (nextWave === 4 && type === 'MINIGUN')
                    );
                    
                    return (
                      <motion.div key={type} className="relative group">
                        {isRecommended && !owned && !isSequenceLocked && (
                          <motion.div
                            initial={{ opacity: 0, y: 12, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            className="absolute -top-4 left-1/2 z-10 whitespace-nowrap pointer-events-none"
                          >
                            <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] tracking-tighter ring-1 ring-emerald-400">
                              {t('defense.recommended') || 'РЕКОМЕНДУЕМ'}
                            </span>
                          </motion.div>
                        )}
                        
                        <motion.button
                          type="button"
                          whileHover={!owned && canAfford && !isSequenceLocked ? { scale: 1.05 } : {}}
                          whileTap={!owned && canAfford && !isSequenceLocked ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (owned || noSlots || isSequenceLocked) return;
                            if (!canAfford) {
                              audioManager.unbuy();
                            } else {
                              handleBuyWeapon(type, cost);
                            }
                          }}
                          className={`relative w-44 rounded-xl border-2 p-5 flex flex-col items-center gap-4 transition-all duration-300 ${
                            owned 
                              ? 'border-emerald-500/30 bg-emerald-500/5 opacity-50 cursor-not-allowed'
                              : isSequenceLocked
                                ? 'border-zinc-800 bg-black/40 opacity-40 cursor-not-allowed grayscale'
                                : canAfford && !noSlots
                                  ? `${colorClass} hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.2)]`
                                  : 'border-zinc-700/30 bg-zinc-900/40 opacity-30 cursor-pointer'
                          }`}
                        >
                          {/* Icon Container */}
                          <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-transform duration-500 ${!isSequenceLocked ? 'group-hover:scale-110' : ''} ${isSequenceLocked ? 'border-zinc-700 text-zinc-600' : colorClass}`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          {/* Weapon Name */}
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black uppercase tracking-widest leading-none truncate w-full text-center">
                              {type}
                            </span>
                            {isSequenceLocked && (
                               <span className="text-[7px] text-red-500/60 uppercase mt-1 font-bold">
                                 Requires {type === 'SNIPER' ? 'SHOTGUN' : 'SNIPER'}
                               </span>
                            )}
                          </div>
                          
                          {/* Effectiveness hints */}
                          {!isSequenceLocked && (
                            <div className="text-[9px] text-zinc-500 space-y-0.5 w-full flex flex-col items-center">
                              {Object.entries(WEAPON_EFFECTIVENESS[type])
                                .filter(([enemyType]) => enemyType !== 'MINI')
                                .map(([enemyType, mult]) => (
                                <div key={enemyType} className={`flex items-center gap-1 ${mult >= 2 ? 'text-emerald-400 font-bold' : mult <= 0.5 ? 'text-red-400/80' : 'text-zinc-600'}`}>
                                  <span className="text-[7px]">{mult >= 2 ? '▲' : mult <= 0.5 ? '▼' : '●'}</span>
                                  <span className="tracking-tighter opacity-80">{enemyType}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Price / Status */}
                          <div className="mt-auto pt-3 w-full border-t border-white/5 flex justify-center">
                            {owned ? (
                              <span className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold opacity-80">{t('defense.shop_owned')}</span>
                            ) : isSequenceLocked ? (
                               <span className="text-zinc-600 text-[9px] uppercase font-bold">Locked</span>
                            ) : (
                              <span className={`text-xs font-black tracking-widest ${canAfford ? 'text-white' : 'text-red-500'}`}>
                                {cost} <span className="text-[8px] opacity-60 ml-0.5">{t('defense.shop_pts')}</span>
                              </span>
                            )}
                          </div>
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>

              {/* Countdown */}
              <div className="text-zinc-600 text-xs uppercase tracking-widest mt-4">
                {t('defense.shop_closing')} {prepCountdown}s
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className={`w-[80vw] max-w-[1200px] h-[80vh] max-h-[800px] rounded-3xl border-2 flex flex-col items-center justify-center transition-all overflow-hidden relative ${
                sector.active 
                  ? hpPercent > 50 ? 'border-emerald-500/50 bg-emerald-950/10 shadow-[0_0_80px_rgba(16,185,129,0.1)]'
                    : hpPercent > 25 ? 'border-yellow-500/50 bg-yellow-950/10 shadow-[0_0_80px_rgba(234,179,8,0.1)]'
                    : 'border-red-500/50 bg-red-950/20 shadow-[0_0_100px_rgba(239,68,68,0.2)] animate-pulse'
                  : 'border-zinc-700/30 bg-zinc-900/20'
              }`}>
                {sector.active && (
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />
                )}
                
                {sector.active && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 border-2 border-dashed border-white/20 relative flex flex-col items-center justify-center"
                  >
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white/60" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-white/60" />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-white/60" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white/60" />

                    <span className="text-[20px] uppercase tracking-widest text-white/60 font-black relative z-10">{sector.name}</span>
                    <span className="text-sm text-white/40 mt-2 relative z-10">{Math.round(hpPercent)}%</span>
                  </motion.div>
                )}

                {!sector.active && (
                   <span className="text-[20px] uppercase tracking-widest text-white/30 font-black">{sector.name}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ═══ ENEMIES — Type-based rendering ═══ */}
      {phase === 'combat' && attacks.map(attack => {
        const pos = getAttackPosition(attack);
        const ec = ENEMY_COLORS[attack.type];
        const droneSize = attack.type === 'MINI' ? attack.size + 10 : attack.size + 24;
        const rotationDir = (attack.id % 2 === 0 ? 1 : -1);
        const rotationSpeed = 2 + (attack.id % 5) * 0.5;
        
        // Stealth: cycle opacity (revealed by SNIPER optical sight)  
        const isStealthDimmed = attack.type === 'STEALTH' && currentWeapon !== 'SNIPER';
        
        return (
          <motion.button
            key={attack.id}
            type="button"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              opacity: isStealthDimmed ? [0.2, 0.8, 0.2] : 1,
            }}
            transition={isStealthDimmed ? { opacity: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' } } : {}}
            exit={{ opacity: 0, scale: 0.3 }}
            onClick={(e) => handleAttackClick(attack, e)}
            style={{ left: pos.x, top: pos.y, width: droneSize, height: droneSize }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-crosshair z-20 group"
            aria-label={`Destroy ${attack.type}`}
          >
            {/* Outer shell */}
            <div className={`absolute inset-0 border-2 ${ec.border} rounded-lg ${attack.type === 'SPLITTER' ? '' : 'rotate-45'} group-hover:scale-110 transition-all duration-150`}
                 style={{ boxShadow: `0 0 12px ${ec.glow}` }}
            />
            
            {/* SHIELD: extra shield ring */}
            {attack.type === 'SHIELD' && attack.shieldHp > 0 && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                className="absolute -inset-1 border-2 border-blue-400/60 rounded-full"
                style={{ boxShadow: '0 0 8px rgba(96,165,250,0.3)' }}
              />
            )}

            {/* SPLITTER: dual inner dots */}
            {attack.type === 'SPLITTER' && (
              <>
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-300 rounded-full" />
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-300 rounded-full" />
              </>
            )}
            
            {/* Inner rotating ring */}
            <motion.div
              animate={{ rotate: 360 * rotationDir }}
              transition={{ repeat: Infinity, duration: rotationSpeed, ease: 'linear' }}
              className={`absolute inset-1.5 border ${ec.border} rounded-full opacity-40`}
            />
            
            {/* Pulsating core */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 ${ec.core} rounded-full`}
              style={{ boxShadow: `0 0 10px ${ec.glow}, 0 0 20px ${ec.glow.replace('0.4', '0.2')}` }}
            />
            
            {/* STEALTH scanline overlay */}
            {attack.type === 'STEALTH' && (
              <div className="absolute inset-0 rounded-lg overflow-hidden opacity-50 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(192,132,252,0.2) 2px, rgba(192,132,252,0.2) 4px)' }} />
              </div>
            )}

            {/* Glitch effect */}
            <motion.div 
              animate={{ opacity: [0, 0.4, 0], x: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2, times: [0, 0.05, 0.1, 1] }}
              className={`absolute inset-0 ${ec.bg} pointer-events-none`}
            />

            {/* Corner accents */}
            <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-t border-l ${ec.border}`} />
            <div className={`absolute top-0 right-0 w-1.5 h-1.5 border-t border-r ${ec.border}`} />
            <div className={`absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l ${ec.border}`} />
            <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r ${ec.border}`} />
            
            {/* Trail glow */}
            <div className={`absolute -inset-2 ${ec.bg} rounded-full blur-md group-hover:opacity-100 opacity-50 transition-all pointer-events-none`} />

            {/* HP Bar */}
            <EnemyHPBar hp={attack.hp} shieldHp={attack.shieldHp} type={attack.type} colorObj={ec} />

            {/* Enemy type label (tiny) */}
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-wider opacity-40 whitespace-nowrap pointer-events-none">
              {attack.type}
            </span>
          </motion.button>
        );
      })}

      {/* Hit Markers */}
      <AnimatePresence>
        {hitMarkers.map(h => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: 0, scale: 1.2 }}
            animate={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className={`absolute ${h.color} text-[10px] font-black uppercase tracking-widest pointer-events-none z-30`}
            style={{ left: h.x, top: h.y }}
          >
            {h.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Explosion Particles */}
      <AnimatePresence>
         {particles.map(p => (
           <motion.div
             key={p.id}
             initial={{ opacity: 1, scale: 1.5 }}
             animate={{ opacity: 0, scale: 0 }}
             transition={{ duration: 0.6 + Math.random() * 0.5 }}
             className={`absolute ${p.color} rounded-sm rotate-45 pointer-events-none z-10`}
             style={{ 
               left: p.x, 
               top: p.y,
               width: p.size ?? 3,
               height: p.size ?? 3,
               boxShadow: p.color.includes('white') || p.color.includes('cyan') 
                 ? '0 0 6px rgba(255,255,255,0.8)' 
                 : p.color.includes('orange') || p.color.includes('yellow') || p.color.includes('amber')
                   ? '0 0 8px rgba(255,150,0,0.6)' 
                   : 'none'
             }}
           />
         ))}
      </AnimatePresence>

      {/* Radial Flash Effects (on boss hit) */}
      <AnimatePresence>
        {radialFlashes.map(f => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0.8, scale: 0 }}
            animate={{ opacity: 0, scale: 3 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ left: f.x, top: f.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none z-15"
          >
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(255,200,50,0.6)_0%,rgba(255,100,0,0.3)_40%,transparent_70%)]" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Final Boss: Server Tower */}
      <AnimatePresence>
        {(phase === 'boss' || phase === 'boss_vulnerable') && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            {/* Countdown Overlay */}
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-32 left-1/2 -translate-x-1/2 flex flex-col items-center"
            >
              <span className="text-red-500 font-mono text-[10px] tracking-[0.4em] uppercase mb-2">Shutdown Sequence Initiated</span>
              <span className="text-white font-black text-5xl tracking-widest">{bossTimer}s</span>
            </motion.div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative p-1 pointer-events-none"
            >
               {/* THE SERVER TOWER */}
               <motion.button
                 type="button"
                 onClick={handleBossClick}
                 className="group relative w-64 h-[400px] bg-zinc-900 border-x-4 border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden"
                 style={{
                   backgroundImage: `linear-gradient(to bottom, #18181b 0%, #09090b 100%)`
                 }}
                 animate={bossHp <= 10 ? { x: [-2, 2, -2, 2, 0], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] } : {}}
                 transition={{ repeat: Infinity, duration: 0.1 }}
               >
                 {/* Server Trays */}
                 {[...Array(12)].map((_, i) => (
                   <div key={i} className="w-full h-8 border-b border-white/5 flex items-center px-4 justify-between">
                     <div className="flex gap-1">
                        <div className={`w-1 h-1 rounded-full ${bossHp < (25 - i) ? 'bg-zinc-700' : 'bg-emerald-500 shadow-[0_0_5px_emerald]'}`} />
                        <div className={`w-1 h-1 rounded-full ${bossHp < (20 - i) ? 'bg-zinc-700' : 'bg-red-500/50'}`} />
                     </div>
                     <div className="h-[2px] w-12 bg-white/5 rounded-full" />
                   </div>
                 ))}

                 <div className="absolute top-4 left-0 right-0 flex flex-col items-center">

                    <div className="w-12 h-1 bg-emerald-500/20 rounded-full" />
                 </div>

                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className={`text-5xl font-black transition-all ${bossHp <= 10 ? 'text-red-500 scale-125 animate-pulse' : 'text-white/20'}`}>DD</div>
                    <div className="text-[8px] text-white/10 tracking-[1em] mt-2 font-mono">CORE_ARCHITECT</div>
                 </div>

                 {bossHp <= 25 && <div className="absolute inset-0 bg-red-950/10 mix-blend-overlay pointer-events-none" />}
                 {bossHp <= 20 && <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,100,0,0.1),transparent_50%)] pointer-events-none" />}
                 {bossHp <= 15 && <div className="absolute inset-0 border-4 border-red-500/20 animate-pulse pointer-events-none" />}
                 {bossHp <= 10 && (
                   <motion.div 
                     animate={{ opacity: [0.2, 0.5, 0.2] }} 
                     transition={{ repeat: Infinity, duration: 0.2 }}
                     className="absolute inset-0 bg-red-600/20 pointer-events-none flex items-center justify-center"
                   >
                     <span className="text-white font-black text-2xl uppercase tracking-tighter opacity-40">CRITICAL</span>
                   </motion.div>
                 )}
                 {bossHp <= 5 && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />}
                 
                 <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] group-hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.1)] transition-shadow" />
               </motion.button>

               <div className="absolute -right-20 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                 <span className="text-[8px] text-white/40 uppercase tracking-widest leading-none mb-2">Integrity</span>
                 <div className="w-1 h-32 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="w-full bg-red-500" 
                      animate={{ height: `${(bossHp / bossMaxHp) * 100}%` }}
                    />
                 </div>
                 <span className="text-white font-bold text-xs mt-2">{Math.round((bossHp / bossMaxHp) * 100)}%</span>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Explosion Transition Overlay */}
      <AnimatePresence>
        {explosion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeIn" }}
            className="fixed inset-0 bg-white z-9999"
          />
        )}
      </AnimatePresence>

      {/* Subtitles */}
      <AnimatePresence>
        {showSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-black/90 border border-white/20 rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.05)] max-w-2xl text-center pointer-events-none"
          >
            <p className="text-white font-mono text-[11px] uppercase tracking-widest leading-relaxed">
              {t('defense.subtitle_msg')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            key="intro"
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

        {phase === 'prep' && (
          <motion.div
            key="prep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl font-black text-emerald-500 uppercase tracking-[0.3em] mb-4">
                {t('defense.wave_title', { n: wave })}
              </div>
              <div className="text-8xl font-black text-white/20 mb-8 font-mono">
                {prepCountdown}
              </div>
              <p className="text-zinc-400 text-sm tracking-widest uppercase">
                {t('defense.active_sectors', { n: (WAVE_SECTOR_MAP[wave] ?? [1]).length })}
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === 'wave_clear' && !showShop && (
          <motion.div
            key="wave_clear"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 pointer-events-none"
          >
            <h2 className="text-4xl font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">{t('defense.wave_cleared', { n: wave })}</h2>
            <div className="text-6xl font-black text-white/20 font-mono">
              {prepCountdown}
            </div>
            <p className="text-zinc-500 text-sm tracking-widest uppercase mt-4">{t('defense.next_wave')}</p>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* BIG Sector HP indicators - Bottom Center HUD */}
      {(phase === 'combat' || phase === 'prep') && (
        <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-end pb-8 bg-linear-to-t from-black/80 to-transparent pointer-events-none">
          {sectors.filter(s => s.active).map(s => {
             const hpPercent = (s.hp / s.maxHp) * 100;
             return (
               <div key={s.id} className="flex flex-col items-center gap-3 w-full max-w-2xl px-10">
                 <div className="flex w-full justify-between items-end px-2">
                   <span className="text-xl text-white/80 font-black uppercase tracking-[0.5em]">{s.name}_SECTOR</span>
                   <span className={`text-2xl font-bold tracking-widest ${hpPercent > 50 ? 'text-emerald-400' : hpPercent > 25 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`}>
                     {Math.round(hpPercent)}%
                   </span>
                 </div>
                 <div className="w-full h-6 bg-black/80 border-2 border-zinc-800 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] p-1">
                   <div 
                     className={`h-full rounded-sm transition-all duration-300 relative overflow-hidden ${
                       hpPercent > 50 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 
                       hpPercent > 25 ? 'bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.5)]' : 
                       'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                     }`}
                     style={{ width: `${hpPercent}%` }}
                   >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-size-[20px_20px] animate-[slide_1s_linear_infinite]" />
                   </div>
                 </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
};
