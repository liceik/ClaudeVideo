"""Align caption lines to a finished voice-over by the pauses between them.

Input : a script file (one caption line per non-empty line, `<break>` tags
        and *markup* allowed) and the voice-over WAV/MP3.
Output: a timeline JSON for the Remotion story components.

How: ffmpeg silencedetect lists every pause >= 0.1 s. The expected position
of each line boundary is estimated from word counts, then matched
monotonically (dynamic programming) to the nearest real pauses. Boundaries
with no pause nearby fall back to the word-count estimate.

Usage: python3 -I scripts/align_by_pauses.py scripts/script2.txt public/vo2.wav \
           src/story/timeline2.json --scenes recap,recap,day,...  [--marks "Раз,Два,Три"]
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path



def plain(line: str) -> str:
    line = re.sub(r"<break[^>]*>", "", line)
    return re.sub(r"\*+", "", line).strip()


VOWELS = set("аеёиоуыэюяaeiouy")


def syllables(text: str) -> int:
    return max(1, sum(1 for ch in text.lower() if ch in VOWELS))


def silences(audio: str, first_line_syllables: int, min_dur: float = 0.1, noise: str = "-38dB"):
    out = subprocess.run(
        ["ffmpeg", "-i", audio, "-af", f"silencedetect=n={noise}:d={min_dur}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio],
        capture_output=True, text=True,
    ).stdout.strip())
    pairs = list(zip(starts, ends))
    # Leading silence is often broken up by faint noise; find where speech really starts
    # with a finer pass and take the first non-silent moment.
    fine = subprocess.run(
        ["ffmpeg", "-i", audio, "-af", f"silencedetect=n={noise}:d=0.05", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    fs = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", fine)]
    fe = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", fine)]
    # The first line cannot have finished before ~60% of its expected length, so a pause
    # that starts earlier than that is room noise / breath before the first word.
    rate_guess = 0.21
    lead = 0.1
    limit = min(1.2, first_line_syllables * rate_guess * 0.6)
    for st, en in zip(fs, fe):
        if st < limit:
            lead = en
        else:
            break
    return pairs, lead, dur


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("audio"); ap.add_argument("out")
    ap.add_argument("--scenes", default="", help="comma-separated scene id per line")
    ap.add_argument("--audio-name", default=None, help="file name to reference from Remotion (public/)")
    a = ap.parse_args()

    lines = [l for l in Path(a.script).read_text(encoding="utf-8").splitlines() if l.strip()]
    texts = [re.sub(r"\s*<break[^>]*>", "", l).strip() for l in lines]
    words = [syllables(plain(l)) for l in lines]  # syllables, not words: Russian word length varies a lot
    pairs, lead, total = silences(a.audio, syllables(plain(lines[0])))
    n = len(lines)
    pauses = [(s_, e_) for s_, e_ in pairs if e_ - s_ >= 0.1]
    speech_total = total - lead - sum(e_ - s_ for s_, e_ in pauses)
    rate = speech_total / max(1, sum(words))  # seconds of speech per word, measured on this recording

    def speech_between(t0: float, t1: float) -> float:
        inside = sum(max(0.0, min(e_, t1) - max(s_, t0)) for s_, e_ in pauses)
        return (t1 - t0) - inside

    # Candidate starts for line k>=1: the end of any pause. Line 0 starts at `lead`.
    cands = [lead] + [e_ for s_, e_ in pauses]
    cand_pause = [1.0] + [e_ - s_ for s_, e_ in pauses]
    short_penalty = [0.0 if d >= 0.33 else 0.8 for d in cand_pause]
    # DP over (line k, candidate j): cost = how far the speech duration of line k-1
    # (between candidate i and j) is from words[k-1] * rate, in relative terms, weighted by words.
    INF = float("inf")
    K = n
    cost = [[INF] * len(cands) for _ in range(K)]
    back = [[-1] * len(cands) for _ in range(K)]
    cost[0][0] = 0.0
    for k in range(1, K):
        expect = max(0.25, words[k - 1] * rate)
        for j in range(1, len(cands)):
            best, arg = INF, -1
            for i in range(j):
                if cost[k - 1][i] == INF:
                    continue
                sp = speech_between(cands[i], cands[j])
                if sp <= 0:
                    continue
                c = cost[k - 1][i] + ((sp / expect) - 1.0) ** 2 * max(1, words[k - 1]) / 4 + short_penalty[j]
                if c < best:
                    best, arg = c, i
            cost[k][j] = best
            back[k][j] = arg
    # last line must also fit its words against the end of the file
    bestj, bestc = -1, INF
    for j in range(len(cands)):
        if cost[K - 1][j] == INF:
            continue
        sp = speech_between(cands[j], total)
        c = cost[K - 1][j] + ((sp / max(0.25, words[-1] * rate)) - 1.0) ** 2 * max(1, words[-1]) / 4
        if c < bestc:
            bestc, bestj = c, j
    starts = [0.0] * K
    j = bestj
    for k in range(K - 1, -1, -1):
        starts[k] = cands[j]
        j = back[k][j] if k > 0 else j
    # expected (for the report only): how many boundaries sit on a real pause — all of them by construction
    scenes = a.scenes.split(",") if a.scenes else ["scene"] * n
    if len(scenes) != n:
        sys.exit(f"--scenes has {len(scenes)} entries, script has {n} lines")
    chunks = []
    for i in range(n):
        end = starts[i + 1] - 0.2 if i + 1 < n else total - 0.2
        chunks.append(dict(i=i, scene=scenes[i], text=texts[i], start=round(starts[i], 2), end=round(end, 2)))
    data = dict(audio=a.audio_name or Path(a.audio).name, duration=round(total, 2), chunks=chunks,
                marks=dict(blinks=[], blinks2=[], count=[]))
    Path(a.out).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{n} lines aligned to pauses, {rate:.3f}s/syllable, duration {total:.1f}s → {a.out}")
    for c in chunks:
        print(f"{c['start']:7.2f}  {plain(c['text'])[:60]}")


if __name__ == "__main__":
    main()
