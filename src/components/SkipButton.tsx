import { motion } from 'framer-motion';
import { useGameStore } from '@/core/store';
import { useI18n } from '@/core/i18n';
import { audioManager } from '@/core/audio';
import { FastForward } from 'lucide-react';

interface SkipButtonProps {
  onSkip: () => void;
  className?: string;
}

/**
 * A reusable Skip button that only appears if the player has completed the game at least once.
 */
export const SkipButton = ({ onSkip, className = "" }: SkipButtonProps) => {
  const { hasCompleted } = useGameStore();
  const { t } = useI18n();

  const handleSkip = () => {
    audioManager.stopAll();
    onSkip();
  };

  if (!hasCompleted) return null;

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSkip}
      className={`fixed bottom-8 right-8 z-100 flex items-center gap-3 px-6 py-3 
                 bg-black/40 backdrop-blur-md border border-emerald-500/30 rounded-lg 
                 text-emerald-400 font-mono text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.1)]
                 transition-all duration-300 hover:border-emerald-500/60 group ${className}`}
    >
      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
        {t('ending.skip')}
      </span>
      <FastForward size={14} className="group-hover:translate-x-1 transition-transform" />
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50" />
    </motion.button>
  );
};
