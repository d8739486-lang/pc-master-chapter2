import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useUiStore } from '@/core/useUiStore';
import { useI18n } from '@/core/i18n';

interface ISwitch {
  id: string;
  isActive: boolean;
  isFaulty: boolean;
  offset: number; // for visual stagger
}

interface ISwitcherPuzzleProps {
  onComplete: () => void;
}

const STAGE_CONFIGS = [
  { count: 4, width: 'max-w-xs', radius: 150, cols: 'grid-cols-2' },
  { count: 9, width: 'max-w-md', radius: 120, cols: 'grid-cols-3' },
  { count: 16, width: 'max-w-2xl', radius: 100, cols: 'grid-cols-4' },
  { count: 25, width: 'max-w-5xl', radius: 80, cols: 'grid-cols-5' },
];

export const SwitcherPuzzle = ({ onComplete }: ISwitcherPuzzleProps) => {
  const { t } = useI18n();
  const { triggerShake } = useUiStore();

  const [stage, setStage] = useState(1); // 1-indexed for logic
  const [switches, setSwitches] = useState<ISwitch[]>([]);
  const [flashlightPos, setFlashlightPos] = useState({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(false);
  const [flickering, setFlickering] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const config = STAGE_CONFIGS[stage - 1];

  // Memory Cleanup
  useEffect(() => {
    return () => {
      setStage(1);
      setSwitches([]);
      setIsDark(false);
      setCompleted(false);
    };
  }, []);

  // Initialize stage
  const initStage = useCallback((currentStage: number) => {
    const stageConfig = STAGE_CONFIGS[currentStage - 1];
    const count = stageConfig.count;

    // Pick 2 random faulty ones
    const faultyIndices = new Set<number>();
    while (faultyIndices.size < 2) {
      faultyIndices.add(Math.floor(Math.random() * count));
    }

    const newSwitches: ISwitch[] = Array.from({ length: count }, (_, i) => ({
      id: `sw-${currentStage}-${i}`,
      isActive: false,
      isFaulty: faultyIndices.has(i),
      offset: Math.random() * 5
    }));

    setSwitches(newSwitches);
  }, []);

  useEffect(() => {
    initStage(stage);
  }, [stage, initStage]);

  // Darkness delay and initial subtitle
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDark(true);
      audioManager.lOFF();
      setSubtitle(t('tasks.switcher_lights_out') || "чёрт, свет вырубился...");
      
      // Hide subtitle after 3s
      setTimeout(() => setSubtitle(null), 3500);
    }, 1200);

    return () => clearTimeout(timer);
  }, [t]);

  // Random Glitch Effect logic
  useEffect(() => {
    if (!isDark || completed) return;

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.93) { // 7% chance every 200ms
        const ox = (Math.random() - 0.5) * 40;
        const oy = (Math.random() - 0.5) * 40;
        setGlitchOffset({ x: ox, y: oy });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 100);
      }
    }, 200);

    return () => clearInterval(glitchInterval);
  }, [isDark, completed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setFlashlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const toggleSwitch = (index: number) => {
    if (completed || flickering) return;

    const s = switches[index];
    if (s.isFaulty) {
      audioManager.click();
      const updated = [...switches];
      updated[index] = { ...s, isActive: !s.isActive };
      setSwitches(updated);

      // Check if both faulty are on
      const activeFaulty = updated.filter(sw => sw.isFaulty && sw.isActive).length;
      if (activeFaulty === 2) {
        handleStageWin();
      }
    } else {
      // Wrong switch - Penalty
      audioManager.unbuy();
      triggerShake(stage >= 3 ? 'medium' : 'small', 250);
      
      // Extra feedback: brief flicker when wrong
      setFlickering(true);
      setTimeout(() => setFlickering(false), 150);
    }
  };

  const handleStageWin = () => {
    if (stage < 4) {
      // Transition flicker (wink)
      setFlickering(true);
      audioManager.spark();
      
      setTimeout(() => {
        setFlickering(false);
        setStage(prev => prev + 1);
      }, 1000);
    } else {
      setCompleted(true);
      audioManager.complete();
      setTimeout(onComplete, 1500);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        maxWidth: config.width === 'max-w-xs' ? 320 : config.width === 'max-w-md' ? 448 : config.width === 'max-w-2xl' ? 672 : 1000
      }}
      className="relative w-full mx-auto h-[520px] bg-zinc-950 rounded-sm border border-red-500/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] select-none font-mono"
    >
      {/* NOISE & FILM GRAIN FILTER (SVG Source) */}
      <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
        <filter id="horror-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
             <feFuncR type="linear" slope="0.1" />
             <feFuncG type="linear" slope="0.1" />
             <feFuncB type="linear" slope="0.1" />
          </feComponentTransfer>
        </filter>
      </svg>
      
      {/* Noise Overlay */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-[0.2]" style={{ filter: 'url(#horror-noise)' }} />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #222 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }} 
      />

      {/* HUD HOTBAR */}
      <div className="absolute top-0 left-0 right-0 z-45 h-10 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center px-6 justify-between overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                className={`w-4 h-2 rounded-full border transition-all duration-500
                  ${s <= stage ? 'bg-red-500/60 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-transparent border-white/10'}
                  ${s === stage ? 'animate-pulse' : ''}
                `}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/40 tracking-[0.4em] font-black uppercase">
            PWR_RELAY_SEQ // {stage}/4
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[8px] text-emerald-500/30 animate-pulse">SYSTEM_STABLE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
        </div>
      </div>

      {/* Main interaction Area */}
      <div 
        className={`relative z-10 w-full h-full pt-16 pb-8 px-8 grid gap-4 place-content-center
           ${config.cols}
        `}
      >
        {switches.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => toggleSwitch(i)}
            disabled={s.isActive && s.isFaulty}
            className={`
              w-16 h-24 rounded-sm border-2 transition-all duration-300 relative group
              ${s.isActive 
                ? 'border-emerald-500 bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
              }
            `}
          >
            {/* Visual Wear & Tear (Only subtle in stage 1, hidden in late stages) */}
            {stage === 1 && s.isFaulty && (
              <div className="absolute inset-0 bg-red-500/5 opacity-50 overflow-hidden pointer-events-none">
                 <div className="w-full h-px bg-white/10 rotate-45 translate-y-4" />
              </div>
            )}

            {/* Manual Switch lever UI */}
            <div className="absolute inset-0 p-2 flex flex-col justify-between items-center h-full">
               <div className="text-[7px] text-white/5 tracking-tighter">SW_{i}</div>
               
               {/* Track */}
               <div className="w-1.5 h-14 bg-black border border-white/10 rounded-full relative">
                  <motion.div 
                    animate={{ y: s.isActive ? 32 : 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`w-6 h-10 -ml-[9px] rounded-sm border shadow-lg cursor-pointer
                      ${s.isActive ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-800 border-zinc-700'}
                    `}
                  />
               </div>

               <div className={`w-2 h-2 rounded-full transition-colors ${s.isActive ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-zinc-900'}`} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* HORROR OVERLAYS */}

      {/* Dynamic Flashlight Mask */}
      {isDark && (
        <motion.div 
          animate={{ opacity: flickering ? 0.3 : 1 }}
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle ${config.radius}px at ${flashlightPos.x + glitchOffset.x}px ${flashlightPos.y + glitchOffset.y}px, transparent 0%, rgba(0,0,0,0.99) 100%)`
          }}
        />
      )}

      {/* Scanline Effect */}
      <div className="absolute inset-0 z-45 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }}
      />

      {/* Darkness Pulse (Breathing) */}
      <motion.div 
        animate={{ opacity: [0.05, 0.25, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 z-35 bg-black pointer-events-none"
      />

      {/* Subtitles Overlay */}
      <AnimatePresence>
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-red-500/90 text-center drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
              {subtitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Shield */}
      <AnimatePresence>
        {completed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black backdrop-blur-2xl"
          >
             <motion.div
               animate={{ scale: [1, 1.1, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="text-emerald-500 font-black text-3xl tracking-[1em] uppercase mb-4"
             >
               CRITICAL_SUCCESS
             </motion.div>
             <div className="text-[8px] text-white/30 uppercase tracking-[0.4em]">system_override_complete</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
