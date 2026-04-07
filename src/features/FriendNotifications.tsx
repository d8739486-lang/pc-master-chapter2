import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore, type IChatMessage } from '@/core/useChatStore';
import { MessageSquare, X } from 'lucide-react';
import { useI18n } from '@/core/i18n';

/**
 * Top-right notifications for new friend messages.
 * Only shows when the main chat panel is closed.
 */
export const FriendNotifications = () => {
  const { messages, chatOpen, openChat, setActiveChat } = useChatStore();
  const { t } = useI18n();
  const [activeNotification, setActiveNotification] = useState<IChatMessage | null>(null);
  const shownMessagesRef = useRef<Set<string>>(new Set());

  const handleNotificationClick = () => {
    setActiveChat('friend');
    openChat();
    setActiveNotification(null);
  };

  useEffect(() => {
    if (messages.length === 0 || chatOpen) {
      setActiveNotification(null);
      return;
    }

    const lastMsg = messages[messages.length - 1];
    const isFriend = lastMsg.author === 'Лучший друг' || lastMsg.author === t('chat.friend_name') || lastMsg.author === 'friend';
    
    if (isFriend && !chatOpen && !shownMessagesRef.current.has(lastMsg.id)) {
      shownMessagesRef.current.add(lastMsg.id);
      setActiveNotification(lastMsg);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setActiveNotification(prev => prev?.id === lastMsg.id ? null : prev);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, chatOpen, t]);

  if (!activeNotification || chatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={activeNotification.id}
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        onClick={handleNotificationClick}
        className="fixed top-16 right-6 z-1000 w-80 bg-black/95 border border-cyan-500/40 rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.1)] backdrop-blur-2xl overflow-hidden pointer-events-auto cursor-pointer group active:scale-95 transition-all duration-500 ease-out"
      >
        {/* Animated accent line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                {t('chat.new_message') || 'NEW_MESSAGE'}
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setActiveNotification(null);
              }}
              className="text-white/20 hover:text-white transition-colors p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-white/40 uppercase">
              {activeNotification.author}
            </span>
            <p className="text-[11px] font-mono text-white/90 line-clamp-2 leading-relaxed">
              {activeNotification.text}
            </p>
          </div>
        </div>
        
        {/* Progress bar for auto-hide */}
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 5, ease: 'linear' }}
          className="h-0.5 bg-cyan-500/30"
        />
      </motion.div>
    </AnimatePresence>
  );
};
