import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useGameStore, Screen } from '@/core/store';
import { useI18n } from '@/core/i18n';

export const Preloader = () => {
  const { setScreen } = useGameStore();
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(t('preloader.initializing'));
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!hasInteracted) return; // Wait for initial click to comply with browser policy

    let isMounted = true;
    
    const loadAssets = async () => {
      const totalSteps = 100;
      for (let i = 0; i <= totalSteps; i++) {
        if (!isMounted) return;
        
        setProgress(i);
        
        if (i === 15) setStatusText(t('preloader.connecting'));
        if (i === 40) setStatusText(t('preloader.bypassing'));
        if (i === 70) setStatusText(t('preloader.loading_cinematics'));
        if (i === 90) setStatusText(t('preloader.syncing'));
        
        let waitTime = 10 + Math.random() * 20; 
        if (i === 15 || i === 40 || i === 70 || i === 90) {
           waitTime = 300 + Math.random() * 500;
        } else if (Math.random() > 0.95) {
           waitTime = 100 + Math.random() * 200;
        }

        await new Promise(r => setTimeout(r, waitTime));
      }

      if (isMounted) {
        setStatusText(t('preloader.secured'));
        await new Promise(r => setTimeout(r, 800));
        setScreen(Screen.START);
      }
    };

    loadAssets();
    return () => { isMounted = false; };
  }, [setScreen, hasInteracted]);

  const handleInitialInteraction = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        console.warn("Fullscreen blocked by browser policy.");
      });
    }
    setHasInteracted(true);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden font-mono bg-black">
      {/* Cinematic Gradient Background (Matching StartMenu) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(40,40,40,1)_0%,rgba(20,20,20,1)_50%,rgba(0,0,0,1)_100%)] z-0" />
      
      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="h-px w-full bg-white absolute top-1/4" />
          <div className="h-px w-full bg-white absolute bottom-1/4" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 w-full max-w-md px-10 flex flex-col items-center"
      >
        {!hasInteracted ? (
          <div
            className="flex flex-col items-center gap-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black tracking-[0.8em] uppercase mb-2 text-white select-none"
            >
              NEON_ROOT
            </motion.div>
            <motion.button
              onClick={handleInitialInteraction}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/40 transition-all rounded-sm flex flex-col items-center gap-4 cursor-pointer group shadow-[0_0_30px_rgba(255,255,255,0.02)] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 group-hover:text-white transition-colors">
                {t('preloader.click_to_start')}
              </span>
              <p className="text-[7px] text-white/20 uppercase tracking-[0.4em] italic group-hover:text-white/40 transition-colors">
                {t('preloader.auto_fullscreen')}
              </p>
            </motion.button>
          </div>
        ) : (
          <>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-black tracking-[0.6em] uppercase mb-4 text-transparent bg-clip-text bg-linear-to-b from-white to-white/40"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>
                NEON_ROOT
              </h2>
              <div className="h-px w-32 bg-white/10 mx-auto mb-6" />
              <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-black h-4 overflow-hidden">
                {statusText}
              </p>
            </div>

            {/* Silver Cinematic Progress Bar */}
            <div className="w-full h-[3px] bg-white/5 relative overflow-hidden rounded-full">
              <motion.div 
                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>

            <div className="w-full flex justify-between mt-5 text-[9px] uppercase font-black tracking-[0.4em] text-white/20">
              <span>{t('preloader.uplinking')}</span>
              <span>{progress}%</span>
            </div>

            {/* Subtle footer detail */}
            <div className="mt-20 text-center text-white/5 text-[8px] tracking-[0.8em] uppercase">
              SECURE_PORT_8080 // SYNC_ACTIVE
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
