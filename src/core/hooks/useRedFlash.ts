import { useUiStore } from '@/core/useUiStore';

/**
 * Returns opacity and visibility for the red flash overlay.
 * Controlled by uiStore.redFlash — auto-resets via triggerRedFlash().
 */
export const useRedFlash = () => {
  const redFlash = useUiStore((s) => s.redFlash);

  return {
    opacity: redFlash ? 0.6 : 0,
    pointerEvents: 'none' as const,
    transition: 'opacity 0.15s ease-out',
  };
};
