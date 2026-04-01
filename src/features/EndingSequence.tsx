import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';

// @ts-ignore
import winSfx from '@/textures/sfx/main/win.mp3';

/**
 * Chapter 2 Ending Credits & Thank You screen.
 * Shows after defeating DD_CORE_ARCHITECT and the victory chat.
 */
export const EndingSequence = () => {
  const { setScreen, resetGame } = useGameStore();
  const { t } = useI18n();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    audioManager.stopAllLoops();
    audioManager.stopMusic();

    // Phase 0: Black 2s
    const t0 = setTimeout(() => {
      setPhase(1);
      // Play victory sound on title reveal
      const win = new Audio(winSfx);
      win.volume = 0.7;
      win.play().catch(() => {});
    }, 2000);
    // Phase 1: Chapter title 4s
    const t1 = setTimeout(() => setPhase(2), 6000);
    // Phase 2: Thanks text 5s
    const t2 = setTimeout(() => setPhase(3), 11000);
    // Phase 3: Credits fade 5s
    const t3 = setTimeout(() => setPhase(4), 16000);
    // Phase 4: Black → return to menu
    const t4 = setTimeout(() => {
      resetGame();
      setScreen(Screen.START);
    }, 19000);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [setScreen, resetGame]);

  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative overflow-hidden select-none font-mono">
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="ch2-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-[0.5em]">
              {t('ending.title')}
            </h1>
            <div className="h-px w-64 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 uppercase tracking-[0.8em]">
              {t('ending.chapter_name')}
            </h2>
            <p className="text-zinc-500 text-sm uppercase tracking-[0.6em] mt-4">{t('ending.completed')}</p>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-8 text-center max-w-2xl px-8"
          >
            <p className="text-white/80 text-lg md:text-xl leading-relaxed tracking-wide">
              {t('ending.thanks')}
            </p>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              {t('ending.final_text')}
            </p>
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div
            key="credits"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <p className="text-zinc-600 text-xs uppercase tracking-[0.8em]">{t('ending.creator')}</p>
            <p className="text-white font-bold uppercase tracking-[0.5em]">PC MASTER</p>
            <div className="h-px w-32 bg-white/10 my-4" />
            <p className="text-zinc-600 text-xs uppercase tracking-[0.8em]">{t('ending.dev')}</p>
            <p className="text-white/60 text-sm uppercase tracking-[0.4em]">Neon Root Engine v0.5.1</p>
            <div className="h-px w-32 bg-white/10 my-4" />
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.6em] mt-8">
              {t('ending.to_be_continued')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
