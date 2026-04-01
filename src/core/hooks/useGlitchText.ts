import { useUiStore } from '@/core/useUiStore';
import { useState, useEffect, useRef } from 'react';

const CORRUPT_CHARS = '░▒▓█▄▀■□▪▫▲△▼▽◆◇○●◌◍◎☠☢☣⚠⚡✕✖✗✘ᚠᚢᚦᚨᛃᛇᛈᛉᛊ';

/**
 * Returns a corrupted version of the glitch text from uiStore.
 * Randomly replaces characters each frame for a "hallucination" effect.
 */
export const useGlitchText = () => {
  const glitchText = useUiStore((s) => s.glitchText);
  const [display, setDisplay] = useState<string | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!glitchText) {
      setDisplay(null);
      return;
    }

    const corrupt = () => {
      const result = glitchText
        .split('')
        .map((ch) => {
          if (ch === ' ') return ' ';
          // 30% chance to corrupt each character
          if (Math.random() < 0.3) {
            return CORRUPT_CHARS[Math.floor(Math.random() * CORRUPT_CHARS.length)];
          }
          return ch;
        })
        .join('');
      setDisplay(result);
      frameRef.current = requestAnimationFrame(corrupt);
    };

    frameRef.current = requestAnimationFrame(corrupt);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [glitchText]);

  return {
    text: display,
    isActive: glitchText !== null,
  };
};
