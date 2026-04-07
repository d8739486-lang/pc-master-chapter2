import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, type IChatMessage } from '@/core/useChatStore';
import { MessageSquare, X, Users, Shield } from 'lucide-react';
import { useI18n } from '@/core/i18n';

/**
 * In-game chat panel — bottom-left corner.
 * DD threats and friend messages in tab-based UI.
 * Chat icon sits at bottom-left with unread badge.
 */

/** Single message bubble */
const ChatBubble = ({ msg }: { msg: IChatMessage }) => {
  const { t } = useI18n();
  const isThreat = msg.type === 'threat';
  const isFriend = msg.author === 'Лучший друг' || msg.author === t('chat.friend_name');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: isThreat ? -50 : 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 w-full shrink-0"
    >
      <div
        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[9px] font-mono border ${
          isThreat
            ? 'bg-red-950/60 border-red-500/40 text-red-400'
            : isFriend
              ? 'bg-cyan-950/60 border-cyan-500/30 text-cyan-400'
              : 'bg-white/5 border-white/10 text-white/50'
        }`}
      >
        {isThreat ? '⚠' : isFriend ? '[X]' : '▪'}
      </div>
      <div className="flex flex-col max-w-[85%] min-w-0">
        <span
          className={`text-[9px] tracking-widest uppercase mb-0.5 ${
            isThreat ? 'text-red-500 font-bold' : isFriend ? 'text-cyan-500/70' : 'text-white/40'
          }`}
        >
          {msg.author}
        </span>
        <div
          className={`p-2.5 rounded-xl rounded-tl-sm text-xs font-mono wrap-break-word ${
            isThreat
              ? 'bg-red-950/40 text-red-200 border border-red-500/30 animate-pulse font-bold'
              : 'bg-white/5 text-white/80 border border-white/10'
          }`}
        >
          {msg.text}
        </div>
      </div>
    </motion.div>
  );
};

export const GameChat = () => {
  const {
    messages,
    activeChat,
    chatOpen,
    unreadCount,
    toggleChat,
    closeChat,
    setActiveChat,
    clearUnread,
  } = useChatStore();
  const { t } = useI18n();

  /** Filter messages to only show friend communication in this panel */
  const displayMessages = messages.filter(
    (m) => m.author === 'Лучший друг' || m.author === t('chat.friend_name') || m.author === 'friend' || m.author === 'Я' || m.author === t('story.me')
  );

  const handleOpenChat = () => {
    toggleChat();
    clearUnread();
    if (!chatOpen) {
      setActiveChat('friend');
    }
  };

  return (
    <>
      {/* ═══ Chat Icon — Bottom-Left ═══ */}
      <button
        type="button"
        onClick={handleOpenChat}
        className="fixed bottom-6 left-6 z-850 p-3 bg-black/80 border border-cyan-500/30 rounded-full hover:border-cyan-500/60 hover:bg-black/90 transition-all group shadow-[0_0_15px_rgba(0,255,255,0.15)]"
        aria-label="Открыть чат"
      >
        <MessageSquare className="w-5 h-5 text-cyan-500/70 group-hover:text-cyan-400 transition-colors" />
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-[0_0_10px_rgba(255,0,0,0.5)]"
            >
              {unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ═══ Chat Panel — Bottom-Left ═══ */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 left-6 z-850 w-[420px] max-h-[500px] bg-black/98 border border-cyan-500/40 rounded-sm shadow-[0_0_60px_rgba(0,240,255,0.2)] backdrop-blur-2xl flex flex-col overflow-hidden"
          >
            {/* Header (Intense Visibility) */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-cyan-500/20 bg-cyan-950/30 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#00f0ff]" />
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-400">
                  {t('chat_panel.channel_online')}
                </span>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="p-1.5 text-white/40 hover:text-cyan-400 hover:bg-white/10 rounded-sm transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px] scrollbar-hide">
              <AnimatePresence>
                {displayMessages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/20 text-[10px] tracking-[0.5em] font-black uppercase text-center py-12"
                  >
                    {t('chat_panel.waiting')}
                  </motion.div>
                ) : (
                  displayMessages.map((msg) => <ChatBubble key={`${msg.id}-${msg.timestamp}`} msg={msg} />)
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
