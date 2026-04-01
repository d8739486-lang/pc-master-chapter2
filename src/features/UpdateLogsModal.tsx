import { memo } from 'react';
import { useModalStore } from '@/core/useModalStore';
import { motion } from 'framer-motion';
import { X, Calendar, Activity, Zap } from 'lucide-react';
import { useI18n } from '@/core/i18n';


export const UpdateLogsModal = memo(() => {
  const { closeModal } = useModalStore();
  const { t, language } = useI18n();

const LOGS = language === 'en' ? [
  {
    version: '0.5.2',
    date: 'logs.current_version',
    title: 'CHAPTER 2: FINALE — FULL VERSION',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added the final mini-game "AVALON DEFENSE" — 10 waves of sector defense against Digital Dreams.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented final boss DD_CORE_ARCHITECT with vulnerability windows.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added cinematic post-hack sequence: DD Security Team chat → friend panic → car escape.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented victory chat with friend and final credits "Chapter 2: Neon Root — COMPLETED".</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added new SFX: defend.mp3 (combat music), win.mp3 (victory sound), car.mp3 (escape).</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Reworked CMD terminal color scheme to dark-green/gray palette (Emerald/Zinc).</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Added language selection screen (RUS/ENG) at startup.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Fixed console stretching with large text volume — text is now clipped correctly.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Defense game loop performance optimization (requestAnimationFrame).</li>
        </ul>
    ),
    type: 'current'
  },
  {
    version: '0.5.1',
    date: '2026-03-31',
    title: 'STORY EXPANSION & POLISH',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Restructured the storyline, added interactive dialogues with ally.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented a massive chapter 2 finale with 15-second timer.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added Game Over system: system shutdown, black monitor, and hard reset.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Main menu interface completely overhauled.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Synchronized threat alarm sounds with Digital Dreams protocol activation.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Deep bug fixes: resolved blur issues, timers, and "point 0" regression bugs.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Integrated Update Logs module.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.4.7',
    date: 'BETA UPDATE',
    title: 'CINEMATICS & LORE',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Radically transformed the main menu with a new design.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Implemented a stunning cinematic pre-game cutscene (rain, lightning).</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Added "Story" button detailing Avalon's creation without major spoilers.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[*]</span> Updated background lightning generation script.</li>
        </ul>
    ),
    type: 'beta'
  },
  {
    version: '0.3.5',
    date: 'DEMO RELEASE',
    title: 'INTERFACE PRO',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Expanded lore, introduced early narrative arcs and text chats.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[*]</span> Global UI update: enhanced files viewing and work console.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Added "Settings" menu with volume controls.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[-]</span> Minor optimizations in terminal command logic.</li>
        </ul>
    ),
    type: 'demo'
  },
  {
    version: '0.1.0',
    date: 'PRE-ALPHA',
    title: 'INFRASTRUCTURE',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Added core terminal interface rendering.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Implemented command parsing engine.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[*]</span> Synchronized state modules and input handling.</li>
        </ul>
    ),
    type: 'alpha'
  },
  {
    version: '0.0.1',
    date: 'PROTOTYPE',
    title: 'CORE DEV',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Built purely as a Proof of Concept to test architectures.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Defined hacker-thriller concepts, set up Zustand state management.</li>
        </ul>
    ),
    type: 'dev'
  }
] : [
  {
    version: '0.5.2',
    date: 'logs.current_version',
    title: 'CHAPTER 2: FINALE — ПОЛНАЯ ВЕРСИЯ',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлена финальная мини-игра «AVALON DEFENSE» — 10 волн защиты секторов от атак Digital Dreams.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Реализован финальный босс DD_CORE_ARCHITECT с системой уязвимостей и окнами для нанесения урона.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлена кинематографическая пост-хак последовательность: чат DD Security Team → паника друга → побег на машине.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Реализованы победный чат с другом и финальные титры «Глава 2: Neon Root — ЗАВЕРШЕНА».</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлены новые звуковые эффекты: defend.mp3 (музыка обороны), win.mp3 (победный звук), car.mp3 (побег).</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Переработана цветовая схема терминала CMD на тёмно-зелёно-серую палитру (Emerald/Zinc).</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Добавлен экран выбора языка (RUS/ENG) при запуске игры.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Исправлено растягивание консоли при большом количестве текста — теперь текст обрезается по границе.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Оптимизация производительности игрового цикла обороны (requestAnimationFrame).</li>
        </ul>
    ),
    type: 'current'
  },
  {
    version: '0.5.1',
    date: '2026-03-31',
    title: 'STORY EXPANSION & POLISH',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Изменена и расширена общая сюжетная линия, добавлены новые интерактивные диалоги с союзником.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Реализована масштабная концовка второй главы с таймером в 15 секунд.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлена система Game Over: отключение системы, черный монитор и жесткий перезапуск.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Полностью обновлен интерфейс главного меню.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Синхронизированы звуки тревоги при активации протокола Digital Dreams.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Глубокие баг-фиксы: устранены ошибки с графическим размытием, таймерами, исправлен сброс прогресса до "точки 0".</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Интегрирован модуль истории обновлений (Update Logs).</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.4.7',
    date: 'BETA UPDATE',
    title: 'CINEMATICS & LORE',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Кардинально переработано главное меню, изменен дизайн.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Внедрена впечатляющая вступительная кат-сцена перед игрой (дождь, молнии).</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Добавлена кнопка "Сюжет" в меню, раскрывающая первоначальный смысл создания Avalon, НО без критических спойлеров.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[*]</span> Обновлена генерация анимаций молний на фоне.</li>
        </ul>
    ),
    type: 'beta'
  },
  {
    version: '0.3.5',
    date: 'DEMO RELEASE',
    title: 'INTERFACE PRO',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Расширен сюжет. Введены начальные арки и текстовые диалоги.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[*]</span> Глобальное обновление UI: улучшено отображение файлов и рабочей консоли.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Добавлено окно "Настройки" (Settings) с ползунками громкости.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[-]</span> Проведены небольшие фиксы логики терминала.</li>
        </ul>
    ),
    type: 'demo'
  },
  {
    version: '0.1.0',
    date: 'PRE-ALPHA',
    title: 'INFRASTRUCTURE',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Был добавлен базовый интерфейс для терминала.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Реализован парсинг команд внутри консоли.</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[*]</span> Налажено взаимодействие модулей и обработка ввода.</li>
        </ul>
    ),
    type: 'alpha'
  },
  {
    version: '0.0.1',
    date: 'PROTOTYPE',
    title: 'CORE DEV',
    content: (
        <ul className="list-none space-y-2 mt-2 text-white/50">
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Игра была создана исключительно для проверки конструкции (Proof of Concept).</li>
            <li><span className="text-white/40 font-bold mr-2 text-xs border border-white/20 px-1 pt-0.5 rounded-[2px] bg-white/5">[+]</span> Утверждена идея хакерского триллера. Разработан стейт-менеджмент.</li>
        </ul>
    ),
    type: 'dev'
  }
];

  return (
    <div className="p-8 md:p-14 w-full h-full flex flex-col items-center justify-center text-white/80 font-mono relative bg-black/60 overflow-hidden">
      <button onClick={closeModal} className="absolute top-8 right-8 text-white/20 hover:text-white transition-all z-30 group">
        <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="w-full max-w-5xl h-full flex flex-col overflow-hidden">
        <header className="mb-12 shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h2 className="text-3xl font-black tracking-[0.5em] text-white uppercase">
              {t('logs.header')}
            </h2>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.8em]">
            {t('logs.subheader')}
          </p>
          <div className="h-px w-full bg-linear-to-r from-emerald-500/50 via-white/10 to-transparent mt-6" />
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide pr-4 space-y-6">
          {LOGS.map((log, idx) => (
            <motion.div
              key={log.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 border-l-2 transition-all duration-500 hover:bg-white/5 relative group ${
                log.type === 'current' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-black px-3 py-1 rounded-sm tracking-wider ${
                    log.type === 'current' ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/60'
                  }`}>
                    {log.version}
                  </span>
                  <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-widest uppercase">
                    <Calendar className="w-3 h-3" />
                    {log.date.includes('logs.') ? t(log.date) : log.date}
                  </div>
                </div>
                <h3 className="text-xl font-bold tracking-[0.3em] group-hover:text-white transition-colors">
                  {log.title}
                </h3>
              </div>
              
              <div className="text-white/60 text-sm leading-relaxed max-w-3xl border-l border-white/5 pl-4 ml-1">
                {log.content}
              </div>

              {log.type === 'current' && (
                <Zap className="absolute top-4 right-4 w-5 h-5 text-emerald-500/20 group-hover:text-emerald-500/50 transition-colors" />
              )}
            </motion.div>
          ))}
        </main>

        <footer className="mt-8 shrink-0 flex items-center justify-between py-4 border-t border-white/5">
           <div className="text-[10px] text-white/20 uppercase tracking-[0.4em]">
             Authorized_Access_Only [v0.5.1]
           </div>
           <button onClick={closeModal} className="px-8 py-2 border border-white/10 hover:border-white/40 text-[10px] uppercase tracking-[0.6em] transition-all">
             {t('logs.btn_close')}
           </button>
        </footer>
      </div>
    </div>
  );
});
