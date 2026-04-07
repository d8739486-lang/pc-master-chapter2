import { useCallback } from 'react';
import { useGameStore } from './store';

export const translations = {
  ru: {
    menu: {
      start: 'ЗАПУСТИТЬ ROOT',
      settings: 'НАСТРОЙКИ',
      logs: 'ОБНОВЛЕНИЯ',
      story: 'СЮЖЕТ',
      exit: 'ВЫХОД',
      chapter2: '- глава 2 -',
      subtitle: '- episode — REVENGE -',
      status: 'СТАТУС ПОДКЛЮЧЕНИЯ: АКТИВНО',
      copyright: 'PC MASTER: CORE_SYSTEM // 2026',
      hint: '— лучше во весь экран —',
      skip: '[ ПРОПУСТИТЬ ]',
    },
    preloader: {
      click_to_start: 'Кликните для запуска',
      auto_fullscreen: '— автоматический полный экран —',
      initializing: 'ИНИЦИАЛИЗАЦИЯ...',
      connecting: 'УСТАНОВКА P2P СОЕДИНЕНИЯ...',
      bypassing: 'ОБХОД SENTINEL_MESH...',
      loading_cinematics: 'ЗАГРУЗКА КИНЕМАТОГРАФИЧЕСКИХ МОДУЛЕЙ...',
      syncing: 'СИНХРОНИЗАЦИЯ NEON_CORE...',
      secured: 'СОЕДИНЕНИЕ УСТАНОВЛЕНО',
      uplinking: 'ЗАГРУЗКА...',
    },
    terminal: {
      welcome_line_1: '═══════════════════════════════════════════════════════════════════════════',
      welcome_line_2: 'Соединение установлено. Защищенный туннель активен.',
      welcome_line_3: '## - (друг): Мы на месте. Чтобы открыть архив, нужно вернуть 5 украденных технологий их владельцам.',
      welcome_line_4: '## - (друг): Вызови зашифрованный список контактов: [connect list]',
      prompt_path: '~',
      error_unknown: 'Ошибка: Команда не распознана. Введите [help] для списка доступных директив.',
      success_connect: 'Переход в зашифрованный канал связи...',
      archive_locked: 'ДОСТУП ЗАПРЕЩЕН: АРХИВ ЗАШИФРОВАН. ТРЕБУЕТСЯ КЛЮЧ ПОДПИСИ [ROOT].',
      location: 'Местоположение: Сектор_7_Узел_DD',
      encryption: 'Шифрование: AES-256-BIT',
      secure_stable: '[ СОЕДИНЕНИЕ СТАБИЛЬНО ]',
      tunnel: 'ЗАШИФРОВАННЫЙ ТУННЕЛЬ ~NEON-ROOT',
      history: '--- История Сессии ---',
      countdown: '[ ! ] ДО ВЫКЛЮЧЕНИЯ ОСТАЛОСЬ: {time} СЕКУНД',
      controls: 'УПРАВЛЕНИЕ: КЛИКАЙТЕ НА ПОДСВЕЧЕННЫЕ КОМАНДЫ',
    },
    story: {
      text1: "До этого у компании Digital Dreams...",
      text2: "До этого события...",
      me: "Я",
      friend: "Лучший друг",
      sec_bot: "Sec_Bot_v2",
      typing: "{name} печатает...",
      sending: "Отправление сообщения...",
      found_you: "МЫ НАШЛИ ТЕБЯ!",
      dd_devops: "DIGITAL DREAMS // DEV_OPS",
      participants: "{count} участника, {online} в сети",
      encrypted_channel: "ENCRYPTED_CHANNEL // SECURE_P2P",
      connected: "Соединение установлено",
      
      script1: [
        "Кто-нибудь залил вчерашний билд на прод?", // 0: Oleg
        "Я его еще тестирую, там критический баг с БД.", // 1: Anna
        "Ребята, у нас какой-то странный трафик на 8080 порту...", // 2: Max
        "ОБНАРУЖЕНА КРИТИЧЕСКАЯ УЯЗВИМОСТЬ В ЯДРЕ!", // 3: Bot
        "ЧТО? КТО ПРОБРАЛСЯ В НАШУ СИСТЕМУ ЗАЩИТЫ!", // 4: Max
        "Они проходят через протоколы Avalon... наш же код против нас!", // 5: Oleg
        "Они скачивают архивы! Включаю протокол изоляции, БЫСТРО!", // 6: Anna
        "ИСТОЧНИК УТЕЧКИ ОБНАРУЖЕН. СИСТЕМА ЛОКАЛИЗАЦИИ АКТИВНА.", // 7: Bot
        "Блокируй порты! Мы должны запереть его в системе!", // 8: Max
        "ЦЕЛЬ ИДЕНТИФИЦИРОВАНА. ИНИЦИАЦИЯ ЗАХВАТА... 3... 2... 1..." // 9: Bot
      ],
      script2: [
        "Здарова. Ты не поверишь, что эти ублюдки из Digital Dreams выкинули на этот раз.",
        "Опять они? Что случилось?",
        "Скинули мне якобы 'патч' для ядра Авалона. А там троян-шифровальщик последнего поколения.",
        "Старый комп сгорел к чертям, все файлы, все исходники за 3 года... всё в труху.",
        "Твою ж... Это подло даже для них. Сочувствую, бро.",
        "Собрал вот новый конфиг на последние деньги. Сижу на голом железе и ярости.",
        "Там была 4070... 32 гига... А теперь я, блин, СИЖУ НА ВСТРОЙКЕ!",
        "Так-с, и дальше что?",
        "Помоги мне их достать. Я хочу, чтобы они заплатили за каждое стертое имя файла. Мы выжжем их сервер изнутри.",
        "Стой, притормози... Ты вообще понимаешь, на что замахиваешься? Это же мегакорпорация. У них лучшие безопасники в мире.",
        "Мне, если честно, извиняюсь, НАПЛЕВАТЬ! Плевать на их безопасность, плевать на последствия! Я ДОЛЖЕН ОТОМСТИТЬ!",
        "Воу-воу, успокойся! Дыши глубже. В таком состоянии ты только дров наломаешь).",
        "Ты щас серьёюно? не до шуток! Реально мне помощь нужна, поможешь?",
        "Ладно, не буду шутить, да, помогу.",
        "Спасибо за понимание, начинаем!."
      ]
    },
    commands: {
      search_channels: 'Поиск зашифрованных каналов связи...',
      contacts_found: 'Найдено 5 контактов владельцев технологий:',
      contact_line: '  {n}. {name} ({type}) -> {cmd}',
      req_hack: 'недоступно (требует взлом {n} сектора)',
      unavailable: 'недоступно',
      connecting: 'Установка P2P соединения с {name}...',
      lumina_msg1: 'Они украли мои сетевые протоколы пять лет назад.',
      lumina_msg2: 'Чтобы пройти периметр (Сектор 1), внедрите мой обходной код.',
      lumina_utility: 'Доступна утилита: [inject lum_route.bat]',
      lumina_success: 'ПЕРИМЕТР (СЕКТОР 1) ВЗЛОМАН. БАЗОВЫЕ МАРШРУТЫ DD ДОСТУПНЫ.',
      next_contact: 'Следующий контакт: {cmd}',
      kaelen_connecting: 'Связь с Kaelen установлена.',
      kaelen_msg1: 'Я ждал этого дня. Мои ключи хранят их базы данных!',
      kaelen_msg2: 'Вот оригинальный мастер-ключ, он порушит им криптографию. Удачи.',
      kaelen_utility: 'Ключ получен. Команда: [decrypt --kaelen-key]',
      kaelen_success: 'ХРАНИЛИЩА (СЕКТОР 2) РАСШИФРОВАНЫ. ДАННЫЕ УТЕКАЮТ.',
      vortex_connecting: 'Подключение к Vortex.',
      vortex_msg1: 'Система вторжения DD основана на моем коде. Она безупречна.',
      vortex_msg2: 'Но у неё есть бэкдор, который я оставил "на всякий случай". Отключи её.',
      vortex_utility: 'Доступна команда: [disable_vortex_ids]',
      vortex_success: 'СИСТЕМЫ ПРЕДОТВРАЩЕНИЯ ВТОРЖЕНИЙ (СЕКТОР 3) ОБЕСТОЧЕНЫ.',
      cipher_connecting: 'Нейронный пинг к Cipher...',
      cipher_msg1: 'Их AI-сторож - это моя нейросеть, обученная на охоту.',
      cipher_msg2: 'Загрузи этот паттерн, он сведет её с ума и вырубит.',
      cipher_utility: 'Паттерн готов: [cipher_bypass -f]',
      cipher_success: 'AI-ОХРАННИКИ (СЕКТОР 4) НЕЙТРАЛИЗОВАНЫ.',
      aura_connecting: 'Квантовый туннель к Aura...',
      aura_msg1: 'Вы у Главных Врат. Они используют мою квантовую архитектуру подписей.',
      aura_msg2: 'Это конец для DD. Распахни врата для Авалона.',
      aura_utility: 'Квантовый триггер сгенерирован: [aura_gate --open]',
      aura_success: 'ВРАТА (СЕКТОР 5) РАСПАХНУТЫ. ДОСТУП К ГЛАВНОМУ АРХИВУ ОТКРЫТ.',
      all_paths_free: 'ВСЕ ПУТИ СВОБОДНЫ. ЗАПУСТИТЕ ПРОГРАММУ ПРОНИКНОВЕНИЯ: [start_operation]',
      sectors_count: 'Холодных секторов: {count}/5',
      error_close_all: 'ЗАКРОЙТЕ ВСЕ ОШИБКИ И ДОЖДИТЕСЬ ОТКЛИКА!',
      types: {
        routing: 'Маршрутизация',
        keys: 'Ключи шифрования',
        intrusion: 'Система вторжения',
        neural: 'Нейронный алгоритм',
        quantum: 'Квантовые мосты'
      }
    },
    chat: {
      friend_name: 'Лучший друг',
      msg1: 'Есть! Первый сектор взломан. Lumina вернула контроль над маршрутами.',
      msg2: 'Второй сектор пал! Kaelen подтвердил расшифровку их баз.',
      msg3: 'Третий периметр чист. Vortex отключил их системы вторжения.',
      msg4: 'Четвертый сектор нейтрализован. Нейросеть Cipher выжгла их ИИ-сторожей.',
      msg5: 'ПОСЛЕДНИЙ СЕКТОР НАШ! Aura открыла квантовые врата. Путь к Авалону свободен!',
    },
    post_hack: {
      dd_incidents: 'Инцидент: Взлом Ядра',
      friend_alert: 'ТРЕВОГА // МАРШРУТ СКРЫТ',
      chat_dd: [
        "обнаружена критическая уязвимость в ядре AVALON",
        "ЧТО? КТО ПРОБРАЛСЯ В НАШУ СИСТЕМУ ЗАЩИТЫ!",
        "Они скачивают архивы! Включаю протокол изоляции, БЫСТРО!",
        "ПРОТОКОЛ ИЗОЛЯЦИИ АКТИВИРОВАН. ПОИСК ИСТОЧНИКА УТЕЧКИ...",
        "Блокируй порты! Мы должны запереть его в системе!",
        "Поздно... Соединение разорвано. Он ушел с нашими исходниками.",
        "ИСТОЧНИК УСПЕШНО ОБНАРУЖЕН И ДЕАНОНИМИЗИРОВАН.",
        "КООРДИНАТЫ ПЕРЕДАНЫ ГРУППЕ ЗАХВАТА."
      ],
      chat_friend: [
        "Чёрт, чувак, ты там живой?! Они врубили полную изоляцию всех своих серверов!",
        "Они отследили тебя! DIGITAL DREAMS ТЕПЕРЬ ЗНАЮТ ГДЕ ТЫ!",
        "СРОЧНО СМАТЫВАЙ ИЗ СТРАНЫ!! БРОСАЙ ВСЁ И БЕГИ, ОНИ УЖЕ ВЫЕХАЛИ ЗА ТОБОЙ!!",
        "Я уже в машине. Еду к тебе."
      ]
    },
    defense: {
      hud_wave: 'Волна {n}/10',
      hud_score: 'Очки: {n}',
      hud_kills: 'Уничтожено: {n}',
      boss_label: 'БОСС',
      vuln_timer: 'УЯЗВИМОСТЬ: {n}s',
      click_boss: 'КЛИКАЙ ПО БОССУ!',
      sys_activating: 'Система защиты активируется...',
      wave_title: 'ВОЛНА {n}',
      active_sectors: 'Активных секторов: {n}',
      wave_cleared: 'ВОЛНА {n} ОТБИТА!',
      next_wave: 'Следующая волна через 4 секунды...',
      boss_name: 'DD_CORE_ARCHITECT',
      boss_subtitle: 'Финальный вирус Digital Dreams',
      victory_title: 'ПОБЕДА',
      victory_subtitle: 'Digital Dreams уничтожены',
      defeat_title: 'СЕКТОР УНИЧТОЖЕН',
      defeat_subtitle: 'Digital Dreams победили...',
      restart: '[ ПЕРЕЗАПУСК ]',
      subtitle_msg: '- Я запустил маленькие скрипты-захватчики на наш сервер для очистки мусора DD. Их нужно отбить назад!',
    },
    victory_chat: {
      mission_complete: 'МИССИЯ ЗАВЕРШЕНА',
      script: [
        "ТЫ ЭТО СДЕЛАЛ!! DIGITAL DREAMS ПОЛНОСТЬЮ УНИЧТОЖЕНЫ!!",
        "Их сервера разрушены, данные очищены от их грязных лап. Мы свободны!",
        "Мы сделали это вместе. Без тебя я бы не дошел.",
        "Ахах, ну ты даёшь! Серьёзно, это было безумие. Я горжусь тобой, бро.",
        "А что теперь? Они ведь не остановятся...",
        "Теперь они больше никому не навредят. Код Avalon снова принадлежит нам. А дальше... посмотрим.",
        "Но это уже история для другого дня. Отдыхай, герой. Ты это заслужил. 🫡"
      ]
    },
    ending: {
      title: 'Глава 2',
      chapter_name: 'Neon Root',
      completed: '— Завершена —',
      thanks: 'Спасибо за прохождение второй главы.',
      final_text: 'Digital Dreams повержены. Код Avalon возвращён своим создателям. Свобода отвоёвана — но история на этом не заканчивается...',
      creator: 'Давит',
      studio: 'L3n4r studio',
      duration: 'Разработка: 7 дней',
      to_be_continued: 'Это еще не конец...',
      skip: 'ПРОПУСТИТЬ >>',
    },
    lang_select: {
      title: 'CHOOSE LANGUAGE // ВЫБЕРИТЕ ЯЗЫК',
      ru: 'RUSSIAN',
      en: 'ENGLISH',
      footer: 'PC Master: Chapter 2 | Revenge Edition | Handshake'
    },
    settings: {
      title: 'НАСТРОЙКИ',
      master: 'ОБЩАЯ ГРОМКОСТЬ',
      music: 'МУЗЫКА',
      sfx: 'ЗВУКОВЫЕ ЭФФЕКТЫ',
      autosave: 'НАСТРОЙКИ СОХРАНЯЮТСЯ АВТОМАТИЧЕСКИ'
    },
    trans: {
      later: '1 час позже...',
      tbc: 'ПРОДОЛЖЕНИЕ СЛЕДУЕТ...',
      build: 'BUILD_NEXT // CHAPTER_2_ACT_2'
    },
    game_view: {
      welcome1: 'Мы на месте. Слушай, DD украли технологии у 5 гениальных разработчиков, чтобы построить этот архив. Нам нужно связаться с ними и вернуть им контроль над их кодом.',
      welcome2: 'Они помогут нам обойти защиту. Все команды и подсказки по взлому будут появляться в консоли. Начинай с поиска списка контактов.',
      lose: 'ты проиграл...',
      dd_title: 'СИСТЕМА БЕЗОПАСНОСТИ DIGITAL DREAMS',
      dd_line1: 'ОБНАРУЖЕНО НЕСАНКЦИОНИРОВАННОЕ ПРОНИКНОВЕНИЕ.',
      dd_line2: 'НЕМЕДЛЕННО ПРЕКРАТИТЕ ВАШИ ДЕЙСТВИЯ.',
      dd_line3: 'КООРДИНАТЫ ВАШЕГО ТЕРМИНАЛА УЖЕ ВЫЧИСЛЯЮТСЯ.',
      dd_blocked: 'Действие заблокировано...'
    },
    chat_panel: {
      channel_online: 'КАНАЛ СВЯЗИ: ОНЛАЙН',
      waiting: 'Ожидание сообщений...',
      hero_offline: 'ВЫ: ОФЛАЙН',
      friend_online: 'ЛУЧШИЙ_ДРУГ: ОНЛАЙН',
      closing: 'СОЕДИНЕНИЕ ЗАКРЫВАЕТСЯ...',
      friend: 'Лучший друг',
      hero: 'Я',
      encrypted_msg: 'ENCRYPTED_CHANNEL // P2P_SECURE',
      secure_conn: 'Защищённое соединение'
    },
    avalon: {
      p1_init: 'Инициализация протокола /p avalon...',
      p1_conn: 'Подключение к серверу Digital Dreams...',
      p1_warn1: '⚠ ВНИМАНИЕ: СИСТЕМА ЗАЩИТЫ АКТИВИРОВАНА',
      p1_warn2: 'Загрузка предварительно остановлена...',
      f_msg1: 'ЧТО ЭТО ЗА ОКНО?! Так, не паникуй, я пытаюсь обойти их блокировку! Дай мне пару секунд...',
      f_msg2: 'Чертов прокси-вирус! Это окно стерло всю нашу историю переписки...',
      f_msg3: 'Но я его уничтожил! Продолжай взлом, жми [continue] в терминале!',
      p1_resume: '>> ВМЕШАТЕЛЬСТВО ИЗВНЕ. ПРОЦЕССЫ СТАБИЛИЗИРОВАНЫ.',
      p1_ready: 'Готов к продолжению. Команда разблокирована: [continue]',
      p2_resume: 'Блокировка снята. Возобновление загрузки...',
      p2_archive: 'АРХИВЫ ПОЛУЧЕНЫ. СИСТЕМА ВЫХОДИТ ИЗ-ПОД КОНТРОЛЯ.',
      p2_time: 'ВРЕМЯ НА ОТКЛЮЧЕНИЕ: 15 СЕКУНД.',
      p2_run: 'БЕГИ! ЖМИ [leave_host] ЧТОБЫ ВЫЙТИ ИЗ СЕТИ!',
      f_msg4: 'Отлично! Архивы у нас! НО ОНИ ПЫТАЮТСЯ ЗАПЕРЕТЬ ТЕБЯ В СИСТЕМЕ! Теперь уметайся с сервера пока не засекли! ЖМИ НА "leave_host" БЫСТРО!!'
    },
    tasks: {
      wire_title: 'СОЕДИНЕНИЕ ЦЕПЕЙ',
      wire_subtitle: 'Соедините провода одинакового цвета',
      lever_title: 'РУЧНАЯ АКТИВАЦИЯ',
      lever_subtitle: 'Выставите код и потяните рычаг',
      sort_title: 'СОРТИРОВКА ДАННЫХ',
      sort_subtitle: 'Перетащите пакеты в нужные ячейки',
      grid_title: 'НЕЙРОСЕТЕВАЯ АУТЕНТИФИКАЦИЯ',
      grid_subtitle: 'Повторите последовательность узлов по памяти',
      signal_title: 'КВАНТОВАЯ СИНХРОНИЗАЦИЯ',
      signal_subtitle: 'Настройте частоту и амплитуду',
      pulse_title: 'ПЕРЕХВАТ ЯДРА',
      pulse_subtitle: 'Синхронизируйте пульс в целевых зонах',
      connections: 'СОЕДИНЕНО',
      sorted: 'ОТСОРТИРОВАНО',
      complete: 'ЗАДАНИЕ ВЫПОЛНЕНО',
      bypassed: 'АВТО-ОБХОД',
      target_code: 'КОД ЦЕЛИ:',
      lever_ready: 'ГОТОВ К АКТИВАЦИИ',
      lever_locked: 'КОД НЕ СОВПАДАЕТ',
    },
    logs: {
      header: 'История обновлений',
      subheader: 'История циклов разработки и ревизий системы',
      btn_close: '[ ЗАКРЫТЬ АРХИВ ]',
      current_version: 'ТЕКУЩАЯ ВЕРСИЯ',
    },
  },
  en: {
    menu: {
      start: 'START ROOT',
      settings: 'SETTINGS',
      logs: 'UPDATES',
      story: 'STORY',
      exit: 'EXIT',
      chapter2: '- chapter 2 -',
      subtitle: '- episode — REVENGE -',
      status: 'CONNECTION STATUS: ACTIVE',
      copyright: 'PC MASTER: CORE_SYSTEM // 2026',
      hint: '- fullscreen recommended -',
      skip: '[ SKIP ]',
    },
    preloader: {
      click_to_start: 'Click to Start',
      auto_fullscreen: '— automatic fullscreen —',
      initializing: 'INITIALIZING...',
      connecting: 'ESTABLISHING P2P CONNECTION...',
      bypassing: 'BYPASSING SENTINEL_MESH...',
      loading_cinematics: 'LOADING CINEMATIC MODULES...',
      syncing: 'SYNCING NEON_CORE...',
      secured: 'CONNECTION SECURED',
      uplinking: 'UPLINKING...',
    },
    terminal: {
      welcome_line_1: '═══════════════════════════════════════════════════════════════════════════',
      welcome_line_2: 'Connection established. Secure tunnel active.',
      welcome_line_3: '## - (friend): We are in. To open the archive, you need to return 5 stolen technologies.',
      welcome_line_4: '## - (friend): Call the encrypted contact list: [connect list]',
      prompt_path: '~',
      error_unknown: 'Error: Command not recognized. Type [help] for a list of valid directives.',
      success_connect: 'Switching to encrypted communication channel...',
      archive_locked: 'ACCESS DENIED: ARCHIVE ENCRYPTED. [ROOT] SIGNATURE KEY REQUIRED.',
      location: 'Location: Sector_7_Node_DD',
      encryption: 'Encryption: AES-256-BIT',
      secure_stable: '[ SECURE_CONNECTION_STABLE ]',
      tunnel: 'ENCRYPTED TUNNEL ~NEON-ROOT',
      history: '--- Session History ---',
      countdown: '[ ! ] TIME REMAINING: {time} SECONDS',
      controls: 'CONTROLS: CLICK HIGHLIGHTED COMMANDS',
    },
    story: {
      text1: "Before this, at Digital Dreams...",
      text2: "Before this event...",
      me: "Me",
      friend: "Best friend",
      sec_bot: "Sec_Bot_v2",
      typing: "{name} is typing...",
      sending: "Sending message...",
      found_you: "WE FOUND YOU!",
      dd_devops: "DIGITAL DREAMS // DEV_OPS",
      participants: "{count} participants, {online} online",
      encrypted_channel: "ENCRYPTED_CHANNEL // SECURE_P2P",
      connected: "Connection established",
      
      script1: [
        "Did anyone push yesterday's build to prod?", // 0: Oleg
        "I'm still testing it, there's a critical DB bug.", // 1: Anna
        "Guys, we have some weird traffic on port 8080...", // 2: Max
        "CRITICAL CORE VULNERABILITY DETECTED!", // 3: Bot
        "WHAT? WHO PENETRATED OUR DEFENSE SYSTEM!", // 4: Max
        "They are passing through Avalon protocols... our own code against us!", // 5: Oleg
        "They are downloading archives! Turn on isolation protocol, FAST!", // 6: Anna
        "LEAK SOURCE DETECTED. LOCALIZATION SYSTEM ACTIVE.", // 7: Bot
        "Block the ports! We must lock them in the system!", // 8: Max
        "TARGET IDENTIFIED. INITIATING CAPTURE... 3... 2... 1..." // 9: Bot
      ],
      script2: [
        "Hey. You won't believe what those bastards at Digital Dreams pulled this time.",
        "Them again? What happened?",
        "Sent me a supposed 'patch' for Avalon core. But there was a next-gen ransomware trojan inside.",
        "My old PC is fried to hell, all files, all source code for 3 years... everything is dust.",
        "Gosh... That's low even for them. My condolences, bro.",
        "I put together a new config with my last money. Sitting on bare metal and rage.",
        "There was a 4070... 32 gigs... And now I'm, damn it, SITTING ON INTEGRATED GRAPHICS!",
        "So, what next?",
        "Help me get them. I want them to pay for every deleted file name. We'll burn their server from the inside.",
        "Wait, slow down... Do you even understand what you're aiming at? It's a megacorporation. They have the best security in the world.",
        "Honestly, to be fair, I DON'T CARE! I don't care about their security, I don't care about the consequences! I MUST HAVE REVENGE!",
        "Whoa, calm down! Deep breaths. In this state, you'll only make things worse).",
        "Are you serious? It's no joke! I really need help, will you help?",
        "Okay, I won't joke, yes, I'll help.",
        "Thanks for understanding, let's start!."
      ]
    },
    commands: {
      search_channels: 'Searching for encrypted communication channels...',
      contacts_found: 'Found 5 technology owner contacts:',
      contact_line: '  {n}. {name} ({type}) -> {cmd}',
      req_hack: 'unavailable (requires hacking sector {n})',
      unavailable: 'unavailable',
      connecting: 'Establishing P2P connection with {name}...',
      lumina_msg1: 'They stole my network protocols five years ago.',
      lumina_msg2: 'To pass the perimeter (Sector 1), inject my bypass code.',
      lumina_utility: 'Utility available: [inject lum_route.bat]',
      lumina_success: 'PERIMETER (SECTOR 1) HACKED. DD BASE ROUTES ACCESSIBLE.',
      next_contact: 'Next contact: {cmd}',
      kaelen_connecting: 'Connection with Kaelen established.',
      kaelen_msg1: 'I have been waiting for this day. My keys hold their databases!',
      kaelen_msg2: 'Here is the original master key, it will break their cryptography. Good luck.',
      kaelen_utility: 'Key received. Command: [decrypt --kaelen-key]',
      kaelen_success: 'STORAGE (SECTOR 2) DECRYPTED. DATA IS LEAKING.',
      vortex_connecting: 'Connecting to Vortex.',
      vortex_msg1: "DD's intrusion system is based on my code. It is flawless.",
      vortex_msg2: 'But it has a backdoor I left "just in case". Disable it.',
      vortex_utility: 'Command available: [disable_vortex_ids]',
      vortex_success: 'INTRUSION PREVENTION SYSTEMS (SECTOR 3) POWERED DOWN.',
      cipher_connecting: 'Neural ping to Cipher...',
      cipher_msg1: 'Their AI guard is my neural network, trained to hunt.',
      cipher_msg2: 'Load this pattern, it will drive it crazy and disable surveillance.',
      cipher_utility: 'Pattern ready: [cipher_bypass -f]',
      cipher_success: 'AI GUARDS (SECTOR 4) NEUTRALIZED.',
      aura_connecting: 'Quantum tunnel to Aura...',
      aura_msg1: 'You are at the Main Gates. They use my quantum signature architecture.',
      aura_msg2: 'This is the end for DD. Open the gates for Avalon.',
      aura_utility: 'Quantum trigger generated: [aura_gate --open]',
      aura_success: 'GATES (SECTOR 5) OPENED. ACCESS TO MAIN ARCHIVE GRANTED.',
      all_paths_free: 'ALL PATHS CLEAR. LAUNCH INFILTRATION PROGRAM: [start_operation]',
      sectors_count: 'Frozen sectors: {count}/5',
      error_close_all: 'CLOSE ALL ERRORS AND WAIT FOR RESPONSE!',
      types: {
        routing: 'Networking',
        keys: 'Encryption Keys',
        intrusion: 'Intrusion System',
        neural: 'Neural Algorithm',
        quantum: 'Quantum Bridges'
      }
    },
    chat: {
      friend_name: 'Best friend',
      msg1: 'Got it! The first sector is hacked. Lumina regained control of the routes.',
      msg2: 'The second sector has fallen! Kaelen confirmed the decryption of their bases.',
      msg3: 'The third perimeter is clear. Vortex disabled their intrusion systems.',
      msg4: 'The fourth sector is neutralized. Cipher neural net burned their AI guards.',
      msg5: 'THE LAST SECTOR IS OURS! Aura opened the quantum gates. The path to Avalon is clear!',
    },
    post_hack: {
      dd_incidents: 'Incident: Core Breach',
      friend_alert: 'ALERT // ROUTE MASKED',
      chat_dd: [
        "critical vulnerability detected in AVALON core",
        "WHAT? WHO PENETRATED OUR DEFENSE SYSTEM!",
        "They are downloading archives! Turn on isolation protocol, FAST!",
        "ISOLATION PROTOCOL ACTIVATED. SEARCHING FOR LEAK SOURCE...",
        "Block the ports! We must trap him in the system!",
        "Too late... Connection dropped. He left with our sources.",
        "SOURCE SUCCESSFULLY LOCATED AND DEANONYMIZED.",
        "COORDINATES PASSED TO CAPTURE GROUP."
      ],
      chat_friend: [
        "Damn, man, you alive there?! They turned on full isolation for all their servers!",
        "They tracked you! DIGITAL DREAMS NOW KNOWS WHERE YOU ARE!",
        "LEAVE THE COUNTRY IMMEDIATELY!! DROP EVERYTHING AND RUN, THEY ALREADY LEFT FOR YOU!!",
        "I'm already in the car. Heading to you."
      ]
    },
    defense: {
      hud_wave: 'Wave {n}/10',
      hud_score: 'Score: {n}',
      hud_kills: 'Destroyed: {n}',
      boss_label: 'BOSS',
      vuln_timer: 'VULNERABILITY: {n}s',
      click_boss: 'CLICK THE BOSS!',
      sys_activating: 'Defense system activating...',
      wave_title: 'WAVE {n}',
      active_sectors: 'Active sectors: {n}',
      wave_cleared: 'WAVE {n} CLEAR!',
      next_wave: 'Next wave in 4 seconds...',
      boss_name: 'DD_CORE_ARCHITECT',
      boss_subtitle: "Digital Dreams' final virus",
      victory_title: 'VICTORY',
      victory_subtitle: 'Digital Dreams destroyed',
      defeat_title: 'SECTOR DESTROYED',
      defeat_subtitle: 'Digital Dreams won...',
      restart: '[ RESTART ]',
      subtitle_msg: '- I threw small invader scripts onto our server to clean up DD junk. You need to repel them!',
    },
    victory_chat: {
      mission_complete: 'MISSION COMPLETE',
      script: [
        "YOU DID IT!! DIGITAL DREAMS IS COMPLETELY DESTROYED!!",
        "Their servers are ruined, data cleared from their filthy hands. We are free!",
        "We did this together. I wouldn't have made it without you.",
        "Haha, you're something else! Seriously, that was insane. I'm proud of you, bro.",
        "What now? They won't just stop...",
        "They won't hurt anyone anymore. Avalon core code is back where it belongs. As for what's next... we'll see.",
        "But that's a story for another day. Get some rest, hero. You earned it. 🫡"
      ]
    },
    ending: {
      title: 'Chapter 2',
      chapter_name: 'Neon Root',
      completed: '— Completed —',
      thanks: 'Thank you for playing Chapter 2.',
      final_text: 'Digital Dreams are defeated. Avalon core code is back with its creators. Freedom is reclaimed — but the story is not over yet...',
      creator: 'Davit',
      studio: 'L3n4r studio',
      duration: 'Development: 7 Days',
      to_be_continued: 'It\'s not over yet...',
      skip: 'SKIP >>',
    },
    lang_select: {
      title: 'CHOOSE LANGUAGE',
      ru: 'RUSSIAN',
      en: 'ENGLISH',
      footer: 'PC Master: Chapter 2 | Revenge Edition | Handshake'
    },
    settings: {
      title: 'SETTINGS',
      master: 'MASTER VOLUME',
      music: 'MUSIC',
      sfx: 'SOUND EFFECTS',
      autosave: 'SETTINGS ARE SAVED AUTOMATICALLY'
    },
    trans: {
      later: '1 hour later...',
      tbc: 'TO BE CONTINUED...',
      build: 'BUILD_NEXT // CHAPTER_2_ACT_2'
    },
    game_view: {
      welcome1: 'We are in. Look, DD stole tech from 5 brilliant developers to build this archive. We need to contact them and return their code.',
      welcome2: 'They will help us bypass the protection. All hack commands and tips will show up in the console. Start by searching the contact list.',
      lose: 'you lost...',
      dd_title: 'DIGITAL DREAMS SECURITY SYSTEM',
      dd_line1: 'UNAUTHORIZED INTRUSION DETECTED.',
      dd_line2: 'CEASE YOUR ACTIONS IMMEDIATELY.',
      dd_line3: 'YOUR TERMINAL COORDINATES ARE BEING CALCULATED.',
      dd_blocked: 'Action blocked...'
    },
    chat_panel: {
      channel_online: 'COMM CHANNEL: ONLINE',
      waiting: 'Waiting for messages...',
      hero_offline: 'YOU: OFFLINE',
      friend_online: 'BEST_FRIEND: ONLINE',
      closing: 'CONNECTION CLOSING...',
      friend: 'Best friend',
      hero: 'Me',
      encrypted_msg: 'ENCRYPTED_CHANNEL // P2P_SECURE',
      secure_conn: 'Secure connection'
    },
    avalon: {
      p1_init: 'Initializing /p avalon protocol...',
      p1_conn: 'Connecting to Digital Dreams server...',
      p1_warn1: '⚠ WARNING: DEFENSE SYSTEM ACTIVATED',
      p1_warn2: 'Loading temporarily halted...',
      f_msg1: 'WHAT IS THIS POPUP?! Okay, do not panic, I am trying to bypass their blockade! Give me a few seconds...',
      f_msg2: 'Damn proxy-virus! This window wiped our entire chat history...',
      f_msg3: 'But I destroyed it! Continue the hack, hit [continue] in the terminal!',
      p1_resume: '>> EXTERNAL INTERFERENCE. PROCESSES STABILIZED.',
      p1_ready: 'Ready to proceed. Command unlocked: [continue]',
      p2_resume: 'Blockade lifted. Resuming download...',
      p2_archive: 'ARCHIVES SECURED. SYSTEM IS SPIRALING OUT OF CONTROL.',
      p2_time: 'TIME UNTIL DISCONNECT: 15 SECONDS.',
      p2_run: 'RUN! HIT [leave_host] TO DISCONNECT FROM THE GRID!',
      f_msg4: 'Great! We have the archives! BUT THEY ARE TRYING TO LOCK YOU IN THE SYSTEM! Now get out of the server before they track you! HIT "leave_host" QUICKLY!!'
    },
    tasks: {
      wire_title: 'CIRCUIT CONNECTION',
      wire_subtitle: 'Connect wires of matching colors',
      lever_title: 'MANUAL ACTIVATION',
      lever_subtitle: 'Set the code and pull the lever',
      sort_title: 'DATA SORTING',
      sort_subtitle: 'Drag packets to matching slots',
      grid_title: 'NEURAL AUTHENTICATION',
      grid_subtitle: 'Repeat the node sequence from memory',
      signal_title: 'QUANTUM SYNCHRONIZATION',
      signal_subtitle: 'Adjust frequency and amplitude',
      pulse_title: 'KERNEL OVERRIDE',
      pulse_subtitle: 'Sync the pulse inside the target zones',
      connections: 'CONNECTED',
      sorted: 'SORTED',
      complete: 'TASK COMPLETE',
      bypassed: 'AUTO-BYPASS',
      target_code: 'TARGET CODE:',
      lever_ready: 'READY TO ACTIVATE',
      lever_locked: 'CODE MISMATCH',
    },
    logs: {
      header: 'Update Logs',
      subheader: 'History of development cycles and system revisions',
      btn_close: '[ CLOSE_ARCHIVE ]',
      current_version: 'CURRENT VERSION',
    },
  },
};

export const getTranslation = (path: string, params?: Record<string, any>) => {
  const language = useGameStore.getState().language || 'ru';
  const keys = path.split('.');
  let result: any = translations[language];
  for (const key of keys) {
    if (result) result = result[key];
  }
  
  let text = result || path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, String(value));
    });
  }
  return text;
};

export const useI18n = () => {
  const language = useGameStore(state => state.language) || 'ru';
  
  const t = useCallback((path: string, params?: Record<string, any>) => {
    const keys = path.split('.');
    let result: any = translations[language as keyof typeof translations];
    for (const key of keys) {
      if (result) result = result[key];
    }
    
    let text = result || path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{${key}}`, String(value));
      });
    }
    return text;
  }, [language]);

  return { t, language };
};
