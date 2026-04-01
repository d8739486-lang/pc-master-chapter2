import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useI18n } from '@/core/i18n';

// @ts-ignore
import textSfx from '@/textures/sfx/menu cutscene/text.mp3';

/**
 * "1 час позже..." transition screen shown after stage 3 friend chat.
 * Placeholder for the final chapter conclusion.
 */
export const TransitionText = () => {
  const [phase, setPhase] = useState<'text' | 'waiting'>('text');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    // Play text.mp3 once
    const sfx = new Audio(textSfx);
    sfx.volume = 0.5;
    sfx.play().catch(() => {});
    audioRef.current = sfx;

    const timer = setTimeout(() => {
      setPhase('waiting');
    }, 2000); 

    return () => {
      clearTimeout(timer);
      // Fade out sfx
      const fadeStep = 0.05;
      const fadeInterval = setInterval(() => {
        if (sfx.volume > 0.05) {
          sfx.volume -= fadeStep;
        } else {
          clearInterval(fadeInterval);
          sfx.pause();
          sfx.src = '';
        }
      }, 50);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center select-none overflow-hidden relative">
      {/* Centered Atmospheric Glow */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
      >
        <div 
          className="w-[800px] h-[800px] rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(157,0,255,0.15) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(60px)'
          }}
        />
      </motion.div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'text' && (
            <motion.div
              key="transition-text"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute text-white font-serif text-3xl md:text-5xl tracking-widest text-center px-6"
              style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}
            >
              {t('trans.later')}
            </motion.div>
          )}

          {phase === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              className="absolute text-center flex flex-col items-center gap-6 px-6"
            >
              <p
                className="text-white font-black text-xl md:text-3xl tracking-[0.6em] uppercase"
                style={{ textShadow: '0 0 30px rgba(157,0,255,0.6)' }}
              >
                {t('trans.tbc')}
              </p>
              <p className="text-white/20 text-[10px] tracking-[0.8em] uppercase animate-pulse font-bold">
                {t('trans.build')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
