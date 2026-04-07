import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useTerminalGameStore } from '../useTerminalGameStore';
import { WirePuzzle } from './WirePuzzle';
import { LeverPuzzle } from './LeverPuzzle';
import { SortPuzzle } from './SortPuzzle';
import { GridPuzzle } from './GridPuzzle';
import { PacketPuzzle } from './PacketPuzzle';
import { PulsePuzzle } from './PulsePuzzle';

/**
 * Renders the active mini-task overlay inside the Terminal.
 * Appears when a loading sequence triggers a "manual override" task.
 */
export const TerminalTaskOverlay = () => {
  const { activeTask, completeTask } = useTerminalGameStore();

  // Global Task Cleanup (Sounds, etc.)
  useEffect(() => {
    return () => {
       // Optional: stop specific loops if any
    };
  }, []);

  return (
    <AnimatePresence>
      {activeTask && (
        <motion.div
          key="task-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden"
        >
          {/* Scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }}
          />

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/10" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/10" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/10" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/10" />

          {/* Header badge */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 border border-white/10 bg-black/60 rounded-sm"
          >
            <span className="text-[8px] text-white/40 uppercase tracking-[0.5em] font-mono font-black">
              MANUAL_OVERRIDE_REQUIRED
            </span>
          </motion.div>

          {/* Task content */}
          <div className="relative z-10 w-full max-w-lg px-4">
            {activeTask === 'WIRES' && <WirePuzzle onComplete={completeTask} />}
            {activeTask === 'LEVERS' && <LeverPuzzle onComplete={completeTask} />}
            {activeTask === 'SORT' && <SortPuzzle onComplete={completeTask} />}
            {activeTask === 'GRID' && <GridPuzzle onComplete={completeTask} />}
            {activeTask === 'SIGNAL' && <PacketPuzzle onComplete={completeTask} />}
            {activeTask === 'PULSE' && <PulsePuzzle onComplete={completeTask} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
