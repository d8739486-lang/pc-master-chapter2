import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Screen } from '@/core/store';
import { useI18n } from '@/core/i18n';

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

interface ChatMessage {
  id: number;
  author: string;
  avatar: string;
  text: string;
}

export const VictoryChat = () => {
  const { setScreen } = useGameStore();
  const { t } = useI18n();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const VICTORY_SCRIPT = useMemo(() => [
    { author: t('story.friend'), avatar: friendPic, text: t('victory_chat.script.0'), typingTime: 2500, waitBefore: 1500 },
    { author: t('story.friend'), avatar: friendPic, text: t('victory_chat.script.1'), typingTime: 2800, waitBefore: 1000 },
    { author: t('story.me'), avatar: heroPic, text: t('victory_chat.script.2'), typingTime: 2200, waitBefore: 1500 },
    { author: t('story.friend'), avatar: friendPic, text: t('victory_chat.script.3'), typingTime: 2500, waitBefore: 1000 },
    { author: t('story.me'), avatar: heroPic, text: t('victory_chat.script.4'), typingTime: 2000, waitBefore: 2000 },
    { author: t('story.friend'), avatar: friendPic, text: t('victory_chat.script.5'), typingTime: 3000, waitBefore: 1000 },
    { author: t('story.friend'), avatar: friendPic, text: t('victory_chat.script.6'), typingTime: 2500, waitBefore: 1500 },
  ], [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, typingIndicator]);

  useEffect(() => {
    if (chatMessages.length > prevMsgCountRef.current) {
      const sfx = new Audio(messageSfx);
      sfx.volume = 0.3;
      sfx.play().catch(() => {});
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages.length]);

  useEffect(() => {
    let isCancelled = false;

    const runSequence = async () => {
      let msgId = 0;
      const typingAudio = new Audio(typingSfx);
      typingAudio.loop = true;
      typingAudio.volume = 0.3;

      for (const line of VICTORY_SCRIPT) {
        if (isCancelled) return;
        await new Promise(r => setTimeout(r, line.waitBefore));
        if (isCancelled) return;
        setTypingIndicator(line.author === t('story.me') ? t('story.sending') : t('story.typing', { name: line.author }));

        typingAudio.play().catch(() => {});
        await new Promise(r => setTimeout(r, line.typingTime));
        typingAudio.pause();

        if (isCancelled) return;
        setTypingIndicator(null);
        setChatMessages(prev => [...prev, { id: msgId++, author: line.author, avatar: line.avatar, text: line.text }]);
      }

      await new Promise(r => setTimeout(r, 3000));
      if (!isCancelled) setScreen(Screen.ENDING);
    };

    runSequence();
    return () => { isCancelled = true; };
  }, [setScreen, VICTORY_SCRIPT, t]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-start py-12 md:py-20 p-4 md:p-8 overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0 }}
        className="w-full max-w-2xl flex flex-col justify-start p-8 overflow-hidden h-[85vh] rounded-xl border border-emerald-500/20 bg-black/40 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative"
      >
        <div className="border-b border-emerald-500/20 pb-4 mb-4 flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.3)]">🏆</div>
          <div>
            <h2 className="text-white font-bold tracking-widest text-sm uppercase">{t('story.encrypted_channel')}</h2>
            <p className="text-emerald-400/60 text-xs font-bold uppercase">{t('victory_chat.mission_complete')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence>
            {chatMessages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 w-full shrink-0 ${msg.author === t('story.me') ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 shrink-0 rounded-full bg-black/40 border border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-inner">
                  <img src={msg.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className={`flex flex-col max-w-[85%] ${msg.author === t('story.me') ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] tracking-widest uppercase mb-1 text-emerald-500/80">{msg.author}</span>
                  <div className={`p-3 rounded-2xl text-sm bg-white/5 text-white/90 shadow-md border border-white/10 font-mono ${msg.author === t('story.me') ? 'rounded-tr-sm bg-emerald-950/30 border-emerald-500/30' : 'rounded-tl-sm'}`}>{msg.text}</div>
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
};
