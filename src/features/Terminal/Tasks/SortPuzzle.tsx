import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';

/**
 * Sort Puzzle:
 * - 6 colored data orbs appear in a scrambled area
 * - 3 matching slots at the bottom (each takes 2 orbs of same color)
 * - Player drags orbs to the correct slot
 * - Physics-like spring animations and snap behavior
 */

const ORB_COLORS = [
  { id: 'violet', hex: '#a855f7', glow: 'rgba(168,85,247,0.5)', label: 'VIO' },
  { id: 'blue', hex: '#3b82f6', glow: 'rgba(59,130,246,0.5)', label: 'BLU' },
  { id: 'orange', hex: '#f97316', glow: 'rgba(249,115,22,0.5)', label: 'ORG' },
];

interface IOrb {
  id: string;
  colorId: string;
  hex: string;
  glow: string;
  startX: number;
  startY: number;
}

interface ISlot {
  id: string;
  colorId: string;
  hex: string;
  glow: string;
  filled: number; // 0, 1, or 2
}

interface ISortPuzzleProps {
  onComplete: () => void;
}

export const SortPuzzle = ({ onComplete }: ISortPuzzleProps) => {
  const { t } = useI18n();

  const orbs = useMemo<IOrb[]>(() => {
    const items: IOrb[] = [];
    ORB_COLORS.forEach(c => {
      items.push({
        id: `orb-${c.id}-0`,
        colorId: c.id,
        hex: c.hex,
        glow: c.glow,
        startX: 30 + Math.random() * 200,
        startY: 10 + Math.random() * 80,
      });
      items.push({
        id: `orb-${c.id}-1`,
        colorId: c.id,
        hex: c.hex,
        glow: c.glow,
        startX: 30 + Math.random() * 200,
        startY: 10 + Math.random() * 80,
      });
    });
    // Shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }, []);

  const [slots, setSlots] = useState<ISlot[]>(
    ORB_COLORS.map(c => ({
      id: `slot-${c.id}`,
      colorId: c.id,
      hex: c.hex,
      glow: c.glow,
      filled: 0,
    }))
  );

  const [placedOrbs, setPlacedOrbs] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  // Check completion
  useEffect(() => {
    if (placedOrbs.size === 6 && !completed) {
      setCompleted(true);
      audioManager.complete();
      setTimeout(onComplete, 1000);
    }
  }, [placedOrbs.size, completed, onComplete]);

  const handleDragEnd = useCallback(
    (orbId: string, orbColorId: string, event: MouseEvent | TouchEvent | PointerEvent) => {
      if (completed || placedOrbs.has(orbId)) return;

      // Find which slot element we're over
      const clientX = 'clientX' in event ? event.clientX : (event as TouchEvent).touches?.[0]?.clientX ?? 0;
      const clientY = 'clientY' in event ? event.clientY : (event as TouchEvent).touches?.[0]?.clientY ?? 0;

      const elements = document.elementsFromPoint(clientX, clientY);
      const slotEl = elements.find(el => el.getAttribute('data-slot-color'));

      if (slotEl) {
        const slotColorId = slotEl.getAttribute('data-slot-color');
        const matchingSlot = slots.find(s => s.colorId === slotColorId);

        if (matchingSlot && slotColorId === orbColorId && matchingSlot.filled < 2) {
          // Correct match!
          audioManager.click();

          setSlots(prev =>
            prev.map(s =>
              s.colorId === slotColorId ? { ...s, filled: s.filled + 1 } : s
            )
          );

          setPlacedOrbs(prev => new Set([...prev, orbId]));
        } else if (matchingSlot && slotColorId !== orbColorId) {
          // Wrong slot
          audioManager.unbuy();
        } else {
          // Dropped on a slot that is full or not a slot at all
          audioManager.unbuy();
        }
      } else {
        // Dropped nowhere
        audioManager.unbuy();
      }
    },
    [completed, placedOrbs, slots]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full max-w-md mx-auto select-none"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-purple-400 text-xs font-black tracking-[0.4em] uppercase mb-1">
          {t('tasks.sort_title')}
        </h3>
        <p className="text-white/30 text-[9px] tracking-[0.3em] uppercase">
          {t('tasks.sort_subtitle')}
        </p>
      </div>

      <div className="bg-black/60 border border-purple-500/20 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden">
        {/* Background hex pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(168,85,247,0.3) 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Orb area */}
        <div className="relative h-36 mb-6 border border-white/5 rounded-md bg-black/30">
          <div className="absolute top-1 left-2 text-[7px] text-white/15 uppercase tracking-widest font-mono">
            DATA_BUFFER
          </div>

          <AnimatePresence>
            {orbs.map(orb => {
              if (placedOrbs.has(orb.id)) return null;
              return (
                <motion.div
                  key={orb.id}
                  drag={!completed}
                  dragMomentum={false}
                  dragElastic={0.1}
                  whileDrag={{ scale: 1.15, zIndex: 50 }}
                  whileHover={{ scale: 1.08 }}
                  onDragEnd={(e, _info) => handleDragEnd(orb.id, orb.colorId, e as unknown as MouseEvent)}
                  initial={{ x: orb.startX, y: orb.startY, scale: 0 }}
                  animate={{ x: orb.startX, y: orb.startY, scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute w-12 h-12 rounded-full cursor-grab active:cursor-grabbing z-10"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${orb.hex}dd, ${orb.hex}88, ${orb.hex}44)`,
                    boxShadow: `0 0 15px ${orb.glow}, 0 0 30px ${orb.glow}, inset 0 -3px 6px rgba(0,0,0,0.4)`,
                    border: `2px solid ${orb.hex}88`,
                  }}
                >
                  {/* Glass highlight */}
                  <div className="absolute top-1.5 left-2.5 w-4 h-3 rounded-full bg-white/30 blur-[1px]" />
                  {/* Inner glow */}
                  <div className="absolute inset-2 rounded-full"
                    style={{ background: `radial-gradient(circle at 40% 40%, ${orb.hex}66, transparent)` }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Slots row */}
        <div className="flex justify-center gap-4">
          {slots.map(slot => (
            <div
              key={slot.id}
              data-slot-color={slot.colorId}
              className="flex flex-col items-center gap-1"
            >
              {/* Slot container */}
              <div
                data-slot-color={slot.colorId}
                className={`
                  w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center
                  transition-all duration-300 relative overflow-hidden
                  ${slot.filled === 2
                    ? 'border-solid shadow-[0_0_20px_var(--glow)]'
                    : 'hover:border-opacity-60'
                  }
                `}
                style={{
                  borderColor: slot.filled > 0 ? slot.hex : `${slot.hex}44`,
                  backgroundColor: slot.filled > 0 ? `${slot.hex}15` : 'rgba(0,0,0,0.3)',
                  // @ts-ignore
                  '--glow': slot.glow,
                }}
              >
                {/* Fill indicators */}
                <div className="flex gap-1.5">
                  {[0, 1].map(i => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: i < slot.filled ? 1 : 0.5,
                        opacity: i < slot.filled ? 1 : 0.2,
                      }}
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: i < slot.filled ? slot.hex : `${slot.hex}33`,
                        boxShadow: i < slot.filled ? `0 0 8px ${slot.glow}` : 'none',
                      }}
                    />
                  ))}
                </div>

                {/* Completion glow */}
                {slot.filled === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-lg"
                    style={{ background: `radial-gradient(circle, ${slot.glow}, transparent)` }}
                  />
                )}
              </div>

              {/* Slot label */}
              <span className="text-[8px] uppercase tracking-widest font-mono"
                style={{ color: slot.filled === 2 ? slot.hex : `${slot.hex}66` }}
              >
                {slot.filled}/2
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 flex items-center gap-2 justify-center">
        <span className="text-[9px] text-white/30 uppercase tracking-widest">{t('tasks.sorted')}</span>
        <span className="text-[9px] text-white/50 font-mono">{placedOrbs.size}/6</span>
      </div>

      {/* Completion overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg z-30"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-purple-400 font-black text-lg tracking-[0.5em] uppercase"
              style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}
            >
              {t('tasks.complete')}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
