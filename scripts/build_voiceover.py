"""Generate the voice-over for the Nightlight story.

Each caption chunk is synthesized separately with Piper, then joined with
short pauses. Because we control the joins, we know the exact start time of
every chunk, so captions are synced without speech recognition.

Usage:  python3 -I scripts/build_voiceover.py <path-to-voice.onnx>
Writes: public/vo.wav and src/story/timeline.json
"""
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_WAV = ROOT / "public" / "vo.wav"
OUT_JSON = ROOT / "src" / "story" / "timeline.json"
TMP = ROOT / "public" / ".vo_chunks"

# Markup: *word* = accent (yellow), **word** = alert (red).
# `scene` names which visual the chunk belongs to; `pause` is extra silence after the chunk (s).
SCRIPT = [
    dict(scene="rule", text="У ночника одно **правило**.", pause=0.45),
    dict(scene="rule", text="Если после полуночи он мигнёт *три раза* —", pause=0.2),
    dict(scene="rule", text="**закрой глаза**.", pause=0.5),
    dict(scene="rule", text="И не открывай, пока не станет *светло*.", pause=0.8),
    dict(scene="blink", text="Ноль ноль ноль три. Он *мигнул*.", pause=0.3),
    dict(scene="blink", text="Раз. Два. **Три**.", pause=0.5),
    dict(scene="eyes", text="Ты *зажмурился*.", pause=0.7),
    dict(scene="sit", text="Слышишь: кто-то *сел* на край кровати.", pause=0.3),
    dict(scene="sit", text="Пружины **скрипнули**.", pause=0.7),
    dict(scene="voice", text="Голос мамы: «Открой глазки, я проверю, *спишь* ли ты».", pause=0.5),
    dict(scene="voice", text="Мама **никогда** так не говорит.", pause=0.6),
    dict(scene="eyes", text="Ты *молчишь*.", pause=0.6),
    dict(scene="fingers", text="Холодные пальцы ложатся тебе на **веки**.", pause=0.3),
    dict(scene="fingers", text="Считают: *один*… *два*…", pause=0.9),
    dict(scene="click", text="**Щёлк** — свет в коридоре.", pause=0.4),
    dict(scene="click", text="Шаги *уходят*. Дверь закрылась.", pause=0.7),
    dict(scene="open", text="Ночник горит *ровно*.", pause=0.4),
    dict(scene="open", text="Ты открываешь *глаза*.", pause=0.5),
    dict(scene="empty", text="В комнате **никого**.", pause=0.6),
    dict(scene="pillow", text="Только на подушке рядом — *вмятина*.", pause=0.4),
    dict(scene="pillow", text="**Тёплая**.", pause=1.0),
    dict(scene="morning", text="Утром мама спрашивает: «Почему ты всю ночь *не спал*?»", pause=0.4),
    dict(scene="morning", text="«Я спал», — говоришь ты.", pause=0.6),
    dict(scene="smile", text="Мама улыбается: «Я знаю. Я *сидела рядом*».", pause=0.8),
    dict(scene="blink2", text="Ночник за её спиной **мигает**. Раз. Два.", pause=1.0),
    dict(scene="end", text="Кто сидел на кровати? *Напиши* в комментариях.", pause=0.5),
    dict(scene="end", text="Часть два **скоро**.", pause=1.2),
]

SAMPLE_RATE = 22050


def plain(text: str) -> str:
    return re.sub(r"\*+", "", text)


def synth(model: str, text: str, out: Path) -> None:
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", model, "-f", str(out), "--length-scale", "1.08", "--sentence-silence", "0.25"],
        input=text.encode("utf-8"),
        check=True,
        capture_output=True,
    )


def read_wav(path: Path):
    with wave.open(str(path), "rb") as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2
        rate = w.getframerate()
        return w.readframes(w.getnframes()), rate


def main() -> None:
    model = sys.argv[1]
    TMP.mkdir(parents=True, exist_ok=True)
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)

    lead_in = 0.6
    frames = bytearray(b"\x00\x00" * int(lead_in * SAMPLE_RATE))
    timeline = []
    t = lead_in
    rate = SAMPLE_RATE
    for i, item in enumerate(SCRIPT):
        wav = TMP / f"{i:02d}.wav"
        synth(model, plain(item["text"]), wav)
        data, rate = read_wav(wav)
        dur = len(data) / 2 / rate
        timeline.append(dict(i=i, scene=item["scene"], text=item["text"], start=round(t, 3), end=round(t + dur, 3)))
        frames += data
        frames += b"\x00\x00" * int(item["pause"] * rate)
        t += dur + item["pause"]

    with wave.open(str(OUT_WAV), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(bytes(frames))

    OUT_JSON.write_text(json.dumps(dict(sampleRate=rate, duration=round(t, 3), chunks=timeline), ensure_ascii=False, indent=2))
    print(f"voice-over: {t:.1f}s, {len(timeline)} chunks → {OUT_WAV.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
