import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';

interface ISignalPuzzleProps {
  onComplete: () => void;
}

const MAX_WAVES = 5;

export const SignalPuzzle = ({ onComplete }: ISignalPuzzleProps) => {
  const { t } = useI18n();

  // Wave Sequence State
  const [waveCount, setWaveCount] = useState(1);
  const [targetFreq, setTargetFreq] = useState(2 + Math.random() * 3);
  const [targetAmp, setTargetAmp] = useState(20 + Math.random() * 30);
  
  const [playerFreq, setPlayerFreq] = useState(1);
  const [playerAmp, setPlayerAmp] = useState(10);
  
  const [completed, setCompleted] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0); 
  
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize new wave target
  const nextWave = useCallback(() => {
    setTargetFreq(2 + Math.random() * 4);
    setTargetAmp(15 + Math.random() * 40);
    setMatchProgress(0);
    audioManager.spark(); // Subtle feedback for new wave
  }, []);

  // Check Match Logic
  useEffect(() => {
    if (completed) return;

    const freqDiff = Math.abs(targetFreq - playerFreq);
    const ampDiff = Math.abs(targetAmp - playerAmp);
    const isMatched = freqDiff <= 0.25 && ampDiff <= 6;

    if (isMatched) {
      if (matchProgress < 100) {
        if (!syncTimerRef.current) {
          syncTimerRef.current = setInterval(() => {
            setMatchProgress(p => {
              if (p + 15 >= 100) {
                clearInterval(syncTimerRef.current!);
                syncTimerRef.current = null;
                
                if (waveCount < MAX_WAVES) {
                   setWaveCount(w => w + 1);
                   nextWave();
                } else {
                   setCompleted(true);
                   audioManager.complete();
                   setTimeout(onComplete, 1200);
                }
                return 100;
              }
              return p + 15;
            });
          }, 120);
        }
      }
    } else {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      if (matchProgress > 0) setMatchProgress(p => Math.max(0, p - 5));
    }

    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current); };
  }, [targetFreq, targetAmp, playerFreq, playerAmp, matchProgress, completed, waveCount, nextWave, onComplete]);

  // SVG Sine Generator
  const generateSinePath = (freq: number, amp: number, phase: number, width: number, height: number) => {
    const points: string[] = [];
    for (let x = 0; x <= width; x += 4) {
      const y = height / 2 + Math.sin((x / width) * Math.PI * 2 * freq + phase) * amp;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (completed) return;
    let frame: number;
    const animate = () => { setPhase(p => p + 0.1); frame = requestAnimationFrame(animate); };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [completed]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-lg mx-auto h-[500px] bg-black/80 rounded-2xl border border-emerald-500/20 backdrop-blur-xl p-8 flex flex-col justify-between font-mono shadow-2xl"
    >
      {/* HUD HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
           <h3 className="text-emerald-400 text-xs font-black tracking-[0.4em] uppercase">QUANTUM_WAVE_LOCK</h3>
           <span className="text-[7px] text-white/20 tracking-widest uppercase">sequence_stabilizer_v2.4</span>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-emerald-500 font-black tracking-tighter">WAVE_ {waveCount} / {MAX_WAVES}</div>
           <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`w-3 h-1 rounded-full ${i <= waveCount ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-white/5'}`} />
              ))}
           </div>
        </div>
      </div>

      {/* WAVE DISPLAY PANEL */}
      <div className="relative w-full h-40 bg-zinc-950 border border-white/5 rounded-xl overflow-hidden shadow-inner">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
        
        <svg className="w-full h-full p-2">
          {/* Target Wave (Ghostly) */}
          <motion.path
            animate={{ d: generateSinePath(targetFreq, targetAmp, phase, 400, 140) }}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          {/* Player Wave (Vivid) */}
          <motion.path
            animate={{ d: generateSinePath(playerFreq, playerAmp, phase, 400, 140) }}
            fill="none"
            stroke={matchProgress > 50 ? '#10b981' : '#34d399'}
            strokeWidth={2.5}
            filter="drop-shadow(0 0 8px rgba(16,185,129,0.4))"
          />
        </svg>

        {/* Sync Status Glow */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${matchProgress > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-white/10'}`} />
           <span className="text-[8px] text-white/20 uppercase tracking-tighter">SIGNAL_LOCKED: {Math.round(matchProgress)}%</span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          animate={{ width: `${matchProgress}%` }}
          className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"
        />
      </div>

      {/* CONTROLS (NOTICEABLE SLIDERS) */}
      <div className="space-y-8 px-4">
        {/* Amplitude Slider */}
        <div className="space-y-2">
           <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest font-black">
              <span>Amplitude_MOD</span>
              <span className="text-emerald-400">{Math.round(playerAmp)}</span>
           </div>
           <input 
             type="range" min="10" max="60" step="0.5"
             value={playerAmp} onChange={(e) => setPlayerAmp(parseFloat(e.target.value))}
             className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-500 
                        focus:outline-none hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
           />
        </div>

        {/* Frequency Slider */}
        <div className="space-y-2">
           <div className="flex justify-between text-[9px] text-white/40 uppercase tracking-widest font-black">
              <span>Frequency_SYNC</span>
              <span className="text-emerald-400">{playerFreq.toFixed(1)}</span>
           </div>
           <input 
             type="range" min="1" max="6" step="0.1"
             value={playerFreq} onChange={(e) => setPlayerFreq(parseFloat(e.target.value))}
             className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 
                        focus:outline-none hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
           />
        </div>
      </div>

      {/* Completion Shield */}
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-950/90 backdrop-blur-2xl">
             <div className="text-center">
                <h2 className="text-emerald-500 font-black text-3xl tracking-[0.8em] uppercase mb-4 shadow-sm">SYNCHRONIZED</h2>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">nexus_link_established_5/5</div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
