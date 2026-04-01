import { useUiStore } from '@/core/useUiStore';

/**
 * Returns CSS filter string for the blur overlay effect.
 * When active, applies a strong blur + desaturation for the hallucination phase.
 */
export const useBlurEffect = () => {
  const blurActive = useUiStore((s) => s.blurActive);

  return {
    filter: blurActive ? 'blur(4px) saturate(0.3)' : 'none',
    transition: 'filter 0.8s ease-in-out',
  };
};
