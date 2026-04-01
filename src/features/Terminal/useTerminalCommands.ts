import { useCallback } from 'react';
import { useGameStore, Screen } from '@/core/store';
import { useUiStore } from '@/core/useUiStore';
import { useChatStore } from '@/core/useChatStore';
import { audioManager } from '@/core/audio';
import { startAvalonPart1, startAvalonPart2, subscribeToChatOpen } from '@/core/sequences/avalonSequence';
import { TimelineEngine } from '@/core/TimelineEngine';
import { useTerminalGameStore, TerminalStep } from './useTerminalGameStore';
import { useI18n } from '@/core/i18n';

export const useTerminalCommands = (
  engineRef: React.MutableRefObject<TimelineEngine | null>,
  chatSubRef: React.MutableRefObject<(() => void) | null>,
  setEscapeTimer: (timer: number | null) => void
) => {
  const { addTerminalLine, clearTerminal } = useGameStore();
  const { step, setStep, setHackedSectors, hackedSectors, setIsTyping, setLoading } = useTerminalGameStore();
  const { t } = useI18n();

  const handleAsyncAction = (delay: number, action: () => void) => {
    const { setIsTyping } = useTerminalGameStore.getState();
    setIsTyping(true);
    addTerminalLine({ type: 'output', content: '........' });
    setTimeout(() => {
      useTerminalGameStore.getState().setIsTyping(false);
      action();
    }, delay);
  };

  const simulateLoading = (
    targetStep: TerminalStep, 
    successMsg: string, 
    nextInstruction: string, 
    label: string, 
    sectorsToAdd = 0
  ) => {
    let dlProgress = 0;
    const { setLoading } = useTerminalGameStore.getState();
    setLoading(dlProgress, label);
    
    // Standard loading: 1.0s interval per 10%
    const dlInterval = setInterval(() => {
      dlProgress += 10;
      useTerminalGameStore.getState().setLoading(dlProgress, label);
      audioManager.cmdL(); 
      
      if (dlProgress >= 100) {
        clearInterval(dlInterval);
        setTimeout(() => {
          const { setStep, setHackedSectors, hackedSectors } = useTerminalGameStore.getState();
          clearTerminal();
          useTerminalGameStore.getState().setLoading(null);
          setStep(targetStep);
          
          const currentSectors = hackedSectors + sectorsToAdd;
          if (sectorsToAdd > 0) {
            setHackedSectors(currentSectors);
            
            // Story progression chat
            const chatStore = useChatStore.getState();
            const storyMessages = [
              t('chat.msg1'),
              t('chat.msg2'),
              t('chat.msg3'),
              t('chat.msg4'),
              t('chat.msg5')
            ];
            
            if (currentSectors >= 1 && currentSectors <= storyMessages.length) {
              chatStore.addMessage({
                author: t('chat.friend_name'),
                text: storyMessages[currentSectors - 1],
                type: 'normal'
              });
              chatStore.incrementUnread();
              audioManager.message();
            }
          }

          addTerminalLine({ type: 'success', content: successMsg });
          if (sectorsToAdd > 0) {
            addTerminalLine({ type: 'output', content: t('commands.sectors_count', { count: 5 - currentSectors }) });
          }
          addTerminalLine({ type: 'system', content: nextInstruction });
        }, 1000); // 1.0s delay for rhythmic feel
      }
    }, 1000);
  };

  const executeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Common commands
    if (trimmed === 'clear') {
       clearTerminal();
       return;
    }
    
    if (trimmed === 'status') {
       addTerminalLine({ type: 'input', content: `~ $ ${cmd}` });
       addTerminalLine({
         type: 'output',
         content: `System: NEON_ROOT_OS | Connection: STABLE | Latency: ${Math.floor(8 + Math.random() * 20)}ms`,
       });
       return;
    }

    const { step } = useTerminalGameStore.getState();

    // Checking correct sequence
    const isCorrect = (
      (step === TerminalStep.BOOT && trimmed === 'connect list') ||
      (step === TerminalStep.CONNECT_LIST && trimmed === 'connect lumina') ||
      (step === TerminalStep.CONNECT_LUMINA && trimmed === 'inject lum_route.bat') ||
      (step === TerminalStep.HACK_LUMINA && trimmed === 'connect kaelen') ||
      (step === TerminalStep.CONNECT_KAELEN && trimmed === 'decrypt --kaelen-key') ||
      (step === TerminalStep.HACK_KAELEN && trimmed === 'connect vortex') ||
      (step === TerminalStep.CONNECT_VORTEX && trimmed === 'disable_vortex_ids') ||
      (step === TerminalStep.HACK_VORTEX && trimmed === 'connect cipher') ||
      (step === TerminalStep.CONNECT_CIPHER && trimmed === 'cipher_bypass -f') ||
      (step === TerminalStep.HACK_CIPHER && trimmed === 'connect aura') ||
      (step === TerminalStep.CONNECT_AURA && trimmed === 'aura_gate --open') ||
      (step === TerminalStep.READY_AVALON && trimmed === 'start_operation') ||
      (step === TerminalStep.AVALON_PART_1 && trimmed === 'continue') ||
      (step === TerminalStep.AVALON_PART_2 && trimmed === 'leave_host')
    );

    if (!isCorrect) {
      // @ts-ignore
      audioManager.thunder?.(false); 
      return;
    }

    addTerminalLine({ type: 'input', content: `~ $ ${cmd}` });
    audioManager.click();

    handleAsyncAction(600, () => {
      clearTerminal();
      const currentStep = useTerminalGameStore.getState().step;

      switch (currentStep) {
        case TerminalStep.BOOT:
          setStep(TerminalStep.CONNECT_LIST);
          addTerminalLine({ type: 'system', content: t('commands.search_channels') });
          addTerminalLine({ type: 'output', content: t('commands.contacts_found') });
          addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 1, name: 'Lumina', type: t('commands.types.routing'), cmd: '[connect lumina]' }) });
          addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 2, name: 'Kaelen', type: t('commands.types.keys'), cmd: t('commands.req_hack', { n: 1 }) }) });
          addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 3, name: 'Vortex', type: t('commands.types.intrusion'), cmd: t('commands.unavailable') }) });
          addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 4, name: 'Cipher', type: t('commands.types.neural'), cmd: t('commands.unavailable') }) });
          addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 5, name: 'Aura', type: t('commands.types.quantum'), cmd: t('commands.unavailable') }) });
          break;

        case TerminalStep.CONNECT_LIST:
        case TerminalStep.CONNECT_LUMINA:
          if (trimmed === 'connect lumina') {
            setStep(TerminalStep.CONNECT_LUMINA);
            addTerminalLine({ type: 'system', content: t('commands.connecting', { name: 'Lumina' }) });
            addTerminalLine({ type: 'system', content: `## - (Lumina): ${t('commands.lumina_msg1')}` });
            addTerminalLine({ type: 'system', content: `## - (Lumina): ${t('commands.lumina_msg2')}` });
            addTerminalLine({ type: 'output', content: `>> ${t('commands.lumina_utility')}` });
          } else if (trimmed === 'inject lum_route.bat') {
            simulateLoading(TerminalStep.HACK_LUMINA, t('commands.lumina_success'), t('commands.next_contact', { cmd: '[connect kaelen]' }), 'INJECTING_CORE...', 1);
          }
          break;

        case TerminalStep.HACK_LUMINA:
        case TerminalStep.CONNECT_KAELEN:
          if (trimmed === 'connect kaelen') {
            setStep(TerminalStep.CONNECT_KAELEN);
            addTerminalLine({ type: 'system', content: t('commands.kaelen_connecting') });
            addTerminalLine({ type: 'system', content: `## - (Kaelen): ${t('commands.kaelen_msg1')}` });
            addTerminalLine({ type: 'system', content: `## - (Kaelen): ${t('commands.kaelen_msg2')}` });
            addTerminalLine({ type: 'output', content: `>> ${t('commands.kaelen_utility')}` });
          } else if (trimmed === 'decrypt --kaelen-key') {
            simulateLoading(TerminalStep.HACK_KAELEN, t('commands.kaelen_success'), t('commands.next_contact', { cmd: '[connect vortex]' }), 'DECRYPTING DATA...', 1);
          }
          break;

        case TerminalStep.HACK_KAELEN:
        case TerminalStep.CONNECT_VORTEX:
          if (trimmed === 'connect vortex') {
            setStep(TerminalStep.CONNECT_VORTEX);
            addTerminalLine({ type: 'system', content: t('commands.vortex_connecting') });
            addTerminalLine({ type: 'system', content: `## - (Vortex): ${t('commands.vortex_msg1')}` });
            addTerminalLine({ type: 'system', content: `## - (Vortex): ${t('commands.vortex_msg2')}` });
            addTerminalLine({ type: 'output', content: `>> ${t('commands.vortex_utility')}` });
          } else if (trimmed === 'disable_vortex_ids') {
            simulateLoading(TerminalStep.HACK_VORTEX, t('commands.vortex_success'), t('commands.next_contact', { cmd: '[connect cipher]' }), 'DISABLING IDS...', 1);
          }
          break;

        case TerminalStep.HACK_VORTEX:
        case TerminalStep.CONNECT_CIPHER:
          if (trimmed === 'connect cipher') {
            setStep(TerminalStep.CONNECT_CIPHER);
            addTerminalLine({ type: 'system', content: t('commands.cipher_connecting') });
            addTerminalLine({ type: 'system', content: `## - (Cipher): ${t('commands.cipher_msg1')}` });
            addTerminalLine({ type: 'system', content: `## - (Cipher): ${t('commands.cipher_msg2')}` });
            addTerminalLine({ type: 'output', content: `>> ${t('commands.cipher_utility')}` });
          } else if (trimmed === 'cipher_bypass -f') {
            simulateLoading(TerminalStep.HACK_CIPHER, t('commands.cipher_success'), t('commands.next_contact', { cmd: '[connect aura]' }), 'BYPASSING NEURAL NET...', 1);
          }
          break;

        case TerminalStep.HACK_CIPHER:
        case TerminalStep.CONNECT_AURA:
          if (trimmed === 'connect aura') {
            setStep(TerminalStep.CONNECT_AURA);
            addTerminalLine({ type: 'system', content: t('commands.aura_connecting') });
            addTerminalLine({ type: 'system', content: `## - (Aura): ${t('commands.aura_msg1')}` });
            addTerminalLine({ type: 'system', content: `## - (Aura): ${t('commands.aura_msg2')}` });
            addTerminalLine({ type: 'output', content: `>> ${t('commands.aura_utility')}` });
          } else if (trimmed === 'aura_gate --open') {
            simulateLoading(TerminalStep.READY_AVALON, t('commands.aura_success'), t('commands.all_paths_free'), 'OPENING GATES...', 1);
          }
          break;

        // Final sequences
        case TerminalStep.HACK_AURA:
        case TerminalStep.READY_AVALON:
          if (trimmed === 'start_operation') {
            setStep(TerminalStep.AVALON_PART_1);
            if (engineRef.current) return;
            const engine = new TimelineEngine();
            engineRef.current = engine;
            const events = startAvalonPart1(
              (p) => setLoading(p, 'AVALON START THREAD...'),
              (c) => addTerminalLine({ type: 'input', content: `~ $ ${c}` }), // fake auto type since buttons replace typing
              () => { engineRef.current = null; }
            );
            engine.queue(events);
            chatSubRef.current = subscribeToChatOpen(() => {});
          }
          break;

        case TerminalStep.AVALON_PART_1:
          if (trimmed === 'continue') {
            if (engineRef.current || useUiStore.getState().ddPopupOpen) {
              addTerminalLine({ type: 'error', content: t('commands.error_close_all') });
              return;
            }
            const engine = new TimelineEngine();
            engineRef.current = engine;
            const events = startAvalonPart2(
              (p) => setLoading(p, 'ESCALATING PRIVILEGES...'),
              () => {
                engineRef.current = null;
                setStep(TerminalStep.AVALON_PART_2);
                setEscapeTimer(15);
              }
            );
            engine.queue(events);
          }
          break;

        case TerminalStep.AVALON_PART_2:
          if (trimmed === 'leave_host') {
            setEscapeTimer(null);
            audioManager.dangerStop(500);
            useGameStore.getState().setScreen(Screen.POST_HACK_SEQUENCE);
          }
          break;
      }
    });
  }, [step, hackedSectors, setStep, setHackedSectors, addTerminalLine, clearTerminal, handleAsyncAction, simulateLoading, engineRef, chatSubRef, setEscapeTimer, setLoading, t]);

  return { executeCommand };
};
