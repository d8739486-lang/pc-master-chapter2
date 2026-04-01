import { useUiStore } from '@/core/useUiStore';

/**
 * Returns framer-motion animation props for screen shake.
 * Reads shake state from uiStore — never triggers shake directly.
 */
export const useScreenShake = () => {
  const { shake, shakeIntensity } = useUiStore();

  const intensityMap = {
    small: {
      x: [0, -3, 3, -2, 2, 0],
      y: [0, 2, -2, 1, -1, 0],
      duration: 0.25,
    },
    medium: {
      x: [0, -6, 6, -4, 4, -2, 2, 0],
      y: [0, 3, -3, 2, -2, 1, -1, 0],
      duration: 0.4,
    },
    large: {
      x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0],
      y: [0, 5, -5, 4, -4, 3, -3, 2, -2, 0],
      duration: 0.7,
    },
  };

  const config = intensityMap[shakeIntensity];

  return {
    animate: shake ? { x: config.x, y: config.y } : {},
    transition: { duration: config.duration, ease: 'easeOut' as const },
  };
};
