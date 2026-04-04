import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore, Screen } from '@/core/store';
import { MatrixRain } from '@/components/MatrixRain';
import { Power } from 'lucide-react';

import { useI18n } from '@/core/i18n';

export const LanguageSelect = () => {
  const { setScreen, setLanguage } = useGameStore();
  const { t } = useI18n();

  useEffect(() => {
    import('@/core/audio').then(({ audioManager }) => {
      audioManager.menuShow();
    });
  }, []);

  const handleSelect = (lang: 'en' | 'ru') => {
    setLanguage(lang);
    setScreen(Screen.PRELOADER);
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono select-none">
      <MatrixRain opacity={0.15} speed={80} color="#FFFFFF" />
      
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.4)_0%,rgba(0,0,0,1)_100%)] z-1 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="mb-20 flex flex-col items-center">
          <motion.div 
            animate={{ 
              boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 40px rgba(255,255,255,0.3)', '0 0 20px rgba(255,255,255,0.1)'] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 mb-10 rounded-full bg-white/5 flex items-center justify-center border border-white/20"
          >
            <Power className="w-12 h-12 text-white animate-pulse" />
          </motion.div>
          
          <h2 className="text-xs font-black uppercase tracking-[0.6em] text-white/50 mb-6 text-center">
            {t('lang_select.title')}
          </h2>
          <div className="h-px w-48 bg-linear-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          <button
            onClick={() => handleSelect('ru')}
            className="group relative px-20 py-8 border border-white/10 text-white/40 hover:border-white/50 hover:text-white transition-all font-black uppercase tracking-[0.4em] text-sm bg-white/2 rounded-xs overflow-hidden min-w-[280px]"
          >
            <span className="relative z-10 transition-transform group-hover:scale-110 block">{t('lang_select.ru')}</span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <button
            onClick={() => handleSelect('en')}
            className="group relative px-20 py-8 border border-white/10 text-white/40 hover:border-white/50 hover:text-white transition-all font-black uppercase tracking-[0.4em] text-sm bg-white/2 rounded-xs overflow-hidden min-w-[280px]"
          >
            <span className="relative z-10 transition-transform group-hover:scale-110 block">{t('lang_select.en')}</span>
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-12 w-full text-center">
        <p className="text-[10px] uppercase font-mono tracking-[0.4em] text-white/10">
          {t('lang_select.footer')}
        </p>
      </div>
    </div>
  );
};
