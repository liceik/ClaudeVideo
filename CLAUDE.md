# ClaudeVideo

Видео из кода. Два движка: **Remotion** (React → MP4, основной) и **HyperFrames** (HTML + GSAP → MP4).
Основной продукт — вертикальные анимированные хоррор-шортсы серии «Ночник» (`Nightlight`, `Nightlight2`).

## Главное правило: экономить токены, не теряя качества

Самые дорогие операции по убыванию: рисование новых SVG-ассетов → код новых сцен → просмотр
стоп-кадров → разбор озвучки. Поэтому:

1. **Переиспользуй `src/story/art.tsx`.** Там уже есть: `Room` (night / morning / evening), `Window`, `Door`,
   `Bed` (kidUp, eyesOpen, dent, tilt), `Nightlight`, `Visitor`, `Mum`, `DoorwayMum`, `KidFace`, `Eyes`,
   `Fingers`, `SideFingers`, `Phone`, `Ripples`. Новый персонаж/предмет — только если его нет. Добавляй в тот же файл.
2. **Сцена = `case` в switch.** Смотри `src/story/Story2.tsx`: каждая сцена — пара десятков строк, использует
   `Svg zoom/cx/cy` для кадрирования готовой комнаты. Не пиши сцену с нуля — копируй ближайшую.
3. **Стоп-кадры — одним контакт-листом.** Рендери `remotion still` только для НОВЫХ сцен, склеивай в один
   лист `ffmpeg tile` в ширину ≤ 2000 px, смотри один раз. Не проверяй кадрами то, что уже работало.
4. **Субтитры не размечай руками.** `scripts/align_by_pauses.py` делает это по паузам (см. ниже).
5. Не читай большие файлы скилов целиком; активные скилы и так короткие.

## Пайплайн серии (проверен на частях 1–2)

1. **Сценарий** → `scripts/scriptN.txt`: одна реплика на строку, после каждой `<break time="0.5–0.9s" />`.
   Реплика = один субтитр (≤ ~45 символов, иначе кегль падает). Структура жанра: правило → нарушение →
   развязка → вопрос зрителям → «Часть N+1».
2. **Голос** → ElevenLabs, voice `e5A3tSm7sjA7Sbiz2Qac` («Maksim - Deep Calm»), модель `eleven_v4`.
   Через MCP-коннектор `creative_generate_speech` (2 дубля по умолчанию, ~970 кредитов каждый на 85 с) или через
   скил `text-to-speech` при наличии API-ключа. Файл качать с `elevenlabsusercontent.com` (хост разрешён в
   окружении **ClaudeVideo**). Сохранять в `public/voN.mp3` → `ffmpeg -ac 1 -ar 44100 public/voN.wav`.
3. **Таймлайн** → `python3 -I scripts/align_by_pauses.py scripts/scriptN.txt public/voN.wav src/story/timelineN.json --scenes a,b,c,...`
   (по одному id сцены на строку). Скрипт печатает старт каждой реплики — пробеги глазами, что длинные реплики
   получили длинные отрезки. Потом добавь в JSON разметку `*accent*` / `**alert**` в `text` и `marks`
   (моменты для бликов ночника = старты реплик «Раз/Два/Три»).
4. **Сцены** → `src/story/StoryN.tsx` по образцу Story2. Зарегистрировать в `src/Root.tsx`.
5. **Звук** → `public/ambient*.wav` (ffmpeg: sine 48 Hz + brown noise, lowpass 180), `creak/click/thud.wav`.
   Для новых эффектов — скил `sound-effects` (ElevenLabs) вместо синусоид.
6. **Рендер** → `npx remotion render NightlightN out/NightlightN.mp4 --concurrency=4`
   (в облачной сессии добавить `--browser-executable=/opt/pw-browsers/chromium`). Отправить mp4 пользователю.
7. Аудио (`public/*.wav|mp3`, `out/`) в git не идёт.

## Стиль «Ночника»

1080×1920, 30 fps, 65–90 с. Плоские SVG-персонажи без обводок, палитра в `pal` (`art.tsx`). Субтитры: Inter Display
800, uppercase, ключевое слово жёлтым (`*…*`) или красным (`**…**`), поп-ин spring. Бумажные плашки `Tag` для
времени/места, комикс-SFX `Sfx` («СКРИП», «ЩЁЛК»). Каждая смена сцены — 4-кадровый провал в чёрный.
Анимация по скилам `animate` / `choreograph`: ease-out на входах, неравномерный stagger, выходы короче входов.

## Скилы

Активные (`.claude/skills/`): remotion-* (best-practices, markup, captions, render, studio, docs, create),
ElevenLabs text-to-speech / sound-effects / speech-to-text / music, Эмиль: animate / choreograph /
animation-vocabulary / emil-design-eng, frontend-design.
Отключённые лежат в `.claude/skills-disabled/` (UI/лендинги/Swift/агенты и т.п.) — вернуть можно `mv`.
Не ставь новые скилы «про запас»: описание каждого грузится в контекст на каждом ходу.

## Окружение

Облачное окружение **ClaudeVideo** разрешает хост `elevenlabsusercontent.com`. Шрифты Inter Display и JetBrains Mono
есть в системе. Piper TTS (голос Irina, `scripts/build_voiceover.py`) — запасной вариант без ElevenLabs.
