import { createPortal } from 'react-dom';
import { useModalStore, MODAL_TYPES } from './useModalStore';
import { SettingsPanel } from '@/features/SettingsPanel';
import { UpdateLogsModal } from '@/features/UpdateLogsModal';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODAL_MAP: Partial<Record<MODAL_TYPES, React.ComponentType<any>>> = {
  [MODAL_TYPES.NETWORK]: () => <div className="p-8 text-cyan-400 font-mono tracking-widest">NETWORK INTERFACE...</div>,
  [MODAL_TYPES.LOGS]: () => <div className="p-8 text-white/50 font-mono tracking-widest">SYSTEM LOGS...</div>,
  [MODAL_TYPES.SETTINGS]: SettingsPanel,
  [MODAL_TYPES.UPDATE_LOGS]: UpdateLogsModal,
  [MODAL_TYPES.STORY]: () => {
    const { closeModal } = useModalStore();
    return (
      <div className="p-8 md:p-14 w-full h-full flex flex-col items-center justify-center text-white/80 font-mono leading-relaxed relative bg-black/40 overflow-y-auto scrollbar-hide">
        <div className="w-full max-w-4xl">
          <button onClick={closeModal} className="absolute top-6 right-6 text-white/20 hover:text-white transition-all z-20">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-black tracking-[0.4em] text-white mb-10 border-b border-white/10 pb-4 uppercase text-center">
            Архив: Инцидент "Neon Root"
          </h2>
          
          <div className="space-y-8 text-sm md:text-base text-center">
            <p className="italic">
              <span className="text-white font-bold">Digital Dreams.</span> Когда-то это имя означало прогресс. Теперь это символ цифровой тирании. Корпорация построила свою империю на кражах, выжигая конкурентов и стирая жизни тех, кто вставал у них на пути.
            </p>

            <p>
              Главная <span className="text-red-500 font-bold">слабость DD</span> — у них нет ничего своего. Несмотря на миллиарды, они не могут создать ничего по-настоящему нового, поэтому используют устаревшее, но критически важное железо, полагаясь исключительно на украденный код и чужие инновации.
            </p>

            <p>
              Наш герой создал проект <span className="text-white font-bold uppercase tracking-widest">"AVALON"</span> — технологию, способную совершить прорыв. DD украли её, выдали за свою разработку и <span className="text-white font-bold">заблокировали</span> героя в глобальной сети, вырезав его из истории собственного творения. Фэйковый патч превратил его компьютер в груду мертвого пластика.
            </p>

            <div className="p-4 bg-white/5 border-x border-red-500/40">
              <p className="text-[11px] uppercase tracking-widest text-white/40 mb-2">Глобальная цель:</p>
              <p className="font-bold text-white uppercase tracking-wider">
                 Проникнуть в ядро сети DD, вернуть зашифрованные архивы Avalon и <span className="text-red-500">ПОЛНОСТЬЮ УНИЧТОЖИТЬ</span> инфраструктуру корпорации, очистив мир от их тирании.
              </p>
            </div>

            <p>
              Собрана новая станция. Мосты наведены. Мы не просто идем за данными — мы идем, чтобы <span className="text-white font-bold uppercase tracking-widest">выжечь Digital Dreams</span> до основания.
            </p>
          </div>

          <div className="mt-12 pt-6 border-t border-white/5 text-center">
              <button onClick={closeModal} className="px-10 py-3 border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all text-xs uppercase tracking-[0.6em]">
                [ ЗАПУСТИТЬ ОПЕРАЦИЮ ]
              </button>
          </div>
        </div>
      </div>
    );
  },
};

export const ModalManager = () => {
  const { modals, closeModal } = useModalStore();

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {modals.map((modal, index) => {
        const Component = MODAL_MAP[modal.id];
        if (!Component) return null;

        // Settings gets a lighter overlay, other modals stay fullscreen
        const isSettings = modal.id === MODAL_TYPES.SETTINGS;

        return (
          <div
            key={modal.id}
            style={{ zIndex: 1000 + index * 10 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 pointer-events-auto ${isSettings ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/80 backdrop-blur-md'}`}
              onClick={closeModal}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`relative flex flex-col pointer-events-auto min-w-0 overflow-hidden ${isSettings ? 'w-auto h-auto' : 'w-full h-full'}`}
            >
              {/* Scanline overlay effect (skip for settings) */}
              {!isSettings && (
                <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
                  }}
                />
              )}
              <Component {...(modal.props || {})} />
            </motion.div>
          </div>
        );
      })}
    </AnimatePresence>,
    document.body
  );
};
