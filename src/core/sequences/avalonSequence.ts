import { type ITimelineEvent } from '@/core/TimelineEngine';
import { useGameStore } from '@/core/store';
import { useUiStore } from '@/core/useUiStore';
import { useChatStore } from '@/core/useChatStore';
import { audioManager } from '@/core/audio';
import { getTranslation as t } from '@/core/i18n';
import { useTerminalGameStore } from '@/features/Terminal/useTerminalGameStore';

/**
 * Avalon Penetration Sequence — 6-phase deterministic timeline.
 *
 * Triggered by terminal command: `return /p avalon`
 *
 * Phase 1 (0s):    Start loading 0→100% over 30s
 * Phase 2 (3s):    DD threat message in chat
 * Phase 3 (manual): Player opens friend chat → shake + delete DD msg + friend reply
 * Phase 4 (15s):   50% hallucination — red flash, blur, glitch, danger.mp3
 * Phase 5 (18s):   Resume loading with glitches
 * Phase 6 (30s):   Final Loading Sequence (95% slowdown, 99% hang, takeover, truck scene)
 */

/** Progress update callback type */
type ProgressCallback = (percent: number) => void;

/**
 * Creates the Avalon timeline events array.
 *
 * @param onProgress - callback to update the terminal loading bar
 * @param onAutoType - callback to type a command automatically into terminal
 * @param onComplete - callback when the full sequence ends
 */
export const startAvalonPart1 = (
  onProgress: ProgressCallback,
  onAutoType: (cmd: string) => void,
  onPause: () => void,
): ITimelineEvent[] => {
  const addTerminalLine = useGameStore.getState().addTerminalLine;

  const events: ITimelineEvent[] = [];

  events.push({
    id: 'p1_init',
    delay: 0,
    action: () => {
      addTerminalLine({ type: 'system', content: t('avalon.p1_init') });
      addTerminalLine({ type: 'output', content: t('avalon.p1_conn') });
    },
  });

  // Loading up to 50%
  for (let i = 1; i <= 50; i++) {
    const delay = (i / 50) * 8000; // 8 seconds to 50%
    const jitter = Math.random() * 200;
    events.push({
      id: `p1_progress_${i}`,
      delay: delay + jitter,
      action: () => onProgress(i),
    });
  }

  // At 50% -> DD Warning Pop-Up & Pause
  events.push({
    id: 'p1_pause_dd',
    delay: 8500,
    action: () => {
      addTerminalLine({ type: 'error', content: t('avalon.p1_warn1') });
      addTerminalLine({ type: 'error', content: t('avalon.p1_warn2') });
      
      const { setDdPopupOpen, triggerRedFlash, setDdPopupExploding, triggerShake, setBlur } = useUiStore.getState();
      const { addMessage, incrementUnread } = useChatStore.getState();
      
      triggerRedFlash(1000);
      setDdPopupOpen(true);
      
      addMessage({
        author: t('chat.friend_name'),
        text: t('avalon.f_msg1'),
        type: 'normal'
      });
      incrementUnread();
      audioManager.message();

      // Explode the popup automatically after 2 seconds
      setTimeout(() => {
        setDdPopupExploding(true);
        triggerShake('large', 500);
        audioManager.delete(); 
        setBlur(false); // REMOVE BLUR IMMEDIATELY AS REQUESTED
        
        const chatStore = useChatStore.getState();
        chatStore.resetAll(); // WIPE HISTORY as requested
        chatStore.setActiveChat('friend');
        
        chatStore.addMessage({
          author: t('chat.friend_name'),
          text: t('avalon.f_msg2'),
          type: 'normal',
        });
        chatStore.addMessage({
          author: t('chat.friend_name'),
          text: t('avalon.f_msg3'),
          type: 'normal',
        });
        audioManager.message();
        chatStore.incrementUnread();
        chatStore.incrementUnread();
        
        addTerminalLine({ type: 'system', content: t('avalon.p1_resume') });
        addTerminalLine({ type: 'output', content: t('avalon.p1_ready') });
        
        onPause(); // Allow terminal commands to resume sequence
        
        setTimeout(() => {
          setDdPopupOpen(false);
          setDdPopupExploding(false);
        }, 1500); // 1.5s for explosion animation to finish
      }, 2000); // Wait 2s before exploding
    }
  });

  return events;
};

export const startAvalonPart2 = (
  onProgress: ProgressCallback,
  onComplete: () => void,
): ITimelineEvent[] => {
  const addTerminalLine = useGameStore.getState().addTerminalLine;
  const events: ITimelineEvent[] = [];

  events.push({
    id: 'p2_resume',
    delay: 0,
    action: () => {
      addTerminalLine({ type: 'success', content: t('avalon.p2_resume') });
    }
  });

  // 50% -> 75%
  for (let i = 51; i <= 75; i++) {
    const delay = ((i - 50) / 50) * 10000; // up to 5 seconds
    const jitter = Math.random() * 100;
    events.push({
      id: `p2_progress_${i}`,
      delay: delay + jitter,
      action: () => onProgress(i),
    });
  }

  // At 75%, pause and trigger PULSE task
  events.push({
    id: 'p2_pause_pulse',
    delay: 5200,
    action: () => {
      const { setActiveTask, setLoading: setTermLoading } = useTerminalGameStore.getState();
      
      const resumeLoading = () => {
        let dlProgress = 75;
        const resumeInterval = setInterval(() => {
          dlProgress += 5;
          setTermLoading(dlProgress, 'ESCALATING PRIVILEGES...');
          audioManager.cmdL(); 
          
          if (dlProgress >= 100) {
            clearInterval(resumeInterval);
            setTimeout(() => {
              // 100% -> Archives copied! Escaping phase
              addTerminalLine({ type: 'system', content: t('avalon.p2_run') });
              
              const chat = useChatStore.getState();
              chat.addMessage({
                author: t('chat.friend_name'),
                text: t('avalon.f_msg4'),
                type: 'normal'
              });
              chat.incrementUnread();
              audioManager.message();
              audioManager.dangerStart(2000); // 15s danger sounds - Fades in
              
              onComplete(); // Tells the terminal to start the 15s countdown
            }, 1000);
          }
        }, 600);
      };

      setActiveTask('PULSE', resumeLoading);
    }
  });

  return events;
};

/**
 * Sets up a Zustand subscription that fires Phase 3 events
 * when the player manually opens the friend chat tab.
 *
 * Returns an unsubscribe function.
 */
export const subscribeToChatOpen = (
  onFriendHelpsPopUp: () => void,
): (() => void) => {
  // Manual chat subscription logic removed in favor of automatic explosion.
  // Returning empty stub to preserve hook signature inside Terminal.tsx
  return () => {};
};
