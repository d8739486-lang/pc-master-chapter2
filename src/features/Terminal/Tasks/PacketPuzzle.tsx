import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useUiStore } from '@/core/useUiStore';
import { useI18n } from '@/core/i18n';

interface IPacket {
  id: string;
  label: string;
  x: number;
  speed: number;
  isTarget: boolean;
  color: string;
}

interface IPacketPuzzleProps {
  onComplete: () => void;
}

const PACKET_LABELS = [
  'AUTH_TOK_0x7F', 'SYS_VAR_LOAD', 'ADDR:0x4E2B', 'FILE:.avalon',
  'CRYPT_KEY_44', 'ROOT_ACCESS', 'SYNC_PORT_80', 'DB_LINK_EST',
  'VOIP_UDP_ERR', 'HALT_SEQ_11', 'TEMP_LOG_TMP', 'KERN_PANIC'
];

export const PacketPuzzle = ({ onComplete }: IPacketPuzzleProps) => {
  const { t } = useI18n();
  const { triggerShake } = useUiStore();

  const [hits, setHits] = useState(0);
  const [targetLabel, setTargetLabel] = useState('');
  const [packets, setPackets] = useState<IPacket[]>([]);
  const [completed, setCompleted] = useState(false);
  
  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const speedMultiplier = 1 + (hits * 0.1); // Even slower scaling

  // Initialize first target
  useEffect(() => {
    setTargetLabel(PACKET_LABELS[Math.floor(Math.random() * PACKET_LABELS.length)]);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, []);

  const spawnPacket = useCallback(() => {
    const isTarget = Math.random() > 0.65; // High target chance
    const label = isTarget ? targetLabel : PACKET_LABELS[Math.floor(Math.random() * PACKET_LABELS.length)];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      label,
      x: -150,
      speed: (0.8 + Math.random() * 1.2) * speedMultiplier, // Very slow base
      isTarget,
      color: isTarget ? '#10b981' : '#ef444444'
    };
  }, [targetLabel, speedMultiplier]);

  const updatePackets = useCallback(() => {
    const now = performance.now();
    const dt = Math.min(32, now - lastTimeRef.current); // Clamp DT to avoid jumps
    const deltaTimeMultiplier = dt / 16.66; // Normalize to 60fps
    lastTimeRef.current = now;

    setPackets(prev => {
      // Move all packets based on Delta Time (Frame-rate independent)
      let next = prev.map(p => ({ ...p, x: p.x + (p.speed * deltaTimeMultiplier) })).filter(p => p.x < 650);
      
      // Spawn new packet
      if (now - lastSpawnRef.current > 1800 / speedMultiplier) {
        next.push(spawnPacket());
        lastSpawnRef.current = now;
      }
      return next;
    });
    
    requestRef.current = requestAnimationFrame(updatePackets);
  }, [spawnPacket, speedMultiplier]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updatePackets);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updatePackets]);

  const handleIntercept = (p: IPacket) => {
    if (completed) return;

    if (p.isTarget) {
      audioManager.pulseTick();
      const newHits = hits + 1;
      setHits(newHits);
      setPackets(prev => prev.filter(pkg => pkg.id !== p.id));
      
      if (newHits >= 5) {
        setCompleted(true);
        audioManager.complete();
        setTimeout(onComplete, 1500);
      } else {
        // Change target label for more variety
        setTargetLabel(PACKET_LABELS[Math.floor(Math.random() * PACKET_LABELS.length)]);
      }
    } else {
      audioManager.unbuy();
      triggerShake('small', 250);
      setHits(h => Math.max(0, h - 1));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-xl mx-auto h-[480px] bg-black/90 rounded-2xl border border-emerald-500/30 backdrop-blur-xl p-8 flex flex-col items-center justify-between font-mono shadow-[0_0_50px_rgba(16,185,129,0.1)]"
    >
      {/* Header Info */}
      <div className="w-full flex justify-between items-start">
        <div>
          <h3 className="text-emerald-400 text-xs font-black tracking-[0.4em] uppercase mb-1">PACKET_SNIFFER_v4.0</h3>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-4 h-1 rounded-full ${i <= hits ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/5'}`} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-white/30 uppercase tracking-widest">interception_success</span>
          <div className="text-emerald-500 font-black text-xl tracking-tighter">{(hits / 5 * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Target Focus Display */}
      <div className="w-full bg-zinc-950 border border-emerald-500/10 rounded-lg p-6 flex flex-col items-center shadow-inner">
        <span className="text-[9px] text-emerald-500/40 uppercase mb-3 tracking-[0.6em]">TARGET_SIGNATURE</span>
        <div className="text-2xl font-black text-emerald-400 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
           {targetLabel}
        </div>
      </div>

      {/* Interception Zone */}
      <div className="relative w-full h-40 bg-black/40 border-y border-white/5 overflow-hidden">
         {/* Center Crosshair */}
         <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-48 border-x border-emerald-500/10 bg-emerald-500/5 pointer-events-none" />
         <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-emerald-500/20" />
         
         <div className="absolute inset-0 pointer-events-none opacity-20" 
              style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, #fff 50%)', backgroundSize: '4px 100%' }} />

         {/* Animating Packets */}
         {packets.map(p => (
           <motion.button
             key={p.id}
             style={{ left: p.x }}
             onClick={() => handleIntercept(p)}
             className={`absolute top-1/2 -translate-y-1/2 px-4 py-2 rounded border truncate max-w-[140px] text-[10px] font-black transition-all
               ${p.isTarget ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/10 bg-black text-white/40 hover:border-red-500/40'}
             `}
           >
             {p.label}
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-current opacity-20" />
           </motion.button>
         ))}
      </div>

      <div className="text-[8px] text-white/20 uppercase tracking-[0.4em] animate-pulse">
         Intercept_Target_Packets_Only // Avoiding_Corrupted_Nodes
      </div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-emerald-950/90 backdrop-blur-2xl">
             <div className="text-center">
                <h2 className="text-emerald-500 font-black text-3xl tracking-[1em] uppercase mb-4">DECRYPTED</h2>
                <div className="w-48 h-1 bg-emerald-500/20 mx-auto rounded-full overflow-hidden">
                   <motion.div animate={{ width: '100%' }} transition={{ duration: 1 }} className="h-full bg-emerald-500" />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
