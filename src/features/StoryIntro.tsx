import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useChatStore } from '@/core/useChatStore';
import { MatrixRain } from '@/components/MatrixRain';
import { useI18n } from '@/core/i18n';

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
  const { t } = useI18n();
  const [phase, setPhase] = useState<number>(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);

  const STORY_TEXT_1 = t('story.text1');
  const STORY_TEXT_2 = t('story.text2');

  const CHAT_SCRIPT_1 = useMemo(() => [
    { author: "Sec_Bot_v2", avatar: "[!]", text: t('story.script1.0'), typingTime: 2000, waitBefore: 1500 },
    { author: "SysAdmin_Max", avatar: "(O_O)", text: t('story.script1.1'), typingTime: 1200, waitBefore: 500 },
    { author: "Dev_Oleg", avatar: "(怒)", text: t('story.script1.2'), typingTime: 2000, waitBefore: 800 },
    { author: "QA_Anna", avatar: "(╥﹏╥)", text: t('story.script1.3'), typingTime: 1500, waitBefore: 500 },
    { author: "Sec_Bot_v2", avatar: "[!]", text: t('story.script1.4'), typingTime: 1500, waitBefore: 2000 },
    { author: "Sec_Bot_v2", avatar: "[!]", text: t('story.script1.5'), typingTime: 100, waitBefore: 100 },
  ], [t]);

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
    if (chatMessages.length > prevMsgCountRef.current && (phase === 2 || phase === 6)) {
      const sfx = new Audio(messageSfx);
      sfx.volume = 0.3;
      sfx.play().catch(() => { });
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages.length, phase]);

  useEffect(() => {
    if (phase === 1) {
      const sfx = new Audio(textSfx);
      sfx.volume = 0.5;
      sfx.play().catch(() => { });
      const timer = setTimeout(() => { setPhase(2); }, 3500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 2) {
      let isCancelled = false;
      const runChatSequence = async () => {
        let msgId = 0;
        for (const line of CHAT_SCRIPT_1) {
          if (isCancelled) return;
          await new Promise(r => setTimeout(r, line.waitBefore));
          if (isCancelled) return;
          setTypingIndicator(t('story.typing', { name: line.author }));
          await new Promise(r => setTimeout(r, line.typingTime));
          if (isCancelled) return;
          setTypingIndicator(null);
          setChatMessages(prev => [...prev, { id: msgId++, author: line.author, avatar: line.avatar, text: line.text }]);
        }
        await new Promise(r => setTimeout(r, 2000));
        if (!isCancelled) setPhase(3);
      };
      runChatSequence();
      return () => { isCancelled = true; };
    }
  }, [phase, CHAT_SCRIPT_1, t]);

  useEffect(() => {
    if (phase === 3) {
      const startTime = Date.now();
      const CHAOS_DURATION = 5000;
      const FADE_TRIGGER = CHAOS_DURATION - 2000;
      let fadePlayed = false;
      let msgId = 100;

      const chaosAudio = new Audio(chaosSfx);
      chaosAudio.volume = 0.5;
      chaosAudio.play().catch(() => { });

      const typingAudio = new Audio(typingSfx);
      typingAudio.loop = true;
      typingAudio.volume = 0.4;
      typingAudio.play().catch(() => { });

      spamIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const intensity = Math.min(elapsed / CHAOS_DURATION, 1);
        setChatMessages(prev => [
          ...prev,
          { id: msgId++, author: "UNKNOWN", avatar: "[X]", text: t('story.found_you'), isThreat: true }
        ]);
        setClimaxIntensity(intensity);
        if (elapsed >= FADE_TRIGGER && !fadePlayed) {
          fadePlayed = true;
          const fadeAudio = new Audio(fadeSfx);
          fadeAudio.volume = 0.6;
          fadeAudio.play().catch(() => { });
        }
        if (elapsed >= CHAOS_DURATION) {
          if (spamIntervalRef.current) clearInterval(spamIntervalRef.current);
          typingAudio.pause();
          setPhase(4);
        }
      }, 150);

      return () => {
        chaosAudio.pause();
        typingAudio.pause();
      };
    }
  }, [phase, t]);

  useEffect(() => {
    if (phase === 4) {
      const timer = setTimeout(() => setPhase(5), 3000);
      return () => clearTimeout(timer);
    }
    if (phase === 5) {
      setChatMessages([]);
      const sfx = new Audio(textSfx);
      sfx.volume = 0.5;
      sfx.play().catch(() => { });
      const timer = setTimeout(() => setPhase(6), 3500);
      return () => clearTimeout(timer);
    }
    if (phase === 6) {
      let isCancelled = false;
      const runChatSequence2 = async () => {
        let msgId = 200;
        for (const line of CHAT_SCRIPT_2) {
          if (isCancelled) return;
          await new Promise(r => setTimeout(r, line.waitBefore));
          if (isCancelled) return;
          setTypingIndicator(line.author === t('story.me') ? t('story.sending') : t('story.typing', { name: line.author }));
          await new Promise(r => setTimeout(r, line.typingTime));
          if (isCancelled) return;
          setTypingIndicator(null);
          const newMsg = { author: line.author, text: line.text, type: 'normal' as const };
          setChatMessages(prev => [...prev, { id: msgId++, ...newMsg, avatar: line.avatar }]);
          useChatStore.getState().addMessage(newMsg);
        }
        await new Promise(r => setTimeout(r, 2000));
        if (!isCancelled) setPhase(7);
      };
      runChatSequence2();
      return () => { isCancelled = true; };
    }
    if (phase === 7) {
      const timer = setTimeout(() => setScreen(Screen.GAME), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, setScreen, CHAT_SCRIPT_2, t]);

  const renderContent = () => {
    switch (phase) {
      case 1:
        return (
          <div key="phase-1" className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="text-white/80 font-serif text-2xl md:text-3xl tracking-widest">{STORY_TEXT_1}</motion.div>
          </div>
        );
      case 2:
      case 3:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                scale: phase === 3 ? (1 + climaxIntensity * 0.3) : 1,
                filter: (phase === 3 && climaxIntensity > 1.8) ? `blur(${(climaxIntensity - 1.8) * 8}px) brightness(${1 + (climaxIntensity - 1.8) * 1.5})` : 'blur(0px)',
                rotate: phase === 3 ? [(Math.random()-0.5)*2, (Math.random()-0.5)*-2] : 0
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
                        <span className={`text-[10px] tracking-widest uppercase mb-1 ${msg.isThreat ? 'text-red-500 font-bold' : 'text-purple-500/80'}`}>{msg.author}</span>
                        <div className={`p-3 rounded-2xl rounded-tl-sm text-sm ${msg.isThreat ? 'bg-red-900/50 text-red-100 border border-red-500/50' : 'bg-white/5 text-white/90 border border-white/10'}`}>{msg.text}</div>
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
      case 4:
      case 7:
        return <div className="w-full h-full bg-black relative" />;
      case 5:
        return (
          <div key="phase-5" className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="text-white/80 font-serif text-3xl md:text-5xl tracking-widest">{STORY_TEXT_2}</motion.div>
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
      {([2, 3, 6].includes(phase)) && <MatrixRain opacity={phase === 3 ? 0.3 : 0.07} color={phase === 6 ? '#00f0ff' : '#9d00ff'} speed={phase === 3 ? 20 : 33} blur={1} />}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.2, 0.8, 0], backgroundColor: ['rgba(255,0,0,0)', 'rgba(255,0,0,0.3)', 'rgba(255,0,0,0)'] }} transition={{ repeat: Infinity, duration: 0.4 }} className="absolute inset-0 z-5 pointer-events-none" />
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      </div>
      <button onClick={() => setScreen(Screen.GAME)} className="fixed top-8 right-8 text-[11px] text-white/40 hover:text-white transition-all tracking-[0.4em] uppercase z-50 px-6 py-3 border border-white/5 hover:border-white/20 hover:bg-white/5 bg-black/40 backdrop-blur-md rounded-sm cursor-pointer">
        {t('menu.skip')}
      </button>
    </div>
  );
};
