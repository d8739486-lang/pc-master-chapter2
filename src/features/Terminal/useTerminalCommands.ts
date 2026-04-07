import { TerminalStep, useTerminalGameStore } from './useTerminalGameStore';
import { useChatStore, useGameStore, ITerminalLine } from '@/core/store';
import { useI18n } from '@/core/i18n';
import { TimelineEngine } from '@/core/TimelineEngine';
import React from 'react';
import { audioManager } from '@/core/audio';

/**
 * Hook for handling terminal commands logic
 * Manages game progression, mini-tasks, and story events
 */
export const useTerminalCommands = (
  engineRef: React.MutableRefObject<TimelineEngine | null>,
  chatSubRef: React.MutableRefObject<(() => void) | null>,
  setEscapeTimer: (v: number | null) => void
) => {
  const { t } = useI18n();

  const addTerminalLine = (line: ITerminalLine) => {
    useGameStore.getState().addTerminalLine(line);
  };

  const clearTerminal = () => {
    useGameStore.getState().clearTerminal();
  };

  const getTaskForLabel = (label: string): 'WIRES' | 'LEVERS' | 'SORT' | 'GRID' | 'SIGNAL' | 'PULSE' => {
    const l = label.toUpperCase();
    if (l.includes('INJECT')) return 'WIRES';
    if (l.includes('DECRYPT')) return 'SORT';
    if (l.includes('DISABL')) return 'LEVERS';
    if (l.includes('BYPASS')) return 'GRID';
    if (l.includes('SNIFFING_DATA_PACKETS')) return 'SIGNAL';
    return 'PULSE'; 
  };

  /** Helper to finish loading sequence and advance story */
  const finishLoading = (targetStep: TerminalStep, successMsg: string, nextInstruction: string, sectorsToAdd: number) => {
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
  };

  const simulateLoading = (
    targetStep: TerminalStep, 
    successMsg: string, 
    nextInstruction: string, 
    label: string, 
    sectorsToAdd = 0,
    hasTask = true
  ) => {
    let dlProgress = 0;
    const { setLoading } = useTerminalGameStore.getState();
    setLoading(dlProgress, label);
    
    const resumeLoading = () => {
      const resumeInterval = setInterval(() => {
        dlProgress += 10;
        useTerminalGameStore.getState().setLoading(dlProgress, label);
        audioManager.cmdL(); 
        if (dlProgress >= 100) {
          clearInterval(resumeInterval);
          setTimeout(() => finishLoading(targetStep, successMsg, nextInstruction, sectorsToAdd), 1000);
        }
      }, 800);
    };

    const dlInterval = setInterval(() => {
      dlProgress += 10;
      useTerminalGameStore.getState().setLoading(dlProgress, label);
      audioManager.cmdL(); 
      if (dlProgress >= (hasTask ? 50 : 100)) {
        clearInterval(dlInterval);
        if (hasTask) {
          const taskType = getTaskForLabel(label);
          useTerminalGameStore.getState().setActiveTask(taskType, resumeLoading);
        } else {
          setTimeout(() => finishLoading(targetStep, successMsg, nextInstruction, sectorsToAdd), 1000);
        }
      }
    }, 1000);
  };

  const executeCommand = (cmd: string) => {
    const { step, hackedSectors } = useTerminalGameStore.getState();
    const trimmed = cmd.trim().toLowerCase();

    if (!trimmed) return;
    addTerminalLine({ type: 'input', content: cmd });

    // Global commands
    if (trimmed === 'clear') {
      clearTerminal();
      return;
    }

    if (trimmed === 'help') {
      addTerminalLine({ type: 'system', content: t('commands.help_title') });
      addTerminalLine({ type: 'output', content: `- help: ${t('commands.help_desc')}` });
      addTerminalLine({ type: 'output', content: `- clear: ${t('commands.clear_desc')}` });
      addTerminalLine({ type: 'output', content: `- status: ${t('commands.status_desc')}` });
      return;
    }

    if (trimmed === 'status') {
      addTerminalLine({ type: 'output', content: `[SYSTEM STATUS]: ${t('commands.status_ok')}` });
      addTerminalLine({ type: 'output', content: `[DATA SECTORS]: ${hackedSectors}/5` });
      addTerminalLine({ type: 'output', content: `[BYPASS_ENGINE]: ${t('commands.status_active')}` });
      return;
    }

    // Step-based logic
    switch (step) {
      case TerminalStep.BOOT:
        if (trimmed === 'connect list') {
          addTerminalLine({ type: 'system', content: t('commands.search_channels') });
          setTimeout(() => {
            addTerminalLine({ type: 'success', content: t('commands.contacts_found') });
            addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 1, name: 'Lumina', type: t('commands.types.routing'), cmd: '[connect lumina]' }) });
            addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 2, name: 'Kaelen', type: t('commands.types.keys'), cmd: `[${t('commands.req_hack', { n: 1 })}]` }) });
            addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 3, name: 'Vortex', type: t('commands.types.intrusion'), cmd: `[${t('commands.req_hack', { n: 2 })}]` }) });
            addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 4, name: 'Cipher', type: t('commands.types.neural'), cmd: `[${t('commands.req_hack', { n: 3 })}]` }) });
            addTerminalLine({ type: 'output', content: t('commands.contact_line', { n: 5, name: 'Aura', type: t('commands.types.quantum'), cmd: `[${t('commands.req_hack', { n: 4 })}]` }) });
            useTerminalGameStore.getState().setStep(TerminalStep.CONNECT_LIST);
          }, 1000);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.CONNECT_LIST:
        if (trimmed === 'connect lumina') {
          addTerminalLine({ type: 'system', content: t('commands.connecting', { name: 'Lumina' }) });
          setTimeout(() => {
            addTerminalLine({ type: 'output', content: `## - (Lumina): ${t('commands.lumina_msg1')}` });
            addTerminalLine({ type: 'output', content: `## - (Lumina): ${t('commands.lumina_msg2')}` });
            addTerminalLine({ type: 'output', content: `>> ${t('commands.lumina_utility')}` });
            useTerminalGameStore.getState().setStep(TerminalStep.LUMINA);
          }, 800);
        } else if (trimmed === 'connect kaelen' || trimmed === 'connect vortex' || trimmed === 'connect cipher' || trimmed === 'connect aura') {
            const targetId = trimmed.split(' ')[1];
            addTerminalLine({ type: 'error', content: t('commands.unavailable') });
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.LUMINA:
        if (trimmed === 'inject lum_route.bat') {
          simulateLoading(TerminalStep.KAELEN, t('commands.lumina_success'), t('commands.kaelen_utility'), 'INJECTING LUM_ROUTE.BAT...', 1);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.KAELEN:
        if (trimmed === 'decrypt --kaelen-key') {
          simulateLoading(TerminalStep.VORTEX, t('commands.kaelen_success'), t('commands.vortex_utility'), 'DECRYPTING KAELEN_DATABASE...', 1);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.VORTEX:
        if (trimmed === 'disable_vortex_ids') {
          simulateLoading(TerminalStep.CIPHER, t('commands.vortex_success'), t('commands.cipher_utility'), 'DISABLING VORTEX PORT PROTECTION...', 1);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.CIPHER:
        if (trimmed === 'cipher_bypass -f') {
          simulateLoading(TerminalStep.AURA, t('commands.cipher_success'), t('commands.aura_utility'), 'BYPASSING CIPHER LAYER...', 1);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.AURA:
          if (trimmed === 'aura_gate --open') {
            simulateLoading(TerminalStep.READY_AVALON, t('commands.aura_success'), t('commands.all_paths_free'), 'OPENING GATES...', 1, false);
          } else {
            addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
          }
          break;

      case TerminalStep.READY_AVALON:
        if (trimmed === 'start_operation') {
          addTerminalLine({ type: 'system', content: 'INITIALIZING AVALON CORE PENETRATION...' });
          useTerminalGameStore.getState().setStep(TerminalStep.AVALON_SEQUENCE);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      default:
        addTerminalLine({ type: 'error', content: t('commands.err_locked') });
    }
  };

  return { executeCommand };
};
