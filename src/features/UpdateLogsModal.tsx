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
    version: '0.1.8',
    date: 'logs.current_version',
    title: 'POLISH & REFINEMENT',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Reworked Terminal interface with cleaner text spacing and better readability.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added smooth integration and fixes to the Avalon hacking cinematic timeline.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented final Victory Chat sequence directly after the Defense game.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Fixed plot progression blocker related to [start_operation] command.</li>
        </ul>
    ),
    type: 'current'
  },
  {
    version: '0.1.7',
    date: '2026-04-08',
    title: 'TERMINAL MINI-GAMES',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added 5 interactive terminal mini-games during hacking.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> All story loading sequences now feature manual override challenges.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.1.6',
    date: '2026-04-06',
    title: 'ENDGAME FIXES & CREDITS',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Updated ending credits sequence and development timeline.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Fixed a critical bug making the final boss unclickable / ending impassable.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.1.5',
    date: '2026-04-04',
    title: 'MINOR FIXES & APOCALYPSE EFFECTS',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added Windows system error cascade and Matrix speedup during the apocalypse sequence.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added explosion particle effects when destroying viruses in defense mode.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented a massive central HP bar at the bottom of the HUD.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Fixed an issue where danger warning audio overlapped itself.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Fixed a bug where subtitles would not disappear during defense prep phase.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Fixed invisible hitboxes, making them clearly shown to the player.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.1.4',
    date: '2026-04-02',
    title: 'CHAPTER 2: FINALE — FULL VERSION',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added the final mini-game "AVALON DEFENSE" — 5 waves of sector defense against Digital Dreams.</li>
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
    type: 'previous'
  },
  {
    version: '0.1.3',
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
    version: '0.1.2',
    date: 'BETA UPDATE',
    title: 'CINEMATICS & LORE',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Radically transformed the main menu with a new design.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented a stunning cinematic pre-game cutscene (rain, lightning).</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added "Story" button detailing Avalon's creation without major spoilers.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Updated background lightning generation script.</li>
        </ul>
    ),
    type: 'beta'
  },
  {
    version: '0.1.1',
    date: 'DEMO RELEASE',
    title: 'INTERFACE PRO',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Expanded lore, introduced early narrative arcs and text chats.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Global UI update: enhanced files viewing and work console.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added "Settings" menu with volume controls.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Minor optimizations in terminal command logic.</li>
        </ul>
    ),
    type: 'demo'
  },
  {
    version: '0.1.0',
    date: 'PRE-ALPHA',
    title: 'INFRASTRUCTURE',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Added core terminal interface rendering.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Implemented command parsing engine.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Synchronized state modules and input handling.</li>
        </ul>
    ),
    type: 'alpha'
  },
  {
    version: '0.0.1',
    date: 'PROTOTYPE',
    title: 'CORE DEV',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Built purely as a Proof of Concept to test architectures.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Defined hacker-thriller concepts, set up Zustand state management.</li>
        </ul>
    ),
    type: 'dev'
  }
] : [
  {
    version: '0.1.8',
    date: 'logs.current_version',
    title: 'ПОЛИРОВКА И УЛУЧШЕНИЯ СЮЖЕТА',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Полностью переработано форматирование терминала для улучшенной читаемости списка контактов.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлена кинематографичная шкала времени взлома ядра Avalon (с сообщениями и таймером).</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Реализован финальный победный чат с союзником после окончания фазы обороны.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Исправлен критический баг не позволяющий продолжить сюжет после команды start_operation.</li>
        </ul>
    ),
    type: 'current'
  },
  {
    version: '0.1.7',
    date: '2026-04-08',
    title: 'ТЕРМИНАЛЬНЫЕ МИНИ-ИГРЫ',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлено 5 интерактивных мини-игр при взломе.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Все сюжетные загрузки теперь содержат испытания для ручного обхода.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.1.6',
    date: '2026-04-06',
    title: 'ENDGAME ИСПРАВЛЕНИЯ & ТИТРЫ',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Обновлены финальные титры и время разработки.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Исправлен баг из-за которого сервер не нажимался концовка была непроходима.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.1.5',
    date: '2026-04-04',
    title: 'MINOR FIXES & APOCALYPSE EFFECTS',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлен каскад системных окон Windows и ускорение Матрицы во время апокалипсиса.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлены эффекты взрыва частиц при уничтожении вирусов в защите.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Большая центральная шкала здоровья перемещена вниз экрана HUD.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Исправлена ошибка, из-за которой звук опасности многократно накладывался сам на себя.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Исправлен баг, из-за которого субтитры не исчезали перед началом волны.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Исправлены невидимые хитбоксы, теперь они ярко подсвечиваются.</li>
        </ul>
    ),
    type: 'previous'
  },
  {
    version: '0.1.4',
    date: '2026-04-02',
    title: 'CHAPTER 2: FINALE — ПОЛНАЯ ВЕРСИЯ',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлена финальная мини-игра «AVALON DEFENSE» — 5 волн защиты секторов от атак Digital Dreams.</li>
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
    type: 'previous'
  },
  {
    version: '0.1.3',
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
    version: '0.1.2',
    date: 'BETA UPDATE',
    title: 'CINEMATICS & LORE',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Кардинально переработано главное меню, изменен дизайн.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Внедрена впечатляющая вступительная кат-сцена перед игрой (дождь, молнии).</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлена кнопка "Сюжет" в меню, раскрывающая первоначальный смысл создания Avalon, НО без критических спойлеров.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Обновлена генерация анимаций молний на фоне.</li>
        </ul>
    ),
    type: 'beta'
  },
  {
    version: '0.1.1',
    date: 'DEMO RELEASE',
    title: 'INTERFACE PRO',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Расширен сюжет. Введены начальные арки и текстовые диалоги.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Глобальное обновление UI: улучшено отображение файлов и рабочей консоли.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Добавлено окно "Настройки" (Settings) с ползунками громкости.</li>
            <li><span className="text-red-400 font-bold mr-2 text-xs border border-red-400/30 px-1 pt-0.5 rounded-[2px] bg-red-500/10">[-]</span> Проведены небольшие фиксы логики терминала.</li>
        </ul>
    ),
    type: 'demo'
  },
  {
    version: '0.1.0',
    date: 'PRE-ALPHA',
    title: 'INFRASTRUCTURE',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Был добавлен базовый интерфейс для терминала.</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Реализован парсинг команд внутри консоли.</li>
            <li><span className="text-blue-400 font-bold mr-2 text-xs border border-blue-400/30 px-1 pt-0.5 rounded-[2px] bg-blue-500/10">[*]</span> Налажено взаимодействие модулей и обработка ввода.</li>
        </ul>
    ),
    type: 'alpha'
  },
  {
    version: '0.0.1',
    date: 'PROTOTYPE',
    title: 'CORE DEV',
    content: (
        <ul className="list-none space-y-2 mt-2">
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Игра была создана исключительно для проверки конструкции (Proof of Concept).</li>
            <li><span className="text-emerald-400 font-bold mr-2 text-xs border border-emerald-400/30 px-1 pt-0.5 rounded-[2px] bg-emerald-500/10">[+]</span> Утверждена идея хакерского триллера. Разработан стейт-менеджмент.</li>
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
          {LOGS.map((log, idx) => {
            const getColorScheme = (type: string) => {
              switch (type) {
                case 'current': return { border: 'border-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500 text-black', icon: 'text-emerald-500' };
                case 'previous': return { border: 'border-sky-500/40', bg: 'bg-sky-500/5', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300', icon: 'text-sky-500/30' };
                case 'beta': return { border: 'border-amber-500/40', bg: 'bg-amber-500/5', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300', icon: 'text-amber-500/30' };
                case 'demo': return { border: 'border-purple-500/40', bg: 'bg-purple-500/5', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300', icon: 'text-purple-500/30' };
                case 'alpha': return { border: 'border-orange-500/40', bg: 'bg-orange-500/5', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300', icon: 'text-orange-500/30' };
                default: return { border: 'border-white/10', bg: 'bg-white/5', text: 'text-white/60', badge: 'bg-white/10 text-white/40', icon: 'text-white/10' };
              }
            };
            const colors = getColorScheme(log.type);

            return (
              <motion.div
                key={log.version}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-6 border-l-2 transition-all duration-500 hover:bg-white/5 relative group ${colors.bg} ${colors.border}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-sm tracking-wider uppercase ${colors.badge}`}>
                      {log.version}
                    </span>
                    <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-widest uppercase">
                      <Calendar className="w-3 h-3" />
                      {log.date.includes('logs.') ? t(log.date) : log.date}
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold tracking-[0.3em] transition-colors ${colors.text} group-hover:brightness-125`}>
                    {log.title}
                  </h3>
                </div>
                
                <div className="text-white/60 text-sm leading-relaxed max-w-3xl border-l border-white/5 pl-4 ml-1">
                  {log.content}
                </div>

                <div className={`absolute top-4 right-4 w-5 h-5 opacity-20 group-hover:opacity-50 transition-colors ${colors.icon}`}>
                  <Zap className="w-full h-full" />
                </div>
              </motion.div>
            );
          })}
        </main>

        <footer className="mt-8 shrink-0 flex items-center justify-between py-4 border-t border-white/5">
           <div className="text-[10px] text-white/20 uppercase tracking-[0.4em]">
             Authorized_Access_Only [v0.1.8]
           </div>
           <button onClick={closeModal} className="px-8 py-2 border border-white/10 hover:border-white/40 text-[10px] uppercase tracking-[0.6em] transition-all">
             {t('logs.btn_close')}
           </button>
        </footer>
      </div>
    </div>
  );
});
