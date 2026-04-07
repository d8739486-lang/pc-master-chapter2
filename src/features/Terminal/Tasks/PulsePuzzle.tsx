import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useUiStore } from '@/core/useUiStore';
import { useI18n } from '@/core/i18n';

interface IPulsePuzzleProps {
  onComplete: () => void;
}

export const PulsePuzzle = ({ onComplete }: IPulsePuzzleProps) => {
  const { t } = useI18n();
  const { triggerShake } = useUiStore();

  const [progress, setProgress] = useState(0); // 0 to 100
  const [completed, setCompleted] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  const requestRef = useRef<number>(0);
  const directionRef = useRef<number>(1);
  const posRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  
  // Target zone logic
  const targetZone = { start: 40, width: 24 }; // Widened from 20 to 24
  const baseSpeed = 2.2; // Reduced from 3.5

  // 1. Cursor Animation
  const animateCursor = useCallback(() => {
    if (completed) return;
    
    const now = performance.now();
    const dt = Math.min(32, now - lastTimeRef.current);
    const deltaTimeMultiplier = dt / 16.66;
    lastTimeRef.current = now;

    posRef.current += directionRef.current * baseSpeed * deltaTimeMultiplier;
    
    if (posRef.current >= 100) { posRef.current = 100; directionRef.current = -1; }
    else if (posRef.current <= 0) { posRef.current = 0; directionRef.current = 1; }
    
    setCursorPos(posRef.current);
    requestRef.current = requestAnimationFrame(animateCursor);
  }, [completed]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animateCursor);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animateCursor]);

  // 2. Auto-Decay Logic (The "Fading" scale)
  useEffect(() => {
    if (completed || progress <= 0) return;
    const decayTimer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - 1.2)); // Drains fairly fast
    }, 100);
    return () => clearInterval(decayTimer);
  }, [completed, progress]);

  // 3. Completion Trigger
  useEffect(() => {
    if (progress >= 100 && !completed) {
      setCompleted(true);
      audioManager.complete();
      audioManager.thunder(true);
      triggerShake('large', 500);
      setTimeout(onComplete, 1500);
    }
  }, [progress, completed, onComplete, triggerShake]);

  const handleSyncClick = () => {
    if (completed || wrongAttempt) return;

    const isHit = Math.abs(posRef.current - 50) <= (targetZone.width / 2) + 4;

    if (isHit) {
      audioManager.pulseTick();
      setProgress(prev => Math.min(100, prev + 25)); // +25% on hit
      
      // Flash effect logic
      const btn = document.getElementById('sync-btn');
      if (btn) {
         btn.classList.add('scale-95', 'opacity-50');
         setTimeout(() => btn.classList.remove('scale-95', 'opacity-50'), 100);
      }
    } else {
      setWrongAttempt(true);
      audioManager.unbuy();
      triggerShake('small', 300);
      setProgress(prev => Math.max(0, prev - 15)); // Penalty reduction
      setTimeout(() => setWrongAttempt(false), 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-lg mx-auto h-[480px] bg-black/60 rounded-xl border-2 border-cyan-500/20 backdrop-blur-md overflow-hidden p-8 flex flex-col items-center justify-between font-mono shadow-[0_0_40px_rgba(34,211,238,0.1)]"
    >
      {/* HUD HEADER (Consistent with other games) */}
      <div className="absolute top-0 left-0 right-0 z-45 h-10 border-b border-white/5 bg-black/40 px-6 flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="flex gap-1.5">
             {[1, 2, 3, 4, 5].map(s => {
               const threshold = s * 20;
               return (
                <div 
                  key={s} 
                  className={`w-4 h-2 rounded-full border transition-all duration-500
                    ${progress >= threshold ? 'bg-cyan-500/60 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-transparent border-white/10'}
                  `}
                />
               );
             })}
           </div>
           <span className="text-[10px] text-white/30 tracking-[0.4em] font-black uppercase">SYNC_NEXUS // {Math.round(progress)}%</span>
         </div>
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${progress > 0 ? 'bg-cyan-400 animate-pulse' : 'bg-white/10'}`} />
         </div>
      </div>

      {/* Title (Lowered to accommodate HUD) */}
      <div className="text-center mt-6">
        <h3 className="text-cyan-400 text-sm font-black tracking-[0.5em] uppercase mb-1 drop-shadow-[0_0_10px_#22d3ee]">
          {t('tasks.pulse_title') || "QUANTUM_SYNC"}
        </h3>
        <span className="text-[8px] text-white/30 uppercase tracking-[0.4em]">establish_rhythm_nexus</span>
      </div>

      {/* Main Rhythmic Bar Container */}
      <div className="relative w-full h-24 bg-black/80 border border-white/5 rounded-lg flex items-center overflow-hidden">
         {/* Target Zone Glow */}
         <div className="absolute left-[40%] right-[40%] h-full bg-cyan-500/10 border-x border-cyan-500/40 shadow-[inset_0_0_20px_rgba(34,211,238,0.2)]" />
         <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-white/10" />

         {/* Moving Cursor */}
         <motion.div 
            style={{ left: `${cursorPos}%` }}
            className={`absolute -translate-x-1/2 w-3 h-full z-10 transition-colors duration-100
               ${Math.abs(cursorPos - 50) < 10 ? 'bg-cyan-400 shadow-[0_0_20px_#22d3ee]' : 'bg-white/40'}
            `}
         >
            <div className="w-full h-full bg-white/20 animate-pulse" />
         </motion.div>
      </div>

      {/* Progress Scale (The one that accumulates and fades) */}
      <div className="w-full flex flex-col gap-2">
         <div className="flex justify-between items-end px-1">
            <span className="text-[10px] text-cyan-500/60 font-black">SYNC_LEVEL</span>
            <span className="text-[10px] text-white/40">{Math.round(progress)}%</span>
         </div>
         <div className="w-full h-4 bg-zinc-900/80 rounded-full border border-white/5 overflow-hidden p-0.5">
            <motion.div 
               animate={{ width: `${progress}%` }}
               className={`h-full rounded-full transition-all duration-300
                  ${progress > 80 ? 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]' : 
                    progress > 40 ? 'bg-cyan-600' : 'bg-cyan-900'}
               `}
            />
         </div>
         <div className="flex justify-between text-[7px] text-white/20 uppercase tracking-widest px-1">
            <span>Low_Signal</span>
            <span>Optimal_Lock</span>
         </div>
      </div>

      {/* THE HEART BUTTON (More noticeable) */}
      <button
        id="sync-btn"
        onClick={handleSyncClick}
        disabled={completed}
        className={`
          w-28 h-28 rounded-full border-4 transition-all duration-300 flex items-center justify-center relative group active:scale-90
          ${wrongAttempt ? 'border-red-500 bg-red-900/20' : 'border-cyan-500 bg-cyan-950/20 hover:bg-cyan-500/20'}
          ${completed ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        <div className={`w-20 h-20 rounded-full border border-dashed border-white/20 animate-spin-slow absolute inset-4`} />
        
        {/* Glowing Core */}
        <div className={`w-12 h-12 rounded-full transition-transform duration-300
           ${wrongAttempt ? 'bg-red-500' : 'bg-cyan-400 shadow-[0_0_30px_#22d3ee] scale-110'}
           ${Math.abs(cursorPos - 50) < 10 ? 'scale-125' : 'scale-100'}
        `} />
        
        <span className="absolute bottom-2 text-[8px] font-black text-cyan-300/50 group-hover:text-cyan-300">SYNC_NOW</span>
      </button>

      {/* Completion Overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-cyan-950/90 backdrop-blur-xl">
             <div className="text-center">
                <h2 className="text-cyan-400 font-black text-3xl tracking-[1em] uppercase mb-4 drop-shadow-[0_0_20px_#22d3ee]">SYNCHRONIZED</h2>
                <span className="text-[10px] text-white/50 tracking-widest">NEXUS_LINK_STABLE</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
