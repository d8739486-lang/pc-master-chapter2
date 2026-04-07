import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useUiStore } from '@/core/useUiStore';
import { useI18n } from '@/core/i18n';

interface ILeverPuzzleProps {
  onComplete: () => void;
}

const STAGE_RADIUS = [180, 140, 110, 80];

export const LeverPuzzle = ({ onComplete }: ILeverPuzzleProps) => {
  const { t } = useI18n();
  const { triggerShake } = useUiStore();

  const [stage, setStage] = useState(1);
  const [targetCode, setTargetCode] = useState<boolean[]>([]);
  const [switches, setSwitches] = useState<boolean[]>([false, false, false, false]);
  const [leverPulled, setLeverPulled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [flickering, setFlickering] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [flashlightPos, setFlashlightPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const leverY = useMotionValue(0);
  
  // Memory Cleanup
  useEffect(() => {
    return () => {
      setStage(1);
      setSwitches([false, false, false, false]);
      setIsDark(false);
      setCompleted(false);
    };
  }, []);

  // Initialize stage
  const initStage = useCallback((s: number) => {
    setTargetCode(Array.from({ length: 4 }, () => Math.random() > 0.45));
    setSwitches([false, false, false, false]);
    setLeverPulled(false);
    leverY.set(0);
  }, [leverY]);

  useEffect(() => {
    initStage(stage);
  }, [stage, initStage]);

  // Initial Lights Out & Subtitles
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDark(true);
      audioManager.lOFF();
      setSubtitle(t('tasks.switcher_lights_out') || "чёрт, свет вырубили...");
      setTimeout(() => setSubtitle(null), 3500);
    }, 1200);
    return () => clearTimeout(timer);
  }, [t]);

  // Glitch logic (Optional, keeping it subtle without noise)
  useEffect(() => {
    if (!isDark || completed) return;
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitchOffset({ x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 30 });
        setTimeout(() => setGlitchOffset({ x: 0, y: 0 }), 80);
      }
    }, 300);
    return () => clearInterval(glitchInterval);
  }, [isDark, completed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setFlashlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const toggleSwitch = (i: number) => {
    if (completed || leverPulled) return;
    audioManager.leverM();
    setSwitches(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const codeMatch = switches.every((s, i) => s === targetCode[i]);

  const handleLeverDragEnd = () => {
    if (completed || leverPulled) return;
    if (leverY.get() > 100 && codeMatch) {
      setLeverPulled(true);
      audioManager.lever();
      triggerShake('medium', 400);
      if (stage < 4) {
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
    } else {
      animate(leverY, 0, { type: 'spring', damping: 20 });
      if (leverY.get() > 50 && !codeMatch) {
        audioManager.unbuy();
        triggerShake('small', 200);
      }
    }
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-xl mx-auto h-[500px] bg-zinc-950 rounded-sm border border-white/5 overflow-hidden shadow-2xl select-none font-mono"
    >
      {/* Background HUD */}
      <div className="absolute top-0 left-0 right-0 z-45 h-10 border-b border-white/5 bg-black/40 px-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <span className="text-[10px] text-white/30 tracking-[0.4em]">STG_{stage}/4</span>
         </div>
         <div className={`w-3 h-3 rounded-full ${codeMatch ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-900/40'}`} />
      </div>

      {/* CLASSIC PANEL (Switches at TOP, Lever BELOW) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center pt-14 pb-10 px-10 gap-8">
        
        {/* ROW: Switches at Top */}
        <div className="flex justify-center gap-10 w-full">
          {switches.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <button 
                onClick={() => toggleSwitch(i)}
                className={`w-14 h-16 rounded-md border-2 transition-all duration-300 relative ${s ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900'}`}
              >
                <motion.div 
                  animate={{ rotate: s ? 45 : -45 }}
                  className={`w-2 h-12 mx-auto rounded-full mt-2 ${s ? 'bg-emerald-400' : 'bg-zinc-700'}`} 
                />
              </button>
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${s === targetCode[i] ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-900/20'}`} 
              />
            </div>
          ))}
        </div>

        {/* CONTAINER: Industrial Lever with 2 Metal Bars */}
        <div className="relative flex-1 w-full flex items-center justify-center">
          <div className="w-24 h-64 bg-zinc-900/50 border-4 border-zinc-800 rounded-xl relative shadow-inner p-2">
             {/* 2 DISTINCT METAL RAILS (Balki) */}
             <div className="absolute left-6 top-4 bottom-4 w-1.5 bg-zinc-700 border-x border-zinc-500/30 shadow-lg" />
             <div className="absolute right-6 top-4 bottom-4 w-1.5 bg-zinc-700 border-x border-zinc-500/30 shadow-lg" />
             
             {/* Draggable Handle */}
             <motion.div 
                drag="y"
                dragConstraints={{ top: 0, bottom: 150 }}
                dragElastic={0.05}
                style={{ y: leverY }}
                onDragEnd={handleLeverDragEnd}
                className="absolute left-0 right-0 h-16 cursor-grab active:cursor-grabbing z-10 px-2"
             >
                <div className={`h-full rounded-md border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-300 ${codeMatch ? 'bg-red-600 border-red-400 shadow-[0_0_20px_red]' : 'bg-zinc-800 border-zinc-700'}`}>
                   <div className="h-full w-full flex flex-col justify-around items-center opacity-60">
                      <div className="w-12 h-1 bg-white/20 rounded-full" />
                      <div className="w-12 h-1 bg-white/20 rounded-full" />
                   </div>
                </div>
             </motion.div>

             {/* Indicator Text Below */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] text-white/40 tracking-[0.3em] uppercase">
                {codeMatch ? 'ID_MATCHED_RELEASE' : 'LOCKED_BY_CYPHER'}
             </div>
          </div>
        </div>
      </div>

      {/* HORROR ELEMENTS (No VHS Noise) */}
      {isDark && (
        <motion.div 
          animate={{ opacity: flickering ? 0.3 : 1 }}
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle ${STAGE_RADIUS[stage-1]}px at ${flashlightPos.x + glitchOffset.x}px ${flashlightPos.y + glitchOffset.y}px, transparent 0%, rgba(0,0,0,0.99) 100%)`
          }}
        />
      )}
      
      <div className="absolute inset-0 z-45 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)' }} />

      {/* SUBTITLES BELOW */}
      <AnimatePresence>
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-black/60 border border-white/5 rounded-full"
          >
            <p className="text-[10px] text-red-500/90 font-black uppercase tracking-[0.5em] italic animate-pulse">
              {subtitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
             <h2 className="text-emerald-500 font-black text-2xl tracking-[0.8em] uppercase">ACCESS_GRANTED</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
