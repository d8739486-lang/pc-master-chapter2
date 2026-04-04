import { audioManager } from './audio';

// Import essential images to prevent mid-game texture loading
// @ts-ignore
import friendPic from '@/textures/sprites/friend_pic.png';
// @ts-ignore
import mainChPic from '@/textures/sprites/main_ch_pic.png';

const imagesToPreload = [friendPic, mainChPic];

export const AssetManager = {
  /**
   * Initializes the AudioContext, fetches and decodes all MP3s into RAM Buffers,
   * and preloads core image textures.
   */
  loadAll: async (onProgress: (percent: number) => void) => {
    let audioProgress = 0;
    let loadedImages = 0;

    const updateTotalProgress = () => {
      // Audio decoding is visually represented as 85% of the total loading bar
      const audioWeight = 85; 
      const imageWeight = 15;
      const total = (audioProgress * (audioWeight / 100)) + 
                    ((loadedImages / imagesToPreload.length) * imageWeight);
      onProgress(total);
    };

    const imagePromises = imagesToPreload.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedImages++;
          updateTotalProgress();
          resolve();
        };
        img.onerror = () => {
          loadedImages++; 
          updateTotalProgress();
          resolve(); 
        };
        img.src = src;
      });
    });

    try {
      const promises = [
        audioManager.initialize((p) => {
          audioProgress = p;
          updateTotalProgress();
        }),
        ...imagePromises
      ];

      await Promise.all(promises);
    } catch (e) {
      console.error("Asset Manager Load Error", e);
    }
  }
};
