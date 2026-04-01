import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, FRIEND_CHAT_SCRIPTS, type IFriendChatLine, Screen } from '@/core/store';
import { audioManager } from '@/core/audio';
import { useI18n } from '@/core/i18n';

// @ts-ignore
import messageSfx from '@/textures/sfx/menu cutscene/message.mp3';
// @ts-ignore
import textSfx from '@/textures/sfx/menu cutscene/text.mp3';

// @ts-ignore
import friendPic from '@/textures/sprites/friend_pic.png';
// @ts-ignore
import heroPic from '@/textures/sprites/main_ch_pic.png';

interface IChatBubble {
  id: number;
  author: 'hero' | 'friend';
  text: string;
}

/**
 * Full-screen overlay chat that slides down when a stage evolution is triggered.
 * Behind the overlay, the game swaps the server sprite to the new stage.
 * After the dialogue finishes, the overlay slides back up, revealing the new tech.
 */
export const FriendChat = () => {
  const { friendChatOpen, friendChatEvolution, closeFriendChat, doEvolve, setScreen } = useGameStore();
  const [messages, setMessages] = useState<IChatBubble[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [chatDone, setChatDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasEvolvedRef = useRef(false);
  const { t, language } = useI18n();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Run chat dialogue
  useEffect(() => {
    if (!friendChatOpen) {
      setMessages([]);
      setChatDone(false);
      hasEvolvedRef.current = false;
      return;
    }

    // Play chat in SFX
    audioManager.chat(true);

    const script: IFriendChatLine[] = FRIEND_CHAT_SCRIPTS[language]?.[friendChatEvolution] || [];
    let isCancelled = false;

    const runChat = async () => {
      let msgId = 0;

      // Wait 1 second for the slide-down to complete, then evolve behind the overlay
      await new Promise(r => setTimeout(r, 1000));
      if (isCancelled) return;

      // Evolve the stage behind the chat overlay (if not the final stage)
      if (!hasEvolvedRef.current && friendChatEvolution < 3) {
        doEvolve();
        hasEvolvedRef.current = true;
      }

      for (const line of script) {
        if (isCancelled) return;

        // Show typing indicator
        setTyping(line.author === 'hero' ? t('story.sending') : t('story.typing', { name: t('chat_panel.friend') }));
        await new Promise(r => setTimeout(r, line.typingTime));
        if (isCancelled) return;

        // Add message
        setTyping(null);
        // Using a generic message sound for individual messages
        audioManager.click(); 
        setMessages(prev => [...prev, { id: msgId++, author: line.author, text: line.text }]);

        // Small gap between messages
        await new Promise(r => setTimeout(r, 600));
      }

      if (isCancelled) return;

      // Wait 2 seconds, then close
      await new Promise(r => setTimeout(r, 2000));
      if (isCancelled) return;

      setChatDone(true);

      // Play chat out SFX before actual closing
      audioManager.chat(false);

      // After stage 3 final dialogue → transition text screen
      if (friendChatEvolution === 3) {
        await new Promise(r => setTimeout(r, 500));
        if (isCancelled) return;
        closeFriendChat();
        setScreen(Screen.TRANSITION_TEXT);
      } else {
        // Normal: just close the overlay, revealing new tech
        await new Promise(r => setTimeout(r, 500));
        if (!isCancelled) closeFriendChat();
      }
    };

    runChat();
    return () => { isCancelled = true; };
  }, [friendChatOpen, friendChatEvolution, closeFriendChat, doEvolve, setScreen]);

  return (
    <AnimatePresence>
      {friendChatOpen && (
        <motion.div
          key="friend-chat-overlay"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-900 bg-black/95 backdrop-blur-md flex flex-col justify-start"
        >
          <div className="w-full max-w-lg flex flex-col h-full max-h-[600px] pt-12 md:pt-20 px-6 mx-auto">
            {/* Chat header */}
            <div className="border-b border-cyan-500/20 pb-4 mb-4 flex items-center gap-4 shrink-0">
              <div className="w-10 h-10 rounded-full bg-cyan-900/50 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                🔒
              </div>
              <div>
                <h2 className="text-white font-bold tracking-widest text-sm">{t('chat_panel.encrypted_msg')}</h2>
                <p className="text-cyan-400/50 text-xs">{t('chat_panel.secure_conn')}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden [&::-webkit-scrollbar]:hidden scrollbar-hide">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex gap-3 w-full shrink-0 ${msg.author === 'hero' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-cyan-500/30 bg-black/60 shadow-[0_0_10px_rgba(0,180,255,0.2)]">
                      <img 
                        src={msg.author === 'hero' ? heroPic : friendPic} 
                        alt={msg.author} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`flex flex-col max-w-[80%] ${msg.author === 'hero' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] tracking-widest uppercase mb-1 text-cyan-500/60 font-bold">
                        {msg.author === 'hero' ? t('chat_panel.hero_offline') : t('chat_panel.friend_online')}
                      </span>
                      <div className={`p-3 rounded-2xl text-sm font-mono text-white/90 shadow-lg border border-white/10 ${msg.author === 'hero' ? 'rounded-tr-sm bg-cyan-950/40 border-cyan-500/30' : 'rounded-tl-sm bg-white/5 backdrop-blur-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/30 font-mono text-xs flex items-center gap-2 mt-2"
                >
                  <span className="animate-pulse">{typing}</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2 shrink-0" />
            </div>

            {/* Chat status */}
            {chatDone && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-cyan-400/30 text-[10px] tracking-widest uppercase mt-4 shrink-0"
              >
                {t('chat_panel.closing')}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
