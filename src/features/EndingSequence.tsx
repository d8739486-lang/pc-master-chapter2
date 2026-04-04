import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';
import { SkipButton } from '@/components/SkipButton';

// @ts-ignore
import winSfx from '@/textures/sfx/main/win.mp3';

/**
 * Chapter 2 Ending Credits & Thank You screen.
 * Shows after defeating DD_CORE_ARCHITECT and the victory chat.
 */
export const EndingSequence = () => {
  const { setScreen, resetGame, setHasCompleted } = useGameStore();
  const { t } = useI18n();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    audioManager.stopAllLoops();
    audioManager.stopMusic();

    // Cinematic Timing Sequence
    // 1: Title (0.5s - 7.5s)
    // 2: Thanks (7.5s - 15.5s)
    // 3: Credits (15.5s - 25.5s) -- 10s duration
    // (25.5s - 27.5s): THE VOID (2s black)
    // 4: Secret Reveal (27.5s - 32.5s)
    // End: Reset (33.5s)

    const timers = [
      setTimeout(() => {
        setPhase(1);
        const win = new Audio(winSfx);
        win.volume = 0.6;
        win.play().catch(() => {});
      }, 500),
      setTimeout(() => {
        setPhase(2);
      }, 7500),
      setTimeout(() => setPhase(3), 15500),
      setTimeout(() => setPhase(0), 25500), // Fade to black after credits
      setTimeout(() => {
        setPhase(4);
        audioManager.stopMusic();
        audioManager.wth();
      }, 29500),
      setTimeout(() => setPhase(0), 37500), // 8 seconds after p4 start (3s fade + 5s stay)
      setTimeout(() => {
        setHasCompleted(true);
        resetGame();
        setScreen(Screen.START);
      }, 39500)
    ];

    return () => {
      timers.forEach(clearTimeout);
      audioManager.stopMusic();
    };
  }, [setScreen, resetGame]);

  const creditItem = (label: string, value: string) => (
    <div className="flex flex-col items-center gap-2 mb-12">
      <span className="text-zinc-600 text-[10px] uppercase tracking-[0.8em] font-mono">{label}</span>
      <span className="text-white text-xl md:text-2xl font-bold uppercase tracking-[0.4em]">{value}</span>
    </div>
  );

  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />

      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="p1"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="flex flex-col items-center text-center z-10"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-[0.4em] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {t('ending.title')}
            </h1>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '100%' }}
               transition={{ delay: 1, duration: 2 }}
               className="h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent mt-8 mb-4 max-w-xl self-center" 
            />
            <h2 className="text-xl md:text-2xl font-medium text-emerald-400 uppercase tracking-[0.8em] opacity-80">
              {t('ending.chapter_name')}
            </h2>
          </motion.div>
        )}

        {phase === 2 && (
          <motion.div
            key="p2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 2.5 }}
            className="flex flex-col items-center text-center max-w-3xl px-12 z-10"
          >
            <p className="text-white/90 text-xl md:text-3xl font-light italic leading-relaxed tracking-wide font-serif mb-12">
              "{t('ending.thanks')}"
            </p>
            <div className="w-12 h-px bg-white/20 mb-12" />
            <p className="text-zinc-500 text-sm md:text-lg uppercase tracking-[0.4em] leading-loose">
              {t('ending.final_text')}
            </p>
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div
            key="p3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="flex flex-col items-center text-center z-10 py-20"
          >
             {creditItem("LEAD DEVELOPER", "ДАВИД")}
             {creditItem("STUDIO", t('ending.studio'))}
             {creditItem("TIMELINE", t('ending.duration'))}
          </motion.div>
        )}

        {phase === 4 && (
          <motion.div
            key="p4"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, type: 'spring', stiffness: 50, damping: 20 }}
            className="flex flex-col items-center text-center z-10"
          >
            <p className="text-white font-mono text-3xl md:text-5xl font-black uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {t('ending.to_be_continued')}
            </p>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 4 }}
              className="mt-8 h-px w-64 bg-emerald-500/50"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SkipButton onSkip={() => { setHasCompleted(true); resetGame(); setScreen(Screen.START); }} />

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none border-100 border-black/20 z-50 mix-blend-multiply" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(transparent_0%,rgba(0,0,0,0.4)_100%)] z-40" />
    </div>
  );
};
