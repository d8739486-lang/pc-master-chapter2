import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useI18n } from '@/core/i18n';
import { SkipButton } from '@/components/SkipButton';
import { audioManager } from '@/core/audio';

// Avatars
// @ts-ignore
import friendPic from '@/textures/sprites/friend_pic.png';
// @ts-ignore
import heroPic from '@/textures/sprites/main_ch_pic.png';

// SFX
// @ts-ignore
import messageSfx from '@/textures/sfx/menu cutscene/message.mp3';
// @ts-ignore
import typingSfx from '@/textures/sfx/menu cutscene/typing.mp3';
// @ts-ignore
import dangerSfx from '@/textures/sfx/main/danger.mp3';
// @ts-ignore
import carSfx from '@/textures/sfx/main/car.mp3';

interface ChatMessage {
  id: number;
  author: string;
  avatar: string;
  text: string;
  isThreat?: boolean;
}

export const PostHackSequence = () => {
  const { setScreen } = useGameStore();
  const { t } = useI18n();
  const [phase, setPhase] = useState<number>(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);

  const speedValue = useMotionValue(120);
  const speedText = useTransform(speedValue, (latest) => Math.round(latest).toString());
  const needleRotation = useTransform(speedValue, [0, 260], [-110, 110]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const CHAT_DD = useMemo(() => [
    { author: t('story.sec_bot'), avatar: "[!]", text: t('post_hack.chat_dd.0'), typingTime: 1000, waitBefore: 500, isThreat: true },
    { author: "SysAdmin_Max", avatar: "(O_O)", text: t('post_hack.chat_dd.1'), typingTime: 1200, waitBefore: 500 },
    { author: "Dev_Oleg", avatar: "(怒)", text: t('post_hack.chat_dd.2'), typingTime: 1500, waitBefore: 800 },
    { author: t('story.sec_bot'), avatar: "[!]", text: t('post_hack.chat_dd.3'), typingTime: 1000, waitBefore: 1000, isThreat: true },
    { author: "SysAdmin_Max", avatar: "(O_O)", text: t('post_hack.chat_dd.4'), typingTime: 1500, waitBefore: 500 },
    { author: "Dev_Oleg", avatar: "(怒)", text: t('post_hack.chat_dd.5'), typingTime: 2000, waitBefore: 1500 },
    { author: t('story.sec_bot'), avatar: "[!]", text: t('post_hack.chat_dd.6'), typingTime: 1500, waitBefore: 1500, isThreat: true },
    { author: t('story.sec_bot'), avatar: "[!]", text: t('post_hack.chat_dd.7'), typingTime: 1000, waitBefore: 1000, isThreat: true },
  ], [t]);

  const CHAT_FRIEND = useMemo(() => [
    { author: t('story.friend'), avatar: friendPic, text: t('post_hack.chat_friend.0'), typingTime: 2500, waitBefore: 1000 },
    { author: t('story.friend'), avatar: friendPic, text: t('post_hack.chat_friend.1'), typingTime: 2500, waitBefore: 500 },
    { author: t('story.friend'), avatar: friendPic, text: t('post_hack.chat_friend.2'), typingTime: 3000, waitBefore: 500 },
    { author: t('story.me'), avatar: heroPic, text: t('post_hack.chat_friend.3'), typingTime: 2500, waitBefore: 1500 },
  ], [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typingIndicator]);

  useEffect(() => {
    if (chatMessages.length > prevMsgCountRef.current && (phase === 1 || phase === 3)) {
      const sfx = new Audio(messageSfx);
      sfx.volume = 0.3;
      sfx.play().catch(() => { });
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages.length, phase]);

  useEffect(() => {
    if (phase === 1) {
      let isCancelled = false;
      const runDDSequence = async () => {
        let msgId = 0;
        const typingAudio = new Audio(typingSfx);
        typingAudio.loop = true;
        typingAudio.volume = 0.3;
        
        setChatMessages([]);
        for (const line of CHAT_DD) {
          if (isCancelled) return;
          await new Promise(r => setTimeout(r, line.waitBefore));
          if (isCancelled) return;
          setTypingIndicator(t('story.typing', { name: line.author }));
          typingAudio.play().catch(() => { });
          await new Promise(r => setTimeout(r, line.typingTime));
          typingAudio.pause();
          if (isCancelled) return;
          setTypingIndicator(null);
          setChatMessages(prev => [...prev, { id: msgId++, author: line.author, avatar: line.avatar, text: line.text, isThreat: line.isThreat }]);
          
          if (line.isThreat) {
            audioManager.dangerStart(500);
          }
        }
        await new Promise(r => setTimeout(r, 3000));
        if (!isCancelled) setPhase(2);
      };
      runDDSequence();
      return () => { 
        isCancelled = true; 
        audioManager.dangerStop(); // Global cleanup for this component
      };
    }
    if (phase === 2) {
      setChatMessages([]);
      const timer = setTimeout(() => setPhase(3), 2000);
      return () => clearTimeout(timer);
    }
    if (phase === 3) {
      let isCancelled = false;
      const runFriendSequence = async () => {
        let msgId = 100;
        const typingAudio = new Audio(typingSfx);
        typingAudio.loop = true;
        typingAudio.volume = 0.3;
        for (const line of CHAT_FRIEND) {
          if (isCancelled) return;
          await new Promise(r => setTimeout(r, line.waitBefore));
          if (isCancelled) return;
          setTypingIndicator(line.author === t('story.me') ? t('story.sending') : t('story.typing', { name: line.author }));
          typingAudio.play().catch(() => { });
          await new Promise(r => setTimeout(r, line.typingTime));
          typingAudio.pause();
          if (isCancelled) return;
          setTypingIndicator(null);
          setChatMessages(prev => [...prev, { id: msgId++, author: line.author, avatar: line.avatar, text: line.text }]);
        }
        await new Promise(r => setTimeout(r, 3000));
        if (!isCancelled) setPhase(4);
      };
      runFriendSequence();
      return () => { isCancelled = true; };
    }
    if (phase === 4) {
      const carAudio = new Audio(carSfx);
      carAudio.volume = 0.5;
      carAudio.play().catch(() => { });
      const controls = animate(speedValue, [120, 260, 180], { duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.8, 1] });
      const timer = setTimeout(() => {
        carAudio.pause();
        controls.stop();
        setPhase(5);
      }, 5000);
      return () => { clearTimeout(timer); carAudio.pause(); controls.stop(); };
    }
    if (phase === 5) {
      const timer = setTimeout(() => { setScreen(Screen.DEFENSE_GAME); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, setScreen, speedValue, t, CHAT_DD, CHAT_FRIEND]);

  const renderContent = () => {
    switch (phase) {
      case 1:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl flex flex-col justify-start p-8 overflow-hidden h-[80vh] rounded-xl border border-white/5 bg-black/60 shadow-[0_0_80px_rgba(255,0,0,0.1)] relative">
              <div className="border-b border-red-500/20 pb-4 mb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center text-xl">⚠️</div>
                <div><h2 className="text-white font-bold tracking-widest text-sm uppercase">DIGITAL DREAMS // SECURITY</h2><p className="text-red-500/50 text-xs uppercase">{t('post_hack.dd_incidents')}</p></div>
              </div>
              <div className="flex flex-col gap-4 flex-1 overflow-hidden scrollbar-hide">
                <AnimatePresence>{chatMessages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 w-full shrink-0">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-red-500/30 flex items-center justify-center text-[10px] font-mono text-red-400">{msg.avatar}</div>
                    <div className="flex flex-col max-w-[85%]"><span className={`text-[10px] tracking-widest uppercase mb-1 ${msg.isThreat ? 'text-red-500 font-bold' : 'text-red-500/50'}`}>{msg.author}</span><div className={`p-3 rounded-2xl rounded-tl-sm text-sm ${msg.isThreat ? 'bg-red-900/50 text-red-100 border border-red-500/50' : 'bg-white/5 text-white/90 shadow-md border border-white/10 font-mono'}`}>{msg.text}</div></div>
                  </motion.div>
                ))}</AnimatePresence>
                {typingIndicator && <div className="text-white/40 font-mono text-sm mt-4 animate-pulse">{typingIndicator}</div>}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </motion.div>
          </div>
        );
      case 3:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl flex flex-col justify-start p-8 h-[85vh] rounded-xl border border-white/5 bg-black/40 relative">
              <div className="border-b border-cyan-500/20 pb-4 mb-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-[10px]">🌐</div>
                <div><h2 className="text-white font-bold tracking-widest text-sm uppercase">{t('story.encrypted_channel')}</h2><p className="text-xs text-red-500 font-bold animate-pulse uppercase">{t('post_hack.friend_alert')}</p></div>
              </div>
              <div className="flex flex-col gap-4 flex-1 overflow-hidden scrollbar-hide">
                <AnimatePresence>{chatMessages.map(msg => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 w-full shrink-0 ${msg.author === t('story.me') ? 'flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-cyan-500/30 flex items-center justify-center overflow-hidden"><img src={msg.avatar} alt="avatar" className="w-full h-full object-cover" /></div>
                    <div className={`flex flex-col max-w-[85%] ${msg.author === t('story.me') ? 'items-end' : 'items-start'}`}><span className="text-[10px] tracking-widest uppercase mb-1 text-cyan-500/80">{msg.author}</span><div className={`p-3 rounded-2xl text-sm bg-white/5 text-white/90 shadow-md border border-white/10 font-mono ${msg.author === t('story.me') ? 'rounded-tr-sm bg-cyan-950/30 border-cyan-500/30' : 'rounded-tl-sm'}`}>{msg.text}</div></div>
                  </motion.div>
                ))}</AnimatePresence>
                {typingIndicator && <div className="text-white/40 font-mono text-sm mt-4 animate-pulse">{typingIndicator}</div>}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </motion.div>
          </div>
        );
      case 2:
      case 4:
      case 5:
        return (
          <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8">
            <AnimatePresence>
              {phase === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="relative z-10 mb-12">
                  <motion.div animate={{ x: [0, -1, 1, -1, 0], y: [0, 1, -1, 1, 0], rotate: [0, -0.5, 0.5, 0] }} transition={{ repeat: Infinity, duration: 0.15 }} className="w-72 h-72 relative border-4 border-zinc-700/80 rounded-full flex items-center justify-center bg-zinc-950 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.15)_0%,transparent_70%)]" />
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <g>{Array.from({length: 23}).map((_, i) => {
                        const deg = -110 + (i * 10);
                        const isMajor = i % 2 === 0;
                        return (<line key={i} x1="50" y1="50" x2="50" y2={isMajor ? "10" : "15"} stroke={deg > 70 ? "rgba(239, 68, 68, 0.8)" : "rgba(255, 255, 255, 0.4)"} strokeWidth={isMajor ? "1.5" : "0.5"} transform={`rotate(${deg} 50 50)`} />);
                      })}</g>
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-800 border-[3px] border-zinc-600 rounded-full z-20" />
                    <motion.div className="w-[4px] h-[115px] bg-red-500 rounded-t-full origin-bottom absolute bottom-1/2 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(239,68,68,1)] z-10" style={{ rotate: needleRotation }} />
                    <div className="absolute bottom-6 flex items-baseline gap-1 font-mono"><motion.span className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-b from-white to-zinc-500">{speedText}</motion.span></div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {phase === 4 && <motion.div animate={{ opacity: [0, 0.45, 0] }} transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", repeatDelay: 2.0 }} className="absolute inset-0 bg-red-900 pointer-events-none mix-blend-overlay" />}
            </AnimatePresence>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-1000 bg-black flex flex-col justify-center items-center overflow-hidden select-none">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
      <SkipButton onSkip={() => { audioManager.dangerStop(); setScreen(Screen.DEFENSE_GAME); }} />
    </div>
  );
};
