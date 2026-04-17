import { useGameStore, Screen } from '@/core/store';
import { AnimatePresence, motion } from 'framer-motion';
import { StartMenu } from '@/features/StartMenu';
import { Preloader } from '@/features/Preloader';

import { StoryIntro } from '@/features/StoryIntro';
import { GameView } from '@/features/GameView';
import { FriendChat } from '@/features/FriendChat';
import { PostHackSequence } from '@/features/PostHackSequence';
import { DefenseGame } from '@/features/Defense/DefenseGame';
import { VictoryChat } from '@/features/VictoryChat';
import { EndingSequence } from '@/features/EndingSequence';
import { LanguageSelect } from '@/features/LanguageSelect';
import { ModalManager } from '@/core/ModalManager';

export default function App() {
  const { screen } = useGameStore();

  return (
    <>
      <div onContextMenu={(e) => e.preventDefault()} className="h-screen w-screen flex flex-col max-w-full overflow-hidden bg-black select-none text-white font-mono min-w-0">
        <AnimatePresence>
          {screen === Screen.LANGUAGE_SELECT && (
            <motion.div
              key="language_select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <LanguageSelect />
            </motion.div>
          )}

          {screen === Screen.PRELOADER && (
            <motion.div
              key="preloader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <Preloader />
            </motion.div>
          )}



          {screen === Screen.START && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <StartMenu />
            </motion.div>
          )}

          {screen === Screen.STORY_INTRO && (
            <motion.div
              key="story_intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <StoryIntro />
            </motion.div>
          )}

          {screen === Screen.GAME && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <GameView />
            </motion.div>
          )}

          {screen === Screen.POST_HACK_SEQUENCE && (
            <motion.div
              key="post_hack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <PostHackSequence />
            </motion.div>
          )}

          {screen === Screen.ENDING && (
            <motion.div
              key="ending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <EndingSequence />
            </motion.div>
          )}

          {screen === Screen.DEFENSE_GAME && (
            <motion.div
              key="defense"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <DefenseGame />
            </motion.div>
          )}

          {screen === Screen.VICTORY_CHAT && (
            <motion.div
              key="victory_chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <VictoryChat />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FriendChat />
      <ModalManager />
    </>
  );
}
