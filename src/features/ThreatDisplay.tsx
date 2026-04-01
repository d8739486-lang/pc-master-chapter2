import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/core/useChatStore';
import { Shield, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Special display for DD threats (intercepted signals).
 * Separated from the main friend chat to prevent "DD window" in the same place.
 */
export const ThreatDisplay = () => {
  const { messages, removeMessage } = useChatStore();
  const [activeThreat, setActiveThreat] = useState<any>(null);

  /** Watch for latest threat message */
  useEffect(() => {
    const threats = messages.filter(m => m.type === 'threat');
    if (threats.length > 0) {
      setActiveThreat(threats[threats.length - 1]);
    } else {
      setActiveThreat(null);
    }
  }, [messages]);

  if (!activeThreat) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-24 right-4 z-800 w-[350px] bg-red-950/90 border border-red-500/50 rounded-lg shadow-[0_0_50px_rgba(255,0,0,0.3)] backdrop-blur-xl p-4 overflow-hidden"
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 border-b border-red-500/20 pb-2 relative z-10">
          <div className="p-1.5 bg-red-500/20 rounded-md">
            <Shield className="w-4 h-4 text-red-500 animate-bounce" />
          </div>
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">
            INTERCEPTED_THREAT // DD_SYSTEM
          </span>
          <button 
            onClick={() => removeMessage(activeThreat.id)}
            className="ml-auto text-red-500/40 hover:text-red-500 transition-colors text-[10px] font-bold"
          >
            [ DISMISS ]
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-1" />
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-bold text-red-400/60 uppercase">Source: Digital Dreams</span>
             <p className="text-xs font-mono text-red-100/90 leading-relaxed italic">
               "{activeThreat.text}"
             </p>
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,0,0,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
      </motion.div>
    </AnimatePresence>
  );
};
