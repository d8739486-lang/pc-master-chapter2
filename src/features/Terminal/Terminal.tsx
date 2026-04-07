import { useRef, useEffect, useState } from 'react';
import { useGameStore, Screen } from '@/core/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalGameStore } from './useTerminalGameStore';
import { useTerminalCommands } from './useTerminalCommands';
import TerminalLineParser from './TerminalLineParser';
import { TimelineEngine } from '@/core/TimelineEngine';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';
import { TerminalTaskOverlay } from './Tasks/TerminalTaskOverlay';


export const Terminal = () => {
  const { terminalHistory, currentPath } = useGameStore();
  const { isTyping, loadingPercent, loadingLabel, isGameOver, setIsGameOver } = useTerminalGameStore();
  const { t } = useI18n();
  
  const [escapeTimer, setEscapeTimer] = useState<number | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TimelineEngine | null>(null);
  const chatSubRef = useRef<(() => void) | null>(null);

  const { executeCommand } = useTerminalCommands(engineRef, chatSubRef, setEscapeTimer);

  const lastHistoryCount = useRef(terminalHistory.length);

  useEffect(() => {
    if (terminalHistory.length > lastHistoryCount.current) {
        audioManager.cmdT();
    }
    lastHistoryCount.current = terminalHistory.length;
    
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory, loadingPercent]);

  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      chatSubRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (escapeTimer === null || isGameOver) return;
    if (escapeTimer <= 0) {
      setIsGameOver(true);
      audioManager.stopMusic();
      audioManager.stopAllLoops();
      return;
    }
    const timerId = setTimeout(() => {
      setEscapeTimer(escapeTimer - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [escapeTimer, isGameOver, setIsGameOver]);

  const renderProgressBar = () => {
    if (loadingPercent === null) return null;
    const filled = Math.floor(loadingPercent / 4);
    const empty = 25 - filled;
    const bar = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-500 font-mono text-sm mt-3 border border-emerald-500/20 bg-zinc-900/50 p-2 rounded-sm inline-block min-w-[300px]">
        <div className="flex justify-between mb-1 opacity-70">
          <span className="text-[10px] tracking-widest text-emerald-400/80">{loadingLabel}</span>
          <span className="text-[10px] text-emerald-400/80">{loadingPercent}%</span>
        </div>
        <div>
          <span className="text-white/40">[</span>
          <span className={loadingPercent >= 100 ? 'text-green-400' : 'text-emerald-500/70'}>{bar}</span>
          <span className="text-white/40">]</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950/95 backdrop-blur-3xl border border-emerald-500/20 rounded-sm m-4 md:m-8 overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.1)] font-mono text-sm md:text-base cursor-default relative h-[85vh] w-full max-w-full">
      <div className="shrink-0 bg-black/80 z-20 border-b border-emerald-500/30 relative">
        <div className="bg-zinc-900/40 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
          </div>
          <span className="text-[11px] text-emerald-500/60 font-bold uppercase tracking-[0.2em] leading-none">
            neon_root@DD_SERVER:~
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 space-y-4 scrollbar-hide scroll-smooth relative bg-black/10"
      >
        <div className="flex flex-col justify-end min-h-full pb-10">
          <div className="space-y-4 max-w-4xl mx-auto w-full overflow-hidden">
             <div className="text-white/20 text-[10px] uppercase tracking-widest border-b border-white/5 pb-2 mb-6 shadow-sm">
               --- {t('terminal.history')} ---
             </div>
             
             {/* Dynamic rendering of lines */}
             <AnimatePresence initial={false}>
                {terminalHistory.map((line, i) => {
                  return (
                    <motion.div
                      key={i} // Using index because we want exact re-renders of history
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex gap-3 whitespace-pre-wrap wrap-break-word leading-relaxed py-0.5
                        ${line.type === 'input' ? 'text-emerald-400 font-bold' : ''}
                        ${line.type === 'output' ? 'text-white/80' : ''}
                        ${line.type === 'error' ? 'text-red-500/90 font-bold' : ''}
                        ${line.type === 'success' ? 'text-emerald-300 font-bold drop-shadow-[0_0_5px_rgba(0,255,0,0.4)]' : ''}
                        ${line.type === 'system' ? 'text-zinc-400 italic font-medium' : ''}
                      `}
                    >
                      <div className="flex-1 align-middle pt-1">
                        {line.type === 'input' && <span className="opacity-40 mr-2 uppercase tracking-wider text-xs">»</span>}
                        {/* Parse line content for interactive commands */}
                        <TerminalLineParser 
                          text={line.content} 
                          onCommandClick={executeCommand} 
                          disabled={isTyping} 
                        />
                      </div>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
             
             {renderProgressBar()}

             {escapeTimer !== null && (
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex gap-3 whitespace-pre-wrap wrap-break-word leading-relaxed py-0.5 text-red-500 font-black animate-pulse mt-4 border-l-2 border-red-500/50 pl-4 bg-red-950/5 font-mono"
               >
                 <div className="flex-1 align-middle pt-1">
                   <span className="opacity-40 mr-2 uppercase tracking-wider text-xs">»</span>
                   {t('terminal.countdown', { time: escapeTimer })}
                 </div>
               </motion.div>
             )}
           </div>
        </div>
      </div>

      {/* Mini-task overlay (Wire/Lever/Sort puzzles during loading) */}
      <TerminalTaskOverlay />

      <div className="shrink-0 bg-black/98 border-t border-emerald-500/30 z-30 shadow-[0_-10px_30px_rgba(16,185,129,0.05)] px-6 py-4 flex items-center justify-between">
        <div className="flex gap-4 items-center opacity-40">
          <span className="text-emerald-500 font-black tracking-widest text-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            {currentPath} $
          </span>
          <span className="w-3 h-5 bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
           {t('terminal.controls')}
        </div>
      </div>
    </div>
  );
};
