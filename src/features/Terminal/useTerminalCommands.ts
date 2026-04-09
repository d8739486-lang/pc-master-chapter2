import { TerminalStep, useTerminalGameStore } from './useTerminalGameStore';
import { useChatStore, useGameStore, ITerminalLine, Screen } from '@/core/store';
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

    const finalLines = [successMsg];
    if (sectorsToAdd > 0) {
      finalLines.push(t('commands.sectors_count', { count: 5 - currentSectors }));
    }
    finalLines.push(nextInstruction);

    addTerminalLine({ type: 'success', content: finalLines.join('\n') });
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
      const helpText = `${t('commands.help_title')}\n- help: ${t('commands.help_desc')}\n- clear: ${t('commands.clear_desc')}\n- status: ${t('commands.status_desc')}`;
      addTerminalLine({ type: 'output', content: helpText });
      return;
    }

    if (trimmed === 'status') {
      const statusText = `[SYSTEM STATUS]: ${t('commands.status_ok')}\n[DATA SECTORS]: ${hackedSectors}/5\n[BYPASS_ENGINE]: ${t('commands.status_active')}`;
      addTerminalLine({ type: 'output', content: statusText });
      return;
    }

    // Step-based logic
    switch (step) {
      case TerminalStep.BOOT:
        if (trimmed === 'connect list') {
          addTerminalLine({ type: 'system', content: t('commands.search_channels') });
          setTimeout(() => {
            const listText = [
              t('commands.contacts_found'),
              t('commands.contact_line', { n: 1, name: 'Lumina', type: t('commands.types.routing'), cmd: '[connect lumina]' }),
              t('commands.contact_line', { n: 2, name: 'Kaelen', type: t('commands.types.keys'), cmd: `[${t('commands.req_hack', { n: 1 })}]` }),
              t('commands.contact_line', { n: 3, name: 'Vortex', type: t('commands.types.intrusion'), cmd: `[${t('commands.req_hack', { n: 2 })}]` }),
              t('commands.contact_line', { n: 4, name: 'Cipher', type: t('commands.types.neural'), cmd: `[${t('commands.req_hack', { n: 3 })}]` }),
              t('commands.contact_line', { n: 5, name: 'Aura', type: t('commands.types.quantum'), cmd: `[${t('commands.req_hack', { n: 4 })}]` })
            ].join('\n');
            addTerminalLine({ type: 'output', content: listText });
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
            const luminaIntro = [
                `## - (Lumina): ${t('commands.lumina_msg1')}`,
                `## - (Lumina): ${t('commands.lumina_msg2')}`,
                `>> ${t('commands.lumina_utility')}`
            ].join('\n');
            addTerminalLine({ type: 'output', content: luminaIntro });
            useTerminalGameStore.getState().setStep(TerminalStep.LUMINA);
          }, 800);
        } else if (trimmed === 'connect kaelen' || trimmed === 'connect vortex' || trimmed === 'connect cipher' || trimmed === 'connect aura') {
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
          if (!engineRef.current) engineRef.current = new TimelineEngine();
          
          addTerminalLine({ type: 'system', content: t('avalon.p1_init') });
          useTerminalGameStore.getState().setStep(TerminalStep.AVALON_SEQUENCE);

          engineRef.current.queue([
            { id: 'av1', delay: 1000, action: () => addTerminalLine({ type: 'system', content: t('avalon.p1_conn') }) },
            { id: 'av2', delay: 2500, action: () => {
              addTerminalLine({ type: 'error', content: t('avalon.p1_warn1') });
              audioManager.dangerStart();
            }},
            { id: 'av3', delay: 4000, action: () => addTerminalLine({ type: 'error', content: t('avalon.p1_warn2') }) },
            { id: 'av_chat1', delay: 5500, action: () => {
              useChatStore.getState().addMessage({ author: t('story.friend'), text: t('avalon.f_msg1'), type: 'normal' });
              audioManager.message();
            }},
            { id: 'av_chat2', delay: 8500, action: () => {
              useChatStore.getState().addMessage({ author: t('story.friend'), text: t('avalon.f_msg2'), type: 'normal' });
              audioManager.message();
              clearTerminal(); // Simulate "window wiped history"
            }},
            { id: 'av_chat3', delay: 11500, action: () => {
              useChatStore.getState().addMessage({ author: t('story.friend'), text: t('avalon.f_msg3'), type: 'normal' });
              audioManager.message();
            }},
            { id: 'av4', delay: 13500, action: () => addTerminalLine({ type: 'system', content: t('avalon.p1_resume') }) },
            { id: 'av5', delay: 15000, action: () => addTerminalLine({ type: 'success', content: t('avalon.p1_ready') }) },
          ]);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.AVALON_SEQUENCE:
        if (trimmed === 'continue') {
          if (!engineRef.current) engineRef.current = new TimelineEngine();
          useTerminalGameStore.getState().setStep(TerminalStep.AVALON_PART_1);
          
          addTerminalLine({ type: 'system', content: t('avalon.p2_resume') });
          
          engineRef.current.queue([
            { id: 'av6', delay: 1500, action: () => addTerminalLine({ type: 'success', content: t('avalon.p2_archive') }) },
            { id: 'av7', delay: 3000, action: () => {
              addTerminalLine({ type: 'error', content: t('avalon.p2_time') });
              setEscapeTimer(15);
            }},
            { id: 'av_chat4', delay: 4500, action: () => {
              useChatStore.getState().addMessage({ author: t('story.friend'), text: t('avalon.f_msg4'), type: 'normal' });
              audioManager.message();
            }},
            { id: 'av8', delay: 6000, action: () => addTerminalLine({ type: 'system', content: t('avalon.p2_run') }) },
          ]);
        } else {
          addTerminalLine({ type: 'error', content: t('terminal.error_unknown', { cmd: trimmed }) });
        }
        break;

      case TerminalStep.AVALON_PART_1:
        if (trimmed === 'leave_host') {
          audioManager.stopAllLoops();
          audioManager.dangerStop();
          useGameStore.getState().setScreen(Screen.POST_HACK_SEQUENCE);
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
