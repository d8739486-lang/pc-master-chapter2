import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useChatStore } from '@/core/useChatStore';
import { MatrixRain } from '@/components/MatrixRain';
import { useI18n, translations } from '@/core/i18n';
import { SkipButton } from '@/components/SkipButton';

import { audioManager } from '@/core/audio';

// Cutscene SFX
// @ts-ignore
import chaosSfx from '@/textures/sfx/menu cutscene/chaos.mp3';
// @ts-ignore
import fadeSfx from '@/textures/sfx/menu cutscene/fade.mp3';
// @ts-ignore
import messageSfx from '@/textures/sfx/menu cutscene/message.mp3';
// @ts-ignore
import textSfx from '@/textures/sfx/menu cutscene/text.mp3';
// @ts-ignore
import typingSfx from '@/textures/sfx/menu cutscene/typing.mp3';

// Avatars
// @ts-ignore
import friendPic from '@/textures/sprites/friend_pic.png';
// @ts-ignore
import mainChPic from '@/textures/sprites/main_ch_pic.png';

interface ChatMessage {
  id: number;
  author: string;
  avatar: string;
  text: string;
  isThreat?: boolean;
}

export const StoryIntro = () => {
  const { setScreen } = useGameStore();
  const { t, language } = useI18n();
  const [phase, setPhase] = useState<number>(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sysErrors, setSysErrors] = useState<{id: number, x: number, y: number}[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const startedPhase2Ref = useRef(false);
  const startedPhase3Ref = useRef(false);
  const startedPhase5Ref = useRef(false);
  const startedPhase6Ref = useRef(false);

  const STORY_TEXT_1 = t('story.text1');
  const STORY_TEXT_2 = t('story.text2');

  const CHAT_SCRIPT_1 = useMemo(() => {
    // Guaranteed direct access to the array to avoid pathing issues
    const scriptLines = translations[language].story.script1;
    
    return [
      { author: "Dev_Oleg", avatar: "(-_-)", text: scriptLines[0], typingTime: 1200, waitBefore: 1000 },
      { author: "QA_Anna", avatar: "(╥﹏╥)", text: scriptLines[1], typingTime: 1500, waitBefore: 800 },
      { author: "SysAdmin_Max", avatar: "(O_O)", text: scriptLines[2], typingTime: 1800, waitBefore: 1200 },
      { author: "Sec_Bot_v2", avatar: "[!]", text: scriptLines[3], typingTime: 1000, waitBefore: 1500 },
      { author: "SysAdmin_Max", avatar: "(O_O)", text: scriptLines[4], typingTime: 1000, waitBefore: 600 },
      { author: "Dev_Oleg", avatar: "(-_-)", text: scriptLines[5], typingTime: 1200, waitBefore: 800 },
      { author: "QA_Anna", avatar: "(╥﹏╥)", text: scriptLines[6], typingTime: 1400, waitBefore: 1000 },
      { author: "Sec_Bot_v2", avatar: "[!]", text: scriptLines[7], typingTime: 1500, waitBefore: 1200 },
      { author: "SysAdmin_Max", avatar: "(O_O)", text: scriptLines[8], typingTime: 1000, waitBefore: 800 },
      { author: "Sec_Bot_v2", avatar: "[!]", text: scriptLines[9], typingTime: 2500, waitBefore: 1000 },
    ];
  }, [language]); // Depend on language specifically for stable refresh

  const CHAT_SCRIPT_2 = useMemo(() => [
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.0'), typingTime: 2500, waitBefore: 1500 },
    { author: t('story.friend'), avatar: friendPic, text: t('story.script2.1'), typingTime: 1800, waitBefore: 1200 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.2'), typingTime: 3000, waitBefore: 1200 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.3'), typingTime: 3200, waitBefore: 1000 },
    { author: t('story.friend'), avatar: friendPic, text: t('story.script2.4'), typingTime: 2000, waitBefore: 1500 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.5'), typingTime: 2500, waitBefore: 1000 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.6'), typingTime: 2500, waitBefore: 800 },
    { author: t('story.friend'), avatar: friendPic, text: t('story.script2.7'), typingTime: 1500, waitBefore: 1200 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.8'), typingTime: 3500, waitBefore: 1200 },
    { author: t('story.friend'), avatar: friendPic, text: t('story.script2.9'), typingTime: 3200, waitBefore: 1500 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.10'), typingTime: 2800, waitBefore: 1000 },
    { author: t('story.friend'), avatar: friendPic, text: t('story.script2.11'), typingTime: 2000, waitBefore: 1500 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.12'), typingTime: 1800, waitBefore: 1800 },
    { author: t('story.friend'), avatar: friendPic, text: t('story.script2.13'), typingTime: 3000, waitBefore: 1500 },
    { author: t('story.me'), avatar: mainChPic, text: t('story.script2.14'), typingTime: 1500, waitBefore: 1000 },
  ], [t]);

  const [climaxIntensity, setClimaxIntensity] = useState(0);
  const spamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typingIndicator]);

  useEffect(() => {
    // message.mp3 plays only for normal chat lines (Phases 2 and 6)
    // and STOPS playing when chaos (Phase 3) starts
    if (chatMessages.length > prevMsgCountRef.current && (phase === 2 || phase === 6)) {
      audioManager.playSfx(messageSfx, 0.3);
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages.length, phase]);

  useEffect(() => {
    if (phase === 1) {
      audioManager.playSfx(textSfx, 0.5);
      const timer = setTimeout(() => { setPhase(2); }, 3500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 2 && !startedPhase2Ref.current) {
      startedPhase2Ref.current = true;
      let isCancelled = false;

      const runChatSequence = async () => {
        // Use CHAT_SCRIPT_1 from useMemo
        for (let i = 0; i < CHAT_SCRIPT_1.length; i++) {
          if (isCancelled) return;
          const line = CHAT_SCRIPT_1[i];

          await new Promise(r => setTimeout(r, line.waitBefore));
          if (isCancelled) return;

          setTypingIndicator(t('story.typing', { name: line.author }));
          
          await new Promise(r => setTimeout(r, line.typingTime));
          if (isCancelled) return;

          setTypingIndicator(null);
          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now() + i,
              author: line.author,
              avatar: line.avatar,
              text: line.text,
            },
          ]);
        }

        // 2 second dramatic pause
        await new Promise(r => setTimeout(r, 2000));
        if (!isCancelled) setPhase(3);
      };

      runChatSequence();
      return () => {
        isCancelled = true;
      };
    }
  }, [phase]); // Only depend on phase to avoid cancellation on re-render

  useEffect(() => {
    if (phase === 3 && !startedPhase3Ref.current) {
      startedPhase3Ref.current = true;
      const startTime = Date.now();
      const CHAOS_DURATION = 5000;
      const FADE_TRIGGER = 3000;
      let fadePlayed = false;
      let msgId = 500;
      let currentDelay = 800;

        audioManager.playLoop(chaosSfx, 'chaos', 0.5);
        audioManager.playLoop(typingSfx, 'intro_typing', 0.4);

        const spawnError = () => {
          const elapsed = Date.now() - startTime;
          
          if (elapsed >= CHAOS_DURATION) {
            if (spamIntervalRef.current) clearTimeout(spamIntervalRef.current);
            audioManager.stopAllLoops();
            setSysErrors([]);
            setPhase(4);
            return;
          }

        const intensity = Math.min(elapsed / CHAOS_DURATION, 1);
        setClimaxIntensity(intensity);

        setSysErrors(prev => [
          ...prev,
          { id: msgId++, x: 5 + Math.random() * 75, y: 5 + Math.random() * 75 }
        ]);

        if (elapsed >= FADE_TRIGGER && !fadePlayed) {
          fadePlayed = true;
          audioManager.playSfx(fadeSfx, 0.6);
        }

        // Exact acceleration: -100ms per step
        // 1000 -> 900 -> 800... -> 100 -> (rapid)
        currentDelay = Math.max(30, currentDelay - 150);
        
        spamIntervalRef.current = setTimeout(spawnError, currentDelay) as any;
      };

      spawnError();

      return () => {
        if (spamIntervalRef.current) clearTimeout(spamIntervalRef.current);
        audioManager.stopAllLoops();
        setSysErrors([]);
      };
    }
  }, [phase]); // Dependency on phase only to prevent re-triggering sounds on message spam

  useEffect(() => {
    if (phase === 4) {
      const timer = setTimeout(() => setPhase(5), 3000);
      return () => clearTimeout(timer);
    }
    if (phase === 5 && !startedPhase5Ref.current) {
      startedPhase5Ref.current = true;
      setChatMessages([]);
      audioManager.playSfx(textSfx, 0.5);
      // Show mid-story text for 4 seconds to let user read
      const timer = setTimeout(() => setPhase(6), 4000);
      return () => clearTimeout(timer);
    }
    if (phase === 6 && !startedPhase6Ref.current) {
      startedPhase6Ref.current = true;
      let isCancelled = false;
      const runChatSequence2 = async () => {
        setChatMessages([]); // Full clear
        
        // Use a stable reference to scripts to avoid closure issues
        const script = CHAT_SCRIPT_2;
        
        for (let i = 0; i < script.length; i++) {
          if (isCancelled) return;
          const line = script[i];
          
          await new Promise(r => setTimeout(r, line.waitBefore));
          if (isCancelled) return;
          
          setTypingIndicator(line.author === t('story.me') ? t('story.sending') : t('story.typing', { name: line.author }));
          
          await new Promise(r => setTimeout(r, line.typingTime));
          if (isCancelled) return;
          
          setTypingIndicator(null);
          const newMsg = { author: line.author, text: line.text, type: 'normal' as const };
          setChatMessages(prev => [...prev, { id: Date.now() + i + 5000, ...newMsg, avatar: line.avatar }]);
          useChatStore.getState().addMessage(newMsg);
        }
        
        await new Promise(r => setTimeout(r, 4000));
        if (!isCancelled) setPhase(7);
      };
      runChatSequence2();
      return () => { isCancelled = true; };
    }
    if (phase === 7) {
      const timer = setTimeout(() => setScreen(Screen.GAME), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, setScreen]); // REMOVED t and CHAT_SCRIPT_2 - This is CRITICAL to prevent cancellation on re-render

  const renderContent = () => {
    switch (phase) {
      case 1:
        return (
          <div key="phase-1" className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="text-white/80 font-serif text-2xl md:text-3xl tracking-widest text-center w-full max-w-4xl px-8 mx-auto flex items-center justify-center flex-col">{STORY_TEXT_1}</motion.div>
          </div>
        );
      case 2:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                scale: 1,
                filter: 'blur(0px)',
                rotate: 0
              }}
              className="w-full max-w-2xl flex flex-col justify-start p-8 overflow-hidden h-[80vh] rounded-xl border border-white/5 bg-black/60 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.9)] relative"
            >
              <div className="border-b border-purple-500/20 pb-4 mb-4 flex items-center gap-4 relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(208,0,255,0.3)]">🌐</div>
                <div>
                  <h2 className="text-white font-bold tracking-widest text-sm uppercase">{t('story.dd_devops')}</h2>
                  <p className="text-purple-500/50 text-xs">{t('story.participants', { count: 4, online: 3 })}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative z-10 w-full flex-1 overflow-hidden scrollbar-hide">
                <AnimatePresence>
                  {chatMessages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 w-full shrink-0">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-purple-500/30 flex items-center justify-center text-[10px] font-mono text-cyan-400">{msg.avatar}</div>
                      <div className="flex flex-col max-w-[85%]">
                        <span className={`text-[10px] tracking-widest uppercase mb-1 text-purple-500/80`}>{msg.author}</span>
                        <div className={`p-3 rounded-2xl rounded-tl-sm text-sm bg-white/5 text-white/90 border border-white/10`}>{msg.text}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {typingIndicator && phase === 2 && <div className="text-white/40 font-mono text-sm mt-4 shrink-0 animate-pulse">{typingIndicator}</div>}
                <div ref={messagesEndRef} className="h-4 shrink-0" />
              </div>
            </motion.div>
          </div>
        );
      case 3:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
             {sysErrors.map(err => (
               <motion.div 
                 key={err.id} 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.2 }}
                 className="absolute bg-[#ece9d8] border-2 border-white shadow-[2px_2px_10px_rgba(0,0,0,0.5)] z-50 text-black flex flex-col pointer-events-none"
                 style={{ left: `${err.x}%`, top: `${err.y}%`, width: '320px', borderRightColor: '#716f64', borderBottomColor: '#716f64' }}
               >
                 <div className="bg-linear-to-r from-[#0058e6] to-[#3a93ff] text-white px-2 py-1 flex justify-between items-center text-xs font-bold font-sans">
                   <span className="tracking-wide">System Error</span>
                   <span className="bg-[#e96443] border border-white/50 px-1 pb-px leading-none text-white font-bold rounded-[2px]">X</span>
                 </div>
                 <div className="p-4 flex items-center gap-4 text-xs font-sans">
                   <div className="w-10 h-10 shrink-0 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-black border-2 border-[#ece9d8] shadow-[1px_1px_0_rgba(0,0,0,0.5)]">X</div>
                   <span className="font-medium mr-4">{t('story.found_you')}</span>
                 </div>
                 <div className="flex justify-center pb-3 pt-1">
                    <button className="px-8 py-1 bg-[#ece9d8] border-2 border-white border-b-zinc-500 border-r-zinc-500 text-black text-xs shadow-sm">OK</button>
                 </div>
               </motion.div>
             ))}
          </div>
        );
      case 4:
      case 7:
        return <div className="w-full h-full bg-black relative" />;
      case 5:
        return (
          <div key="phase-5" className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full bg-black z-60">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.1 }} 
              transition={{ duration: 1.5, ease: "easeOut" }} 
              className="text-white font-serif text-3xl md:text-5xl tracking-[0.3em] font-light text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] w-full max-w-4xl px-8 mx-auto flex items-center justify-center flex-col"
            >
              {STORY_TEXT_2}
            </motion.div>
          </div>
        );
      case 6:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-12 md:pt-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl flex flex-col justify-start p-8 overflow-hidden h-[85vh] rounded-xl border border-white/5 bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
              <div className="border-b border-cyan-500/20 pb-4 mb-4 flex items-center gap-4 relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(0,240,255,0.3)]">🌐</div>
                <div>
                  <h2 className="text-white font-bold tracking-widest text-sm uppercase">{t('story.encrypted_channel')}</h2>
                  <p className="text-cyan-400/50 text-xs">{t('story.connected')}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative z-10 w-full flex-1 overflow-hidden scrollbar-hide">
                <AnimatePresence>
                  {chatMessages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 w-full shrink-0 ${msg.author === t('story.me') ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                        <img src={msg.avatar} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className={`flex flex-col max-w-[85%] ${msg.author === t('story.me') ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] tracking-widest uppercase mb-1 text-cyan-500/80">{msg.author}</span>
                        <div className={`p-3 rounded-2xl text-sm bg-white/5 text-white/90 border border-white/10 font-mono ${msg.author === t('story.me') ? 'rounded-tr-sm bg-cyan-950/30 border-cyan-500/30' : 'rounded-tl-sm'}`}>{msg.text}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {typingIndicator && <div className="text-white/40 font-mono text-sm mt-4 shrink-0 animate-pulse">{typingIndicator}</div>}
                <div ref={messagesEndRef} className="h-4 shrink-0" />
              </div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-black flex flex-col justify-center items-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: (phase === 4 || phase === 7) ? 0 : 1 }} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[1000px] h-[1000px] rounded-full transition-all duration-1000" style={{ background: phase === 3 ? `radial-gradient(circle, rgba(255,0,0,${0.1 + climaxIntensity * 0.2}) 0%, rgba(0,0,0,0) 70%)` : 'radial-gradient(circle, rgba(157,0,255,0.12) 0%, rgba(0,0,0,0) 75%)', filter: 'blur(80px)' }} />
      </motion.div>
      {([2, 3, 6].includes(phase)) && <MatrixRain opacity={phase === 3 ? 0.3 : 0.07} color={phase === 6 ? '#00f0ff' : '#9d00ff'} speed={phase === 3 ? 2 : 33} blur={1} />}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2, backgroundColor: 'rgba(255,0,0,0.2)' }} className="absolute inset-0 z-5 pointer-events-none" />
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>
      <SkipButton onSkip={() => setScreen(Screen.GAME)} />
    </div>
  );
};
