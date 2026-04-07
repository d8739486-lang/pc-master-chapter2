import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';

/**
 * Wire colors — neon-themed palette.
 * Only 4 colors, 1 of each per side for clarity and space.
 */
const WIRE_COLORS = [
  { id: 'red', hex: '#ff3b5c', glow: 'rgba(255,59,92,0.6)', label: 'R' },
  { id: 'cyan', hex: '#00f0ff', glow: 'rgba(0,240,255,0.6)', label: 'C' },
  { id: 'gold', hex: '#ffd700', glow: 'rgba(255,215,0,0.6)', label: 'G' },
  { id: 'lime', hex: '#39ff14', glow: 'rgba(57,255,20,0.6)', label: 'L' },
];

interface IWireEndpoint {
  id: string;
  colorId: string;
  hex: string;
  glow: string;
  side: 'left' | 'right';
}

interface IConnection {
  leftId: string;
  rightId: string;
  colorId: string;
  hex: string;
  lx: number;
  ly: number;
  rx: number;
  ry: number;
}

interface ISpark {
  id: number;
  x: number;
  y: number;
  color: string;
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

interface IWirePuzzleProps {
  onComplete: () => void;
}

export const WirePuzzle = ({ onComplete }: IWirePuzzleProps) => {
  const { t } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const endpointRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sparkIdRef = useRef(0);

  // 1 endpoint per color per side = 4 connections total
  const { leftEndpoints, rightEndpoints } = useMemo(() => ({
    leftEndpoints: shuffleArray(WIRE_COLORS.map(c => ({ id: `L-${c.id}`, colorId: c.id, hex: c.hex, glow: c.glow, side: 'left' as const }))),
    rightEndpoints: shuffleArray(WIRE_COLORS.map(c => ({ id: `R-${c.id}`, colorId: c.id, hex: c.hex, glow: c.glow, side: 'right' as const }))),
  }), []);

  const [connections, setConnections] = useState<IConnection[]>([]);
  const [dragging, setDragging] = useState<{ endpoint: IWireEndpoint; mouseX: number; mouseY: number } | null>(null);
  const [sparks, setSparks] = useState<ISpark[]>([]);
  const [completed, setCompleted] = useState(false);

  // Ultra-stable coordinate resolver using Direct Refs
  const getEndpointCenter = useCallback((endpointId: string) => {
    const el = endpointRefs.current[endpointId];
    const svg = svgRef.current;
    if (!el || !svg) return { x: 0, y: 0 };
    const elRect = el.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    return {
      x: elRect.left + elRect.width / 2 - svgRect.left,
      y: elRect.top + elRect.height / 2 - svgRect.top,
    };
  }, []);

  // Update positions to ensure no "hanging" wires after resize
  useEffect(() => {
    const handleResize = () => {
      setConnections(prev => prev.map(conn => {
        const lp = getEndpointCenter(conn.leftId);
        const rp = getEndpointCenter(conn.rightId);
        return (lp.x === 0 || rp.x === 0) ? conn : { ...conn, lx: lp.x, ly: lp.y, rx: rp.x, ry: rp.y };
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getEndpointCenter]);

  useEffect(() => {
    if (connections.length === 4 && !completed) {
      setCompleted(true);
      audioManager.complete();
      setTimeout(onComplete, 1200);
    }
  }, [connections.length, completed, onComplete]);

  const spawnSparks = useCallback((x: number, y: number, color: string) => {
    const newSparks: ISpark[] = Array.from({ length: 6 }, () => ({
      id: sparkIdRef.current++,
      x, y, color,
    }));
    setSparks(prev => [...prev, ...newSparks]);
    setTimeout(() => setSparks(prev => prev.filter(s => !newSparks.includes(s))), 600);
  }, []);

  const isConnected = useCallback((id: string) => connections.some(c => c.leftId === id || c.rightId === id), [connections]);

  const handleMouseDown = (ep: IWireEndpoint, e: React.MouseEvent) => {
    if (completed || ep.side !== 'left' || isConnected(ep.id) || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    audioManager.elPICK();
    spawnSparks(mx, my, ep.hex);
    setDragging({ endpoint: ep, mouseX: mx, mouseY: my });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setDragging({ ...dragging, mouseX: e.clientX - rect.left, mouseY: e.clientY - rect.top });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragging) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const epEl = target?.closest('[data-wire-side="right"]');
    let success = false;

    if (epEl) {
      const rid = epEl.getAttribute('data-wire-id');
      const rcol = epEl.getAttribute('data-wire-color');
      if (rid && rcol === dragging.endpoint.colorId && !isConnected(rid)) {
        const lp = getEndpointCenter(dragging.endpoint.id);
        const rp = getEndpointCenter(rid);
        
        // Final safety check: if coords failed, try once more after a tiny tick
        if (lp.x !== 0 && rp.x !== 0) {
          setConnections(prev => [...prev, {
            leftId: dragging.endpoint.id, rightId: rid,
            colorId: rcol, hex: dragging.endpoint.hex,
            lx: lp.x, ly: lp.y, rx: rp.x, ry: rp.y
          }]);
          spawnSparks(rp.x, rp.y, dragging.endpoint.hex);
          audioManager.elIN();
          success = true;
        }
      }
    }
    
    if (!success) {
      audioManager.elDROP();
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) spawnSparks(e.clientX - rect.left, e.clientY - rect.top, dragging.endpoint.hex);
    }
    setDragging(null);
  };

  const renderEp = (ep: IWireEndpoint) => {
    const active = isConnected(ep.id);
    return (
      <div 
        key={ep.id}
        ref={el => endpointRefs.current[ep.id] = el}
        data-wire-id={ep.id}
        data-wire-side={ep.side}
        data-wire-color={ep.colorId}
        onMouseDown={e => handleMouseDown(ep, e)}
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
          ${active ? 'scale-110' : 'hover:scale-110 border-white/20 hover:border-white/60'}
        `}
        style={{ 
          backgroundColor: active ? ep.hex : `${ep.hex}22`,
          borderColor: active ? ep.hex : undefined,
          boxShadow: active ? `0 0 20px ${ep.glow}` : `0 0 5px ${ep.glow}`
        }}
      >
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ep.hex }} />
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto font-mono select-none" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="text-center mb-8">
        <h3 className="text-emerald-400 text-xs font-black tracking-[0.4em] uppercase">{t('tasks.wire_title')}</h3>
      </div>

      <div className="relative bg-black/40 border border-white/5 rounded-xl p-10 h-[400px]">
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          {connections.map(c => (
            <motion.path 
              key={c.leftId} 
              d={`M ${c.lx} ${c.ly} C ${(c.lx+c.rx)/2} ${c.ly}, ${(c.lx+c.rx)/2} ${c.ry}, ${c.rx} ${c.ry}`}
              stroke={c.hex} strokeWidth={4} fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              style={{ filter: `drop-shadow(0 0 8px ${c.hex})` }}
            />
          ))}
          {dragging && (() => {
            const sp = getEndpointCenter(dragging.endpoint.id);
            return (
              <path 
                d={`M ${sp.x} ${sp.y} C ${(sp.x+dragging.mouseX)/2} ${sp.y}, ${(sp.x+dragging.mouseX)/2} ${dragging.mouseY}, ${dragging.mouseX} ${dragging.mouseY}`}
                stroke={dragging.endpoint.hex} strokeWidth={3} fill="none" strokeDasharray="6 4" opacity={0.6}
              />
            );
          })()}
        </svg>

        <div className="flex justify-between items-center h-full relative z-20">
          <div className="flex flex-col justify-around h-full">{leftEndpoints.map(renderEp)}</div>
          <div className="flex flex-col justify-around h-full">{rightEndpoints.map(renderEp)}</div>
        </div>

        <AnimatePresence>
          {sparks.map(s => (
            <motion.div key={s.id} className="absolute w-1.5 h-1.5 rounded-full" style={{ left: s.x, top: s.y, backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}` }} animate={{ x: (Math.random()-0.5)*60, y: (Math.random()-0.5)*60, opacity: 0, scale: 0 }} transition={{ duration: 0.5 }} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
