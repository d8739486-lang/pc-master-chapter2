import { useEffect, useState } from 'react';
import { useGameStore } from '@/core/store';
import { useModalStore, MODAL_TYPES } from '@/core/useModalStore';
import { useUiStore } from '@/core/useUiStore';
import { useScreenShake } from '@/core/hooks/useScreenShake';
import { useBlurEffect } from '@/core/hooks/useBlurEffect';
import { useGlitchText } from '@/core/hooks/useGlitchText';
import { useRedFlash } from '@/core/hooks/useRedFlash';
import { audioManager } from '@/core/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Terminal as TerminalIcon } from 'lucide-react';
import { Terminal } from '@/features/Terminal';
import { GameChat } from '@/features/GameChat';
import { FriendNotifications } from '@/features/FriendNotifications';
import { ThreatDisplay } from '@/features/ThreatDisplay';
import { useChatStore } from '@/core/useChatStore';
import { useTerminalGameStore } from './Terminal/useTerminalGameStore';
import { useI18n } from '@/core/i18n';

/**
 * GameView — main game screen with terminal, effects, and chat.
 * game.mp3 starts on mount and persists (never interrupted by timeline).
 */
export const GameView = () => {
  const { evolution, resetGame } = useGameStore();
  const { openModal } = useModalStore();
  const { isGameOver, resetTerminalGame } = useTerminalGameStore();
  const { ddPopupOpen, ddPopupExploding } = useUiStore();
  const [showLoseContent, setShowLoseContent] = useState(false);
  const { t } = useI18n();

  // Effect hooks
  const shakeProps = useScreenShake();
  const blurStyle = useBlurEffect();
  const glitch = useGlitchText();
  const redFlashStyle = useRedFlash();

  // Start game music on mount — persists through entire game screen
  useEffect(() => {
    audioManager.game();

    // Plot check: ensure chat is clear and the friend gives the first instruction
    const chatStore = useChatStore.getState();
    chatStore.resetAll(); // Clear chat upon entering CMD

    setTimeout(() => {
      const currentMsgs = useChatStore.getState().messages;
      const alreadyHasWelcome = currentMsgs.some(m => m.text.includes('Мы на месте') || m.text.includes(t('game_view.welcome1').slice(0, 10)));
      
      if (!alreadyHasWelcome) {
        chatStore.addMessage({
          author: t('chat.friend_name'),
          text: t('game_view.welcome1'),
          type: 'normal'
        });
        chatStore.addMessage({
          author: t('chat.friend_name'),
          text: t('game_view.welcome2'),
          type: 'normal'
        });
        chatStore.incrementUnread();
        chatStore.incrementUnread();
        audioManager.message();
      }
    }, 2000);

    // Cleanup on unmount resets UI effects
    return () => {
      useUiStore.getState().resetAll();
      audioManager.stopAllLoops();
    };
  }, []);

  useEffect(() => {
    if (isGameOver) {
      setShowLoseContent(true);
      audioManager.lose();
    } else {
      setShowLoseContent(false);
    }
  }, [isGameOver]);

  const handleRestart = () => {
    resetTerminalGame();
    resetGame();
    useChatStore.getState().resetAll();
    useUiStore.getState().resetAll();
    audioManager.stopAllLoops();
    audioManager.stopMusic();
    audioManager.cmdT();
  };

  return (
    <div
      className={`stage-${evolution} relative h-screen w-screen overflow-hidden flex flex-col bg-black transition-colors duration-1000 select-none`}
    >
      {/* ═══ Background Effects ═══ */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, var(--theme-primary) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div className="absolute inset-0 bg-[url('/textures/bg_grid.png')] opacity-[0.03]" />
      </div>

      {/* ═══ RED FLASH OVERLAY ═══ */}
      <div
        className="absolute inset-0 z-100 bg-red-600 pointer-events-none"
        style={redFlashStyle}
      />

      {/* ═══ GLITCH TEXT OVERLAY ═══ */}
      <AnimatePresence>
        {glitch.isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-90 flex items-center justify-center pointer-events-none"
          >
            <div className="text-6xl md:text-8xl font-black text-red-500/60 tracking-widest select-none mix-blend-screen">
              {glitch.text}
            </div>
            {/* Scanline effect over glitch */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT (with shake + blur) ═══ */}
      <motion.div
        {...shakeProps}
        style={blurStyle}
        className="relative z-10 flex flex-col h-full w-full"
      >
        {/* ═══ TOP BAR ═══ */}
        <header className="h-14 shrink-0 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-black/90 backdrop-blur-md z-30 relative">
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-5 h-5 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">
              encrypted tunnel ~NEON-ROOT
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-primary font-bold uppercase tracking-[0.2em] animate-pulse">
                [ SECURE_CONNECTION_STABLE ]
              </span>
            </div>
            <div className="w-px h-6 bg-white/5 mx-2" />
            <button
              type="button"
              onClick={() => openModal(MODAL_TYPES.SETTINGS)}
              className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-sm transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ═══ MAIN TERMINAL ═══ */}
        <main className="flex-1 flex flex-col relative z-20 overflow-hidden min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-1 flex flex-col max-w-[1200px] w-full mx-auto"
          >
            <Terminal />
          </motion.div>
        </main>

        {/* Footer Info */}
        <footer className="h-8 px-8 flex items-center justify-between bg-black/80 border-t border-white/5 z-30 text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] shrink-0">
          <span>Location: Sector_7_Node_DD</span>
          <span>Encryption: AES-256-BIT</span>
        </footer>
      </motion.div>

      {/* ═══ CHAT (rendered outside blur scope) ═══ */}
      <GameChat />
      <FriendNotifications />
      <ThreatDisplay />

      {/* ═══ GAME OVER OVERLAY ═══ */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-black flex flex-col items-center justify-center pointer-events-auto"
          >
            {showLoseContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="flex flex-col items-center gap-10"
              >
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase animate-pulse">
                  {t('game_view.lose')}
                </h1>
                
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  onClick={handleRestart}
                  className="px-10 py-3 border-b-2 border-white/20 hover:border-white text-white/40 hover:text-white transition-all text-sm uppercase tracking-[0.5em] font-mono"
                >
                  {t('defense.restart')}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ DD UNCLOSEABLE POPUP ═══ */}
      <AnimatePresence>
        {ddPopupOpen && (
          <div className={`fixed inset-0 z-1200 flex items-center justify-center transition-all duration-700 ${ddPopupExploding ? 'bg-transparent backdrop-blur-none pointer-events-none' : 'bg-black/80 backdrop-blur-md'}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={
                ddPopupExploding 
                  ? { opacity: 0, scale: 0.3, y: 1500, rotate: 45 } 
                  : { opacity: 1, scale: 1, y: 0, rotate: 0 }
              }
              transition={{ duration: ddPopupExploding ? 1.2 : 0.3, ease: 'easeIn' }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[600px] border-2 border-red-600 bg-red-950/80 p-8 flex flex-col items-center text-center shadow-[0_0_100px_rgba(255,0,0,0.5)] relative"
            >
              {/* Explosion Particles */}
              {ddPopupExploding && Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-3 h-3 bg-red-500 shadow-[0_0_10px_rgba(255,0,0,1)]"
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 1500, // Shoot out wide
                    y: (Math.random() - 0.5) * 1500,
                    rotate: Math.random() * 720,
                    opacity: 0,
                    scale: Math.random() * 2
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              ))}

              <div className="text-6xl mb-4 text-red-500 animate-pulse">⚠</div>
              <h2 className="text-3xl font-black text-red-500 tracking-widest uppercase mb-4">
                {t('game_view.dd_title')}
              </h2>
              <p className="text-red-200 font-mono text-lg mb-8 leading-relaxed">
                {t('game_view.dd_line1')}
                <br />
                {t('game_view.dd_line2')}
                <br />
                {t('game_view.dd_line3')}
              </p>
              <div className="text-red-500/50 text-[10px] uppercase tracking-[0.5em] animate-pulse">
                {t('game_view.dd_blocked')}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
