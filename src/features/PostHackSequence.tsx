import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useI18n } from '@/core/i18n';
import { SkipButton } from '@/components/SkipButton';

// Avatars
// @ts-ignore
import friendPic from '@/textures/sprites/friend_pic.png';
// @ts-ignore
import heroPic from '@/textures/sprites/main_ch_pic.png';

// SFX
// @ts-ignore
import messageSfx from '@/textures/sfx/menu cutscene/message.mp3';
// @ts-ignore
import textSfx from '@/textures/sfx/menu cutscene/text.mp3';
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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typingIndicator]);

  // Play message notification SFX
  useEffect(() => {
    if (chatMessages.length > prevMsgCountRef.current && (phase === 1 || phase === 3)) {
      const sfx = new Audio(messageSfx);
      sfx.volume = 0.3;
      sfx.play().catch(() => { });
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages.length, phase]);

  // Phase Execution
  useEffect(() => {
    // Phase 1: DD Chaos Chat
    if (phase === 1) {
      let isCancelled = false;
      const runDDSequence = async () => {
        let msgId = 0;
        const typingAudio = new Audio(typingSfx);
        typingAudio.loop = true;
        typingAudio.volume = 0.3;
        
        let activeDangerAudio: HTMLAudioElement | null = null;

        // Ensure clean start
        setChatMessages([]);

        const script = CHAT_DD;

        for (const line of script) {
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
            if (!activeDangerAudio || activeDangerAudio.ended) {
              activeDangerAudio = new Audio(dangerSfx);
              activeDangerAudio.volume = 0.4;
              activeDangerAudio.play().catch(() => {});
            }
          }
        }
        await new Promise(r => setTimeout(r, 3000));
        if (!isCancelled) setPhase(2);
      };
      runDDSequence();
      return () => { isCancelled = true; };
    }

    // Phase 2: Blackout transition 2s
    if (phase === 2) {
      setChatMessages([]);
      const timer = setTimeout(() => setPhase(3), 2000);
      return () => clearTimeout(timer);
    }

    // Phase 3: Friend Panic Chat
    if (phase === 3) {
      let isCancelled = false;
      const runFriendSequence = async () => {
        let msgId = 100;
        const typingAudio = new Audio(typingSfx);
        typingAudio.loop = true;
        typingAudio.volume = 0.3;

        const script = CHAT_FRIEND;

        for (const line of script) {
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

    // Phase 4: Escaping Car Audio + Red Flashes (5 seconds total)
    if (phase === 4) {
      const carAudio = new Audio(carSfx);
      carAudio.volume = 0.5;
      carAudio.play().catch(() => { });

      const controls = animate(speedValue, [120, 260, 180], {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.8, 1]
      });

      const timer = setTimeout(() => {
        carAudio.pause();
        controls.stop();
        setPhase(5);
      }, 5000);

      return () => {
        clearTimeout(timer);
        carAudio.pause();
        controls.stop();
      };
    }

    // Phase 5: Final blackout → Defense Game
    if (phase === 5) {
      const timer = setTimeout(() => {
        useGameStore.getState().setScreen(Screen.DEFENSE_GAME);
      }, 2000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, setScreen]); 


  const renderContent = () => {
    switch (phase) {
      case 1:
        // DD CHAT
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl flex flex-col justify-start p-8 overflow-hidden h-[80vh] rounded-xl border border-white/5 bg-black/60 shadow-[0_0_80px_rgba(255,0,0,0.1)] relative pointer-events-none"
            >
              <div className="border-b border-red-500/20 pb-4 mb-4 flex items-center gap-4 relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-900/50 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(255,0,0,0.3)]">⚠️</div>
                <div>
                  <h2 className="text-white font-bold tracking-widest text-sm uppercase">DIGITAL DREAMS // SECURITY_TEAM</h2>
                  <p className="text-red-500/50 text-xs uppercase">{t('post_hack.dd_incidents')}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative z-10 w-full flex-1 overflow-hidden scrollbar-hide">
                <AnimatePresence>
                  {chatMessages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 w-full shrink-0">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-red-500/30 flex items-center justify-center text-[10px] font-mono text-red-400 overflow-hidden shadow-inner">{msg.avatar}</div>
                      <div className="flex flex-col max-w-[85%]">
                        <span className={`text-[10px] tracking-widest uppercase mb-1 ${msg.isThreat ? 'text-red-500 font-bold' : 'text-red-500/50'}`}>{msg.author}</span>
                        <div className={`p-3 rounded-2xl rounded-tl-sm text-sm ${msg.isThreat ? 'bg-red-900/50 text-red-100 border border-red-500/50 animate-pulse font-black tracking-widest' : 'bg-white/5 text-white/90 shadow-md border border-white/10 font-mono'}`}>{msg.text}</div>
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

      case 3:
        // FRIEND CHAT
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0 }}
              className="w-full max-w-2xl flex flex-col justify-start p-8 overflow-hidden h-[85vh] rounded-xl border border-white/5 bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative pointer-events-none"
            >
              <div className="border-b border-cyan-500/20 pb-4 mb-4 flex items-center gap-4 relative z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(0,240,255,0.3)]">🌐</div>
                <div>
                  <h2 className="text-white font-bold tracking-widest text-sm uppercase">{t('story.encrypted_channel')}</h2>
                  <p className="text-xs text-red-500 font-bold animate-pulse uppercase">{t('post_hack.friend_alert')}</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 relative z-10 w-full flex-1 overflow-hidden scrollbar-hide">
                <AnimatePresence>
                  {chatMessages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 w-full shrink-0 ${msg.author === t('story.me') ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-cyan-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                        <img src={msg.avatar} alt="avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className={`flex flex-col max-w-[85%] ${msg.author === t('story.me') ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] tracking-widest uppercase mb-1 text-cyan-500/80">{msg.author}</span>
                        <div className={`p-3 rounded-2xl text-sm bg-white/5 text-white/90 shadow-md border border-white/10 font-mono ${msg.author === t('story.me') ? 'rounded-tr-sm bg-cyan-950/30 border-cyan-500/30' : 'rounded-tl-sm'}`}>{msg.text}</div>
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

      case 2:
      case 4:
      case 5:
        // Blackout / Car sequence / Final Ending screens
        return (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-8"
          >
            {/* Speedometer during phase 4 */}
            <AnimatePresence>
              {phase === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="relative z-10 mb-12"
                >
                  <motion.div
                    animate={{
                      x: [0, -1, 1, -1, 0],
                      y: [0, 1, -1, 1, 0],
                      rotate: [0, -0.5, 0.5, 0]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.15,
                    }}
                    className="w-72 h-72 relative border-4 border-zinc-700/80 rounded-full flex items-center justify-center bg-zinc-950 shadow-[inset_0_0_60px_rgba(0,0,0,1),0_0_80px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                     {/* Dashboard glow */}
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.15)_0%,transparent_70%)]" />

                     {/* Dial Ticks using SVGs */}
                     <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <g>
                           {/* Create ticks ranging from -110 to 110 degrees */}
                           {Array.from({length: 23}).map((_, i) => {
                              const deg = -110 + (i * 10);
                              const isMajor = i % 2 === 0;
                              return (
                                <line
                                  key={i}
                                  x1="50" y1="50" x2="50" y2={isMajor ? "10" : "15"}
                                  stroke={deg > 70 ? "rgba(239, 68, 68, 0.8)" : "rgba(255, 255, 255, 0.4)"} 
                                  strokeWidth={isMajor ? "1.5" : "0.5"}
                                  transform={`rotate(${deg} 50 50)`}
                                />
                              )
                           })}
                        </g>
                     </svg>

                     {/* Numbers */}
                     <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <span className="absolute text-xs text-white/50 font-bold" style={{ transform: 'translate(-85px, 30px)' }}>0</span>
                        <span className="absolute text-xs text-white/50 font-bold" style={{ transform: 'translate(-55px, -60px)' }}>80</span>
                        <span className="absolute text-xs text-white/50 font-bold" style={{ transform: 'translate(55px, -60px)' }}>160</span>
                        <span className="absolute text-xs text-red-500/80 font-bold" style={{ transform: 'translate(85px, 30px)' }}>240</span>
                     </div>

                     {/* Center Cap */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-800 border-[3px] border-zinc-600 rounded-full shadow-lg z-20" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-900 rounded-full z-30" />
                     
                     {/* Speedometer Needle */}
                     <motion.div 
                        className="w-[4px] h-[115px] bg-red-500 rounded-t-full origin-bottom absolute bottom-1/2 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(239,68,68,1)] z-10"
                        style={{ rotate: needleRotation }}
                     />

                     <div className="absolute bottom-16 text-[11px] text-zinc-500 uppercase tracking-[0.4em] font-black italic">
                        KM/H
                     </div>
                     <div className="absolute bottom-6 flex items-baseline gap-1 font-mono">
                        {/* Digital speed readout */}
                        <motion.span 
                          className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-b from-white to-zinc-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                          animate={{ opacity: [1, 0.9, 1] }}
                          transition={{ repeat: Infinity, duration: 0.1 }}
                        >
                          {speedText}
                        </motion.span>
                     </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Red Flash Interval Overlay during phase 4 */}
            <AnimatePresence>
              {phase === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.45, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", repeatDelay: 2.0 }} // Active flash + 2s rest = 2.5s interval
                  className="absolute inset-0 bg-red-900 pointer-events-none mix-blend-overlay"
                />
              )}
            </AnimatePresence>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-1000 bg-black flex flex-col justify-center items-center overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      <SkipButton onSkip={() => setScreen(Screen.DEFENSE_GAME)} />
    </div>
  );
};
