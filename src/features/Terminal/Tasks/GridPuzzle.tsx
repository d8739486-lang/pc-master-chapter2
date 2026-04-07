import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';
import { useUiStore } from '@/core/useUiStore';

interface IGridPuzzleProps {
  onComplete: () => void;
}

const SEQUENCE_LENGTH = 5;

export const GridPuzzle = ({ onComplete }: IGridPuzzleProps) => {
  const { t } = useI18n();
  const { triggerShake } = useUiStore();

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const [completed, setCompleted] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);

  // Memory Cleanup
  useEffect(() => {
    return () => {
      setSequence([]);
      setPlayerInput([]);
      setIsPlaying(false);
      setCompleted(false);
      setWrongAttempt(false);
    };
  }, []);

  // Generate sequence on mount
  useEffect(() => {
    const newSeq = Array.from({ length: SEQUENCE_LENGTH }, () => Math.floor(Math.random() * 9));
    setSequence(newSeq);
  }, []);

  const playSequence = useCallback(async () => {
    if (sequence.length === 0 || completed) return;
    setIsPlaying(true);
    setActiveIndex(null);
    setPlayerInput([]);

    // Wait a bit before starting
    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < sequence.length; i++) {
      if (completed) break;
      setActiveIndex(sequence[i]);
      audioManager.gridNote(sequence[i]);
      await new Promise(r => setTimeout(r, 400));
      setActiveIndex(null);
      await new Promise(r => setTimeout(r, 200));
    }

    setIsPlaying(false);
  }, [sequence, completed]);

  // Initial playback
  useEffect(() => {
    if (sequence.length > 0 && !isPlaying && playerInput.length === 0 && !completed) {
      playSequence();
    }
  }, [sequence, completed]); // playSequence is intentionally omitted to avoid loops

  const handleCellClick = useCallback((index: number) => {
    if (isPlaying || completed || wrongAttempt) return;

    audioManager.gridNote(index);
    
    // Briefly highlight
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 150);

    const newInput = [...playerInput, index];
    setPlayerInput(newInput);

    // Check correctness
    const currentStepIndex = newInput.length - 1;
    if (newInput[currentStepIndex] !== sequence[currentStepIndex]) {
      // Wrong!
      audioManager.unbuy();
      triggerShake('small', 300);
      setWrongAttempt(true);
      
      setTimeout(() => {
        setWrongAttempt(false);
        playSequence();
      }, 1000);
      return;
    }

    // Correct hit
    if (newInput.length === sequence.length) {
      setCompleted(true);
      audioManager.complete();
      setTimeout(onComplete, 1200);
    }

  }, [isPlaying, completed, wrongAttempt, playerInput, sequence, triggerShake, onComplete, playSequence]);


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full max-w-sm mx-auto select-none"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-cyan-400 text-xs font-black tracking-[0.4em] uppercase mb-1">
          {t('tasks.grid_title')}
        </h3>
        <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">
          {t('tasks.grid_subtitle')}
        </p>
      </div>

      <div className={`bg-black/60 border rounded-lg p-6 backdrop-blur-sm relative overflow-hidden transition-colors duration-300 ${wrongAttempt ? 'border-red-500/50' : 'border-cyan-500/20'}`}>
        
        {/* Status indicator */}
        <div className="flex justify-center mb-6 gap-2 h-2">
          {sequence.map((_, i) => (
             <div 
               key={i} 
               className={`w-4 h-1.5 rounded-sm transition-all duration-200 ${
                 i < playerInput.length 
                   ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                   : 'bg-white/10'
               }`} 
             />
          ))}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 mx-auto w-fit">
          {Array.from({ length: 9 }).map((_, i) => {
            const isActive = activeIndex === i;
            
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleCellClick(i)}
                disabled={isPlaying || completed || wrongAttempt}
                className={`
                  w-16 h-16 rounded-md border-2 transition-all duration-150 relative
                  ${isActive 
                    ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)]' 
                    : wrongAttempt 
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-white/10 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/10'
                  }
                `}
              >
                {/* Inner dot */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-150 ${
                  isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]' : 'bg-white/20'
                }`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-30"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-cyan-400 font-black text-lg tracking-[0.5em] uppercase text-center"
              style={{ textShadow: '0 0 20px rgba(34,211,238,0.5)' }}
            >
               {t('tasks.complete')}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
