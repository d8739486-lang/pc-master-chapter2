import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useModalStore, MODAL_TYPES } from '@/core/useModalStore';
import { audioManager } from '@/core/audio';
import { Settings } from 'lucide-react';
import { useI18n } from '@/core/i18n';

// Glitch code removed

interface IBoltData {
  id: number;
  path: string;
  branches: string[];
  opacity: number;
}

interface ISpark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const ButtonLightningBolts = ({ active }: { active: boolean }) => {
  const [bolts, setBolts] = useState<string[]>([]);

  useEffect(() => {
    if (!active) return; // Wait to unmount naturally via AnimatePresence

    const updateBolts = () => {
      const newBolts = [...Array(5)].map((_, i) => {
        const side = i % 4; // 0: top, 1: right, 2: bottom, 3: left
        let x = 0, y = 0;
        const segments = 4;
        const points: string[] = [];
        
        // Random start on button edge
        if (side === 0) { x = Math.random() * 400; y = 0; }
        else if (side === 1) { x = 400; y = Math.random() * 80; }
        else if (side === 2) { x = Math.random() * 400; y = 80; }
        else { x = 0; y = Math.random() * 80; }
        
        points.push(`${x},${y}`);
        for (let s = 1; s <= segments; s++) {
          x += (Math.random() - 0.5) * 80;
          y += (Math.random() - 0.5) * 80;
          points.push(`${x},${y}`);
        }
        return points.join(' ');
      });
      setBolts(newBolts);
    };

    updateBolts();
    const interval = setInterval(updateBolts, 60);
    return () => clearInterval(interval);
  }, [active]);

  if (bolts.length === 0) return null;

  return (
    <div className="absolute -inset-10 z-30 pointer-events-none">
      <svg viewBox="-50 -50 500 180" className="w-full h-full preserve-3d overflow-visible">
        <filter id="bolt-glow">
          <feGaussianBlur stdDeviation="2.5" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        {bolts.map((path, i) => (
          <motion.polyline
            key={`${i}-${path.length}`} // Key change triggers re-render
            points={path}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            filter="url(#bolt-glow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </svg>
    </div>
  );
};

/**
 * High-Performance Rain & Spark Particle System
 */
export const WeatherEffect = ({ triggerSparks, burstPos }: { triggerSparks: number; burstPos?: { x: number, y: number } }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<ISpark[]>([]);
  const nextSparkId = useRef(0);
  const lastTriggered = useRef(0);
  const isInitial = useRef(true);

  // Spark burst logic
  useEffect(() => {
    if (triggerSparks > lastTriggered.current) {
        lastTriggered.current = triggerSparks;
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Custom position or floor
        const bx = burstPos?.x ?? w / 2;
        const by = burstPos?.y ?? h - 10;
        
        // Massive burst of sparks
        for (let i = 0; i < 150; i++) {
            sparksRef.current.push({
                id: nextSparkId.current++,
                x: bx,
                y: by,
                vx: (Math.random() - 0.5) * 35,
                vy: (Math.random() - 0.5) * 35, // Omni-directional burst if it's on button
                life: 1.0 + Math.random() * 0.5
            });
        }
    }
  }, [triggerSparks, burstPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles: { x: number; y: number; l: number; v: number }[] = [];
    for (let i = 0; i < 350; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 30 + 15,
        v: Math.random() * 20 + 15
      });
    }

    const handleResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      canvas.width = nw;
      canvas.height = nh;
      // Re-populate if needed, or just let them flow
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      
      // Draw Rain
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + 3, p.y + p.l);
        ctx.stroke();
        p.y += p.v;
        p.x += 3;
        if (p.y > ch) { p.y = -p.l; p.x = Math.random() * cw; }
        if (p.x > cw) p.x = 0;
      });

      // Draw Sparks (Electrical Yellow/White)
      sparksRef.current.forEach((s, idx) => {
          ctx.strokeStyle = `rgba(255, 255, 180, ${s.life})`; // Bright electrical yellow
          ctx.lineWidth = 4; // Thicker sparks
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 0.35, s.y - s.vy * 0.35); // Motion blur effect
          ctx.stroke();

          s.x += s.vx;
          s.y += s.vy;
          s.vy += 1.3; // Stronger gravity for impact feel
          s.life -= 0.012; // Longer life

          if (s.life <= 0) sparksRef.current.splice(idx, 1);
      });

      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-1 pointer-events-none opacity-60" />;
};

/** 
 * Cinematic Multi-Directional Fractal Storm
 */
export const DetailedLightning = ({ onInitStrike, onSmallStrike }: { onInitStrike?: (trigger: () => void) => void, onSmallStrike?: () => void }) => {
  const [bolts, setBolts] = useState<IBoltData[]>([]);
  const nextId = useRef(0);

  const generateBolt = useCallback((isBig: boolean = false) => {
    // Play appropriate thunder sound for the bolt type
    audioManager.thunder(isBig);
    if (!isBig && onSmallStrike) onSmallStrike();
    
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Start position
    const edge = isBig ? 0 : Math.floor(Math.random() * 3);
    let startX: number, startY: number;
    let angle: number;

    if (edge === 0) { // Top
      startX = isBig ? w / 2 : Math.random() * w;
      startY = -100;
      angle = Math.PI / 2;
    } else if (edge === 1) { // Left
      startX = -100;
      startY = Math.random() * h;
      angle = 0;
    } else { // Right
      startX = w + 100;
      startY = Math.random() * h;
      angle = Math.PI;
    }

    const segments = (isBig ? 45 : 25) + Math.floor(Math.random() * 10);
    const baseLength = (Math.max(w, h) / segments) * (isBig ? 1.5 : 0.9);
    
    let curX = startX;
    let curY = startY;
    let path = `M ${curX} ${curY}`;
    const branches: string[] = [];

    for (let i = 0; i < segments; i++) {
      const progress = i / segments;
      
      let nx: number, ny: number;
      if (isBig) {
          // Sharp jagged movement but focused on the vertical axis (Revenge Strike)
          const targetX = startX + (Math.random() - 0.5) * 140; 
          const targetY = curY + baseLength;
          nx = targetX;
          ny = targetY;
      } else {
          const deviationMult = 2.8;
          const angleNoise = (Math.random() - 0.5) * (deviationMult * (1 + progress));
          const curAngle = angle + angleNoise;
          const curLength = baseLength * (1 - progress * 0.4);
          nx = curX + Math.cos(curAngle) * curLength;
          ny = curY + Math.sin(curAngle) * curLength;
      }

      path += ` L ${nx} ${ny}`;
      
      if (Math.random() > (isBig ? 0.45 : 0.75)) {
        let bx = nx;
        let by = ny;
        let bPath = `M ${bx} ${by}`;
        const bSegments = 6;
        const bAngle = isBig ? (Math.random() > 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) : (angle + (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 3 + Math.random()));
        for (let j = 0; j < bSegments; j++) {
           bx += Math.cos(bAngle) * (isBig ? baseLength * 0.6 : baseLength * 0.4);
           by += Math.sin(bAngle) * (isBig ? baseLength * 0.6 : baseLength * 0.4);
           bPath += ` L ${bx} ${by}`;
        }
        branches.push(bPath);
      }

      curX = nx;
      curY = ny;
    }

    const newBolt: IBoltData = { id: nextId.current++, path, branches, opacity: 0 };
    setBolts(prev => [...prev, newBolt]);

    const flicker = async () => {
        const updateOpacity = (op: number) => {
            setBolts(current => current.map(b => b.id === newBolt.id ? { ...b, opacity: op } : b));
        };
        const steps = isBig ? [1.0, 0.1, 1.0, 0.2, 1.0, 0.3, 1.0] : [0.8, 0.2, 1.0];
        for (const op of steps) {
            updateOpacity(op);
            await new Promise(r => setTimeout(r, isBig ? 60 : 40));
        }
        setBolts(current => current.filter(b => b.id !== newBolt.id));
    };

    flicker();
  }, []);

  useEffect(() => {
    let timeoutId: number | null = null;

    if (onInitStrike) onInitStrike(() => {
       setBolts([]);
       generateBolt(true);
    });

    const trigger = () => {
        generateBolt();
        timeoutId = window.setTimeout(trigger, 3000 + Math.random() * 3000);
    };

    timeoutId = window.setTimeout(trigger, 3500);

    return () => {
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [generateBolt, onInitStrike, onSmallStrike]);

  const isBigBoltActive = bolts.some(b => b.path.length > 500);

  return (
    <div className="absolute inset-0 z-2 pointer-events-none overflow-hidden">
      <svg className="w-full h-full">
        <filter id="lightning-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        {bolts.map((bolt) => {
          const isBig = bolt.path.length > 500;
          return (
            <g key={bolt.id} style={{ opacity: bolt.opacity }}>
              <path d={bolt.path} stroke="white" fill="none" filter="url(#lightning-glow)" className="opacity-20 blur-sm"
                strokeWidth={isBig ? "18" : "4"} 
              />
              <path d={bolt.path} stroke="white" fill="none"
                strokeWidth={isBig ? "8" : "2"} 
              />
              {bolt.branches.map((b, idx) => (
                <path key={idx} d={b} stroke="white" strokeWidth={isBig ? "4" : "1"} fill="none" className="opacity-50" />
              ))}
            </g>
          );
        })}
      </svg>
      <AnimatePresence>
        {bolts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: isBigBoltActive ? 1.0 : 0.65 }} exit={{ opacity: 0 }} className="absolute inset-0 z-3 pointer-events-none"
            style={{ 
               background: isBigBoltActive ? 'white' : 'radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)',
               mixBlendMode: 'screen' 
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const StartMenu = () => {
  const { setScreen } = useGameStore();
  const { openModal } = useModalStore();
  const { t } = useI18n();

  const [isStarting, setIsStarting] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const [isButtonCharged, setIsButtonCharged] = useState(false);
  const [burstPos, setBurstPos] = useState<{ x: number, y: number } | undefined>();
  const triggerStrike = useRef<(() => void) | null>(null);
  const [strikeCount, setStrikeCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isSmallShaking, setIsSmallShaking] = useState(false);

  const titleText = "PC MASTER";
  const subtitleText = t('menu.subtitle');
  const chapterText = t('menu.chapter2');
  const startText = t('menu.start');
  const storyText = `[ ${t('menu.story')} ]`;
  const hintText = t('menu.hint');

  const hasTriggeredAudio = useRef(false);

  useEffect(() => {
    // Definitive guard against double-triggering sounds
    if (!hasTriggeredAudio.current) {
      audioManager.menuShow();
      hasTriggeredAudio.current = true;
    }

    const cleanupMenu = audioManager.menu();
    const cleanupRain = audioManager.rain();
    
    const { isRestarting, setIsRestarting } = useGameStore.getState();
    const delay = isRestarting ? 100 : 1300;

    // Cinematic Intro Strike: After entry
    const introStrike = setTimeout(() => {
      if (triggerStrike.current) {
        triggerStrike.current();
        setShowStartButton(true);
        setStrikeCount(prev => prev + 1);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
        
        // Reset flag after use
        if (isRestarting) setIsRestarting(false);

        // SECONDARY STRIKE: Discharge on button (5s total after intro strike)
        setTimeout(() => {
           // Calculate button center
           const w = window.innerWidth;
           const h = window.innerHeight;
           // Roughly centered vertically + logo offset
           setBurstPos({ x: w / 2, y: h / 2 + 100 }); 
           setStrikeCount(prev => prev + 1);
           setIsButtonCharged(true);
           // Play discharge SFX
           audioManager.thunder(false); 
           
           // Flash shake
           setIsShaking(true);
           setTimeout(() => setIsShaking(false), 400);

           // Start decay immediately after peak impact
           setTimeout(() => setIsButtonCharged(false), 100);
        }, 5000);
      }
    }, delay);

    return () => {
      cleanupMenu instanceof Promise ? cleanupMenu.then(stop => typeof stop === 'function' && stop()) : (typeof cleanupMenu === 'function' && (cleanupMenu as any)());
      cleanupRain instanceof Promise ? cleanupRain.then(stop => typeof stop === 'function' && stop()) : (typeof cleanupRain === 'function' && (cleanupRain as any)());
      clearTimeout(introStrike);
    };
  }, []);

  const handleStart = () => {
    if (isStarting) return;
    
    // Attempt fullscreen on user interaction (required by browsers)
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.warn("Fullscreen request failed. Proceeding...");
      });
    }

    setIsStarting(true);
    setShowStartButton(false);
    setIsButtonCharged(false);
    audioManager.fadeOut(2000);
    setTimeout(() => {
      setScreen(Screen.STORY_INTRO);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: isStarting ? 0 : 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className="relative min-h-dvh w-screen flex flex-col items-center justify-center overflow-hidden font-mono select-none bg-black"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,40,40,1)_0%,rgba(20,20,20,1)_50%,rgba(0,0,0,1)_100%)] z-0" />
      
      {/* Weather & Lightning Layers */}
      <WeatherEffect triggerSparks={strikeCount} burstPos={burstPos} />
      <DetailedLightning 
        onInitStrike={(trigger) => { triggerStrike.current = trigger; }} 
        onSmallStrike={() => {
          setIsSmallShaking(true);
          setTimeout(() => setIsSmallShaking(false), 200);
        }}
      />

      {/* Global Vignette */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent 0% to-black/80 80% z-6 pointer-events-none" />

      {/* Settings UI */}
      <div className="absolute top-8 right-8 z-50">
          <button onClick={() => openModal(MODAL_TYPES.SETTINGS)} className="p-3 text-white/20 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer border border-white/5 hover:border-white/20">
            <Settings className="w-6 h-6" />
          </button>
      </div>

      {/* Main Content with Refined Decay Shake */}
      <motion.div
        animate={isShaking ? {
          x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
          y: [0, 4, -4, 3, -3, 2, -2, 1, -1, 0],
        } : isSmallShaking ? {
          x: [0, -3, 3, -2, 2, 0],
          y: [0, 2, -2, 1, -1, 0],
        } : {}}
        transition={{ 
          duration: isShaking ? 0.7 : 0.25, 
          ease: "easeOut" 
        }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center"
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 3, ease: 'easeOut' }} className="flex flex-col items-center">
          <div className="mb-2">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 1.5 }}>
              <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-[linear-gradient(180deg,#ffffff,#888888)] tracking-tighter uppercase mb-4" style={{ filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.25))' }}>
                {titleText}
              </h1>
              <p className="text-xl md:text-2xl mt-4 text-white/40 font-bold uppercase tracking-[0.8em] font-serif italic">
                 {subtitleText}
              </p>
              <p className="text-sm text-white/60 mt-4 font-black uppercase tracking-[1.2em] transition-all duration-1000" style={{ textShadow: '0 0 15px rgba(255,255,255,0.3)' }}>
                 {chapterText}
              </p>
            </motion.div>
            <div className="h-px w-64 bg-linear-to-r from-transparent via-white/10 to-transparent mx-auto mt-8" />
          </div>

          <div className="flex flex-col items-center gap-12 h-[320px] justify-center">
            <AnimatePresence>
              {showStartButton && (
                <motion.div
                  key="start-controls"
                  initial={{ opacity: 0, scale: 0.5, filter: 'brightness(5) blur(10px)' }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    filter: isButtonCharged ? 'brightness(3) contrast(1.5)' : 'brightness(1) blur(0px)'
                  }}
                  transition={{ 
                    duration: isButtonCharged ? 0.1 : 0.8, 
                    type: "spring", 
                    stiffness: 100,
                    damping: 15
                  }}
                  className="flex flex-col items-center gap-10"
                >
                  <motion.button 
                    onClick={handleStart} 
                    disabled={isStarting} 
                    className="group relative px-24 py-8 overflow-hidden rounded-sm bg-white/5 border-y hover:border-white/40 cursor-pointer min-w-[400px]"
                    animate={{
                      boxShadow: isButtonCharged ? '0px 0px 50px rgba(255,255,255,0.4)' : '0px 0px 0px rgba(255,255,255,0)',
                      borderColor: isButtonCharged ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)'
                    }}
                    transition={{
                      duration: isButtonCharged ? 0.1 : 2,
                      ease: "easeOut"
                    }}
                  >
                    {/* Erratic SVG Lightning Bolts */}
                    <AnimatePresence>
                      {isButtonCharged && (
                        <motion.div 
                          className="absolute inset-0 z-30 pointer-events-none"
                          initial={{ opacity: 1 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          transition={{ duration: 2, ease: 'easeOut' }}
                        >
                          <ButtonLightningBolts active={true} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Animated electrical static overlay */}
                    <AnimatePresence>
                      {isButtonCharged && (
                        <motion.div 
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                          className="absolute inset-0 z-20 bg-white/20 mix-blend-overlay pointer-events-none"
                        />
                      )}
                    </AnimatePresence>

                    <motion.span 
                      animate={isButtonCharged ? { x: [0, -2, 2, -2, 0] } : {}}
                      className="relative z-10 font-black tracking-[0.4em] text-2xl text-white/60 group-hover:text-white transition-colors duration-300"
                    >
                      {startText}
                    </motion.span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-500" />
                  </motion.button>

                  <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-8">
                      <button 
                        onClick={() => openModal(MODAL_TYPES.UPDATE_LOGS)} 
                        className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-[0.5em] transition-all border-b border-white/5 hover:border-white/20 pb-1 cursor-pointer"
                      >
                        [ {t('menu.logs')} ]
                      </button>
                      <button 
                        onClick={() => openModal(MODAL_TYPES.STORY)} 
                        className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-[0.5em] transition-all border-b border-white/5 hover:border-white/20 pb-1 cursor-pointer"
                      >
                        {storyText}
                      </button>
                    </div>
                    <p className="text-[8px] text-white font-bold italic uppercase tracking-[0.4em] mt-2 pointer-events-none opacity-40">
                      {hintText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Version Label */}
      <div className="absolute bottom-6 left-8 z-50 pointer-events-none">
        <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.4em]">Current version V0.2.1</span>
      </div>

      {/* Decorative Grid Floor */}
      <div className="absolute bottom-0 w-full h-[30%] opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.1)), repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 41px)', transform: 'perspective(500px) rotateX(60deg) translateY(50px)', transformOrigin: 'bottom' }} />
    </motion.div>

  );
};
