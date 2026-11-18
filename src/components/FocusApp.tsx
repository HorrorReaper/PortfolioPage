"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FOCUS_LINES, FOCUS_PHOTOS, FOCUS_THEMES, type FocusTheme } from "@/lib/focus";
import { NEW_TAB_LABEL } from "@/lib/site";

/**
 * Fokus-Timer im Stil von Momentum: Dauer und bis zu drei Tasks waehlen, dann Vollbild mit Foto und Countdown.
 * Zwei Modi: ein durchgehender Block oder Pomodoro (Fokusphasen mit kurzen Pausen, lange Pause nach jeder 4. Runde).
 * Alles bleibt im Browser. Die Session liegt in localStorage (Fortsetzen nach Reload), ein eigenes Foto
 * nur als Object-URL im Speicher und ist nach dem Schliessen des Tabs weg.
 */

type Scene = FocusTheme | "custom";
type Task = { text: string; done: boolean };
type Pomodoro = {
  rounds: number;
  /** Aktuelle Runde, beginnt bei 1. */
  round: number;
  /** Abgeschlossene Fokusphasen. */
  completed: number;
  phase: "focus" | "break";
  focusMs: number;
  breakMs: number;
  longBreakMs: number;
};
type Session = {
  tasks: Task[];
  scene: Scene;
  photo: number;
  line: number;
  totalMs: number;
  /** Zeitpunkt, an dem der Timer endet. null, solange pausiert. */
  endsAt: number | null;
  /** Restzeit in ms, waehrend pausiert. */
  pausedLeft: number;
  status: "running" | "paused" | "done";
  /** Summe der Fokuszeit aus abgeschlossenen Phasen (Pausen zaehlen nicht). */
  focusedMs: number;
  /** Nur im Pomodoro-Modus gesetzt. totalMs/endsAt beziehen sich dann auf die aktuelle Phase. */
  pomodoro?: Pomodoro;
};

const STORAGE_KEY = "pe-focus-session";
const PRESETS = [25, 50, 90];
const MIN_MINUTES = 5;
const MAX_MINUTES = 240;
const RHYTHMS = [
  { id: "25", focus: 25, rest: 5 },
  { id: "50", focus: 50, rest: 10 },
] as const;
const LONG_BREAK_EVERY = 4;
const MAX_POMODOROS = 8;
const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;

const save = (s: Session | null) => {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Speicher nicht verfuegbar: die Session laeuft trotzdem, nur ohne Fortsetzen. */
  }
};

const load = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    return Array.isArray(s.tasks) && typeof s.totalMs === "number" ? s : null;
  } catch {
    return null;
  }
};

const leftOf = (s: Session, now: number) =>
  s.status === "running" && s.endsAt ? Math.max(0, s.endsAt - now) : s.status === "paused" ? s.pausedLeft : 0;

const clock = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
};

const isBreak = (s: Session) => s.pomodoro?.phase === "break";

/** Pausenlaenge nach Runde n: lang nach jeder 4. Runde. */
const breakAfter = (p: Pomodoro, round: number) => (round % LONG_BREAK_EVERY === 0 ? p.longBreakMs : p.breakMs);

/**
 * Zieht abgelaufene Phasen nach: im Pomodoro-Modus Fokus -> Pause -> Fokus, sonst Ende der Session.
 * Laeuft in einer Schleife, damit auch ein Reload nach langer Abwesenheit den richtigen Stand trifft.
 */
function settle(s: Session, now: number): { next: Session; phases: number } {
  let next = s;
  let phases = 0;
  while (next.status === "running" && next.endsAt !== null && next.endsAt <= now) {
    phases++;
    const p = next.pomodoro;
    const endedAt: number = next.endsAt;
    if (!p) {
      next = { ...next, status: "done", endsAt: null, pausedLeft: 0, focusedMs: next.focusedMs + next.totalMs };
      break;
    }
    if (p.phase === "focus") {
      const focusedMs = next.focusedMs + next.totalMs;
      const completed = p.completed + 1;
      if (p.round >= p.rounds) {
        next = { ...next, status: "done", endsAt: null, pausedLeft: 0, focusedMs, pomodoro: { ...p, completed } };
        break;
      }
      const len = breakAfter(p, p.round);
      next = { ...next, focusedMs, totalMs: len, endsAt: endedAt + len, pomodoro: { ...p, completed, phase: "break" } };
    } else {
      next = {
        ...next,
        totalMs: p.focusMs,
        endsAt: endedAt + p.focusMs,
        pomodoro: { ...p, phase: "focus", round: p.round + 1 },
      };
    }
  }
  return { next, phases };
}

const minutesLabel = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
};

const themeOf = (scene: Scene): FocusTheme => (scene === "custom" ? "nature" : scene);
const randomIndex = (n: number) => Math.floor(Math.random() * n);

/** Zwei leise Sinustoene ueber WebAudio, kein Audiofile noetig. */
function chime(ctx: AudioContext | null) {
  if (!ctx) return;
  void ctx.resume();
  const now = ctx.currentTime;
  [660, 880, 990].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.32;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  });
}

export function FocusApp() {
  // Setup
  const [preset, setPreset] = useState<number | "custom">(90);
  const [customMinutes, setCustomMinutes] = useState("60");
  const [mode, setMode] = useState<"block" | "pomodoro">("block");
  const [rhythm, setRhythm] = useState<"25" | "50" | "custom">("25");
  const [pomoFocus, setPomoFocus] = useState("30");
  const [pomoRest, setPomoRest] = useState("5");
  const [pomodoros, setPomodoros] = useState(4);
  const [taskInputs, setTaskInputs] = useState(["", "", ""]);
  const [scene, setScene] = useState<Scene>("nature");
  const [error, setError] = useState("");

  // Session
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const baseTitle = useRef("");
  const blinkRef = useRef<number | null>(null);
  /** Gewuenschter Tab-Titel, solange eine Session aktiv ist (Next setzt den Titel sonst zurueck). */
  const wantTitle = useRef<string | null>(null);

  const setTitle = useCallback((t: string | null) => {
    wantTitle.current = t;
    document.title = t ?? baseTitle.current;
  }, []);

  useEffect(() => {
    const keep = new MutationObserver(() => {
      if (wantTitle.current && document.title !== wantTitle.current) document.title = wantTitle.current;
    });
    keep.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => keep.disconnect();
  }, []);

  const update = useCallback((next: Session | null) => {
    setSession(next);
    save(next);
  }, []);

  // Laufende Session nach Reload fortsetzen
  useEffect(() => {
    baseTitle.current = document.title;
    const stored = load();
    if (!stored) return;
    const { next, phases } = settle(stored, Date.now());
    if (phases > 0) update(next);
    else setSession(stored);
  }, [update]);

  // Object-URL des eigenen Fotos freigeben
  useEffect(() => {
    return () => {
      if (customUrl) URL.revokeObjectURL(customUrl);
    };
  }, [customUrl]);

  const stopBlink = useCallback(() => {
    if (blinkRef.current) window.clearInterval(blinkRef.current);
    blinkRef.current = null;
  }, []);

  /** Ende der ganzen Session: Ton und blinkender Tab-Titel. */
  const signalDone = useCallback(() => {
    chime(audioRef.current);
    stopBlink();
    let on = false;
    blinkRef.current = window.setInterval(() => {
      on = !on;
      setTitle(on ? "Time's up! | Focus" : "Locked in. | Focus");
    }, 1000);
  }, [stopBlink, setTitle]);

  // Takt: Restzeit aus endsAt berechnen, damit Hintergrund-Tabs nicht driften
  useEffect(() => {
    if (session?.status !== "running") return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      const { next, phases } = settle(session, t);
      if (phases === 0) return;
      update(next);
      // Phasenwechsel im Pomodoro: nur der Ton. Ende der Session: Ton plus blinkender Titel.
      if (next.status === "done") signalDone();
      else chime(audioRef.current);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [session, update, signalDone]);

  // Tab-Titel mit Restzeit
  const left = session ? leftOf(session, now) : 0;
  useEffect(() => {
    if (!session) {
      stopBlink();
      setTitle(null);
      return;
    }
    const pomo = session.pomodoro;
    const label = !pomo ? "" : isBreak(session) ? "Break " : `${pomo.round}/${pomo.rounds} `;
    if (session.status === "running") setTitle(`${label}${clock(left)} | Focus`);
    if (session.status === "paused") setTitle(`Paused ${label}${clock(left)} | Focus`);
    if (session.status === "done" && !blinkRef.current) setTitle("Locked in. | Focus");
  }, [session, left, stopBlink, setTitle]);

  // Blinken stoppen, sobald der Tab wieder sichtbar ist und bedient wird
  useEffect(() => {
    const stop = () => {
      if (!blinkRef.current) return;
      stopBlink();
      setTitle("Locked in. | Focus");
    };
    window.addEventListener("pointerdown", stop);
    window.addEventListener("keydown", stop);
    return () => {
      window.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
      stopBlink();
    };
  }, [stopBlink, setTitle]);

  // Seite hinter dem Overlay nicht scrollen lassen, Fokus ins Overlay setzen
  const active = session !== null;
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.classList.add("focus-lock");
    // Alles hinter dem Overlay fuer Tastatur und Screenreader sperren
    const behind = [...document.body.children].filter((el) => !el.classList.contains("focus-screen"));
    behind.forEach((el) => el.setAttribute("inert", ""));
    overlayRef.current?.focus();
    return () => {
      html.classList.remove("focus-lock");
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [active]);

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePause = useCallback(() => {
    if (!session || session.status === "done") return;
    const t = Date.now();
    if (session.status === "running") {
      update({ ...session, status: "paused", pausedLeft: leftOf(session, t), endsAt: null });
    } else {
      setNow(t);
      update({ ...session, status: "running", endsAt: t + session.pausedLeft, pausedLeft: 0 });
    }
  }, [session, update]);

  // Leertaste pausiert, ausser in Formularfeldern und auf Buttons
  useEffect(() => {
    if (!session || session.status === "done") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.code !== "Space" || el.closest("button, a, input, textarea")) return;
      e.preventDefault();
      togglePause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, togglePause]);

  /** Fokus- und Pausenlaenge in Minuten fuer den Pomodoro-Modus, null bei ungueltiger Eingabe. */
  const rhythmMinutes = () => {
    if (rhythm !== "custom") {
      const r = RHYTHMS.find((x) => x.id === rhythm)!;
      return { focus: r.focus, rest: r.rest };
    }
    const focus = Number(pomoFocus);
    const rest = Number(pomoRest);
    if (!Number.isFinite(focus) || focus < 5 || focus > 120 || !Number.isFinite(rest) || rest < 1 || rest > 30) {
      return null;
    }
    return { focus, rest };
  };

  const pomodoroSummary = () => {
    const r = rhythmMinutes();
    if (!r) return "Focus 5 to 120 minutes, breaks 1 to 30 minutes.";
    let total = pomodoros * r.focus;
    for (let i = 1; i < pomodoros; i++) total += i % LONG_BREAK_EVERY === 0 ? r.rest * 3 : r.rest;
    const long = pomodoros > LONG_BREAK_EVERY ? `, a ${r.rest * 3} min break after every 4th` : "";
    return `${pomodoros} × ${r.focus} min focus, ${r.rest} min breaks${long}. About ${minutesLabel(total)} in total.`;
  };

  const start = (e: FormEvent) => {
    e.preventDefault();
    const tasks = taskInputs.map((t) => t.trim()).filter(Boolean);
    const minutes = preset === "custom" ? Number(customMinutes) : preset;
    const rest = rhythmMinutes();
    if (tasks.length === 0) {
      setError("Add at least one task. What's the one thing this block is for?");
      return;
    }
    if (mode === "block" && (!Number.isFinite(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES)) {
      setError(`Pick a duration between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.`);
      return;
    }
    if (mode === "pomodoro" && !rest) {
      setError("Pick a focus length between 5 and 120 minutes and a break between 1 and 30 minutes.");
      return;
    }
    if (scene === "custom" && !customUrl) {
      setError("Choose your photo first, or pick one of the three themes.");
      return;
    }
    setError("");
    try {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume();
    } catch {
      audioRef.current = null;
    }
    const pomodoro: Pomodoro | undefined =
      mode === "pomodoro" && rest
        ? {
            rounds: pomodoros,
            round: 1,
            completed: 0,
            phase: "focus",
            focusMs: rest.focus * 60_000,
            breakMs: rest.rest * 60_000,
            longBreakMs: rest.rest * 3 * 60_000,
          }
        : undefined;
    const totalMs = pomodoro ? pomodoro.focusMs : Math.round(minutes * 60_000);
    setNow(Date.now());
    update({
      pomodoro,
      tasks: tasks.map((text) => ({ text, done: false })),
      scene,
      photo: randomIndex(FOCUS_PHOTOS[themeOf(scene)].length),
      line: randomIndex(FOCUS_LINES.length),
      totalMs,
      endsAt: Date.now() + totalMs,
      pausedLeft: 0,
      status: "running",
      focusedMs: 0,
    });
  };

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Try a JPG, PNG or WebP.");
      return;
    }
    setError("");
    setCustomUrl(URL.createObjectURL(file));
    setScene("custom");
    if (session && session.scene !== "custom") update({ ...session, scene: "custom" });
  };

  const addFive = () => {
    if (!session || session.status === "done") return;
    const extra = 5 * 60_000;
    update({
      ...session,
      totalMs: session.totalMs + extra,
      endsAt: session.endsAt ? session.endsAt + extra : null,
      pausedLeft: session.status === "paused" ? session.pausedLeft + extra : 0,
    });
  };

  const nextPhoto = () => {
    if (!session) return;
    if (session.scene === "custom") return;
    const list = FOCUS_PHOTOS[session.scene];
    update({ ...session, photo: (session.photo + 1) % list.length, line: (session.line + 1) % FOCUS_LINES.length });
  };

  const toggleTask = (i: number) => {
    if (!session) return;
    update({ ...session, tasks: session.tasks.map((t, j) => (j === i ? { ...t, done: !t.done } : t)) });
  };

  const skipBreak = () => {
    if (!session || !isBreak(session)) return;
    const t = Date.now();
    setNow(t);
    update(settle({ ...session, status: "running", endsAt: t, pausedLeft: 0 }, t).next);
  };

  const endEarly = () => {
    if (!session) return;
    const elapsed = isBreak(session) ? 0 : session.totalMs - leftOf(session, Date.now());
    update({ ...session, status: "done", endsAt: null, pausedLeft: 0, focusedMs: session.focusedMs + elapsed });
  };

  const exit = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    update(null);
  };

  const startAnother = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    setTaskInputs(["", "", ""]);
    update(null);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void overlayRef.current?.requestFullscreen?.().catch(() => undefined);
  };

  return (
    <>
      <form className="focus-setup cut" onSubmit={start} noValidate>
        <fieldset className="focus-step">
          <legend className="focus-step__title">
            <span className="kicker">Step 1</span> How long?
          </legend>
          <div className="focus-chips focus-modes" role="radiogroup" aria-label="Timer mode">
            <label className={`focus-chip${mode === "block" ? " is-on" : ""}`}>
              <input type="radio" name="mode" checked={mode === "block"} onChange={() => setMode("block")} />
              One block
            </label>
            <label className={`focus-chip${mode === "pomodoro" ? " is-on" : ""}`}>
              <input type="radio" name="mode" checked={mode === "pomodoro"} onChange={() => setMode("pomodoro")} />
              Pomodoro
            </label>
          </div>
          {mode === "pomodoro" ? (
            <>
              <div className="focus-chips" role="radiogroup" aria-label="Focus and break length">
                {RHYTHMS.map((r) => (
                  <label key={r.id} className={`focus-chip${rhythm === r.id ? " is-on" : ""}`}>
                    <input type="radio" name="rhythm" checked={rhythm === r.id} onChange={() => setRhythm(r.id)} />
                    {r.focus} / {r.rest}
                  </label>
                ))}
                <label className={`focus-chip${rhythm === "custom" ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="rhythm"
                    checked={rhythm === "custom"}
                    onChange={() => setRhythm("custom")}
                  />
                  Custom
                </label>
              </div>
              {rhythm === "custom" && (
                <div className="focus-custom-row">
                  <div className="field focus-custom">
                    <label htmlFor="focus-pomo-focus">Focus minutes (5 to 120)</label>
                    <input
                      id="focus-pomo-focus"
                      type="number"
                      inputMode="numeric"
                      min={5}
                      max={120}
                      value={pomoFocus}
                      onChange={(e) => setPomoFocus(e.target.value)}
                    />
                  </div>
                  <div className="field focus-custom">
                    <label htmlFor="focus-pomo-rest">Break minutes (1 to 30)</label>
                    <input
                      id="focus-pomo-rest"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={30}
                      value={pomoRest}
                      onChange={(e) => setPomoRest(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="focus-stepper" role="group" aria-labelledby="focus-pomo-count-label">
                <span id="focus-pomo-count-label" className="focus-stepper__label">
                  Pomodoros
                </span>
                <button
                  type="button"
                  className="focus-stepper__btn"
                  onClick={() => setPomodoros((n) => Math.max(1, n - 1))}
                  disabled={pomodoros <= 1}
                  aria-label="One pomodoro less"
                >
                  −
                </button>
                <output className="focus-stepper__value" aria-live="polite">
                  {pomodoros}
                </output>
                <button
                  type="button"
                  className="focus-stepper__btn"
                  onClick={() => setPomodoros((n) => Math.min(MAX_POMODOROS, n + 1))}
                  disabled={pomodoros >= MAX_POMODOROS}
                  aria-label="One pomodoro more"
                >
                  +
                </button>
              </div>
              <p className="field__help">{pomodoroSummary()}</p>
            </>
          ) : (
            <>
              <div className="focus-chips" role="radiogroup" aria-label="Duration">
                {PRESETS.map((m) => (
                  <label key={m} className={`focus-chip${preset === m ? " is-on" : ""}`}>
                    <input type="radio" name="duration" checked={preset === m} onChange={() => setPreset(m)} />
                    {m} min
                  </label>
                ))}
                <label className={`focus-chip${preset === "custom" ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="duration"
                    checked={preset === "custom"}
                    onChange={() => setPreset("custom")}
                  />
                  Custom
                </label>
              </div>
              {preset === "custom" && (
                <div className="field focus-custom">
                  <label htmlFor="focus-minutes">
                    Minutes ({MIN_MINUTES} to {MAX_MINUTES})
                  </label>
                  <input
                    id="focus-minutes"
                    type="number"
                    inputMode="numeric"
                    min={MIN_MINUTES}
                    max={MAX_MINUTES}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                  />
                </div>
              )}
            </>
          )}
        </fieldset>

        <fieldset className="focus-step">
          <legend className="focus-step__title">
            <span className="kicker">Step 2</span> What gets done?
          </legend>
          <p className="field__help">One task is enough. Three is the limit, on purpose.</p>
          <div className="focus-tasks">
            {taskInputs.map((value, i) => (
              <div key={i} className="field">
                <label htmlFor={`focus-task-${i}`}>
                  Task {i + 1}{" "}
                  {i === 0 ? <span className="accent">(required)</span> : <span className="meta">(optional)</span>}
                </label>
                <input
                  id={`focus-task-${i}`}
                  type="text"
                  maxLength={80}
                  autoComplete="off"
                  value={value}
                  onChange={(e) => setTaskInputs(taskInputs.map((t, j) => (j === i ? e.target.value : t)))}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="focus-step">
          <legend className="focus-step__title">
            <span className="kicker">Step 3</span> Pick your scene
          </legend>
          <div className="focus-scenes">
            {FOCUS_THEMES.map((t) => (
              <label key={t.id} className={`focus-scene${scene === t.id ? " is-on" : ""}`}>
                <input type="radio" name="scene" checked={scene === t.id} onChange={() => setScene(t.id)} />
                <Image
                  src={FOCUS_PHOTOS[t.id][0].src}
                  alt={`${t.label} preview photo`}
                  width={320}
                  height={200}
                  sizes="(min-width: 760px) 240px, 45vw"
                />
                <span>{t.label}</span>
              </label>
            ))}
            <label className={`focus-scene focus-scene--own${scene === "custom" ? " is-on" : ""}`}>
              <input
                type="radio"
                name="scene"
                checked={scene === "custom"}
                onChange={() => undefined}
                onClick={() => fileRef.current?.click()}
              />
              {customUrl ? (
                <img src={customUrl} alt="Your chosen photo" />
              ) : (
                <span className="focus-scene__plus" aria-hidden="true">
                  +
                </span>
              )}
              <span>Your photo</span>
            </label>
          </div>
          <input
            ref={fileRef}
            className="sr-only"
            type="file"
            accept="image/*"
            tabIndex={-1}
            aria-label="Choose your own photo"
            onChange={(e) => {
              onPickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <p className="field__help">
            Your photo never leaves your device. It isn&apos;t saved, so pick it again next time.
          </p>
        </fieldset>

        {error && (
          <p className="focus-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--primary focus-start" type="submit">
          Start focusing
        </button>
      </form>

      {session &&
        createPortal(
          <FocusScreen
            overlayRef={overlayRef}
            session={session}
            left={left}
            customUrl={customUrl}
            fullscreen={fullscreen}
            canFullscreen={canFullscreen}
            onPause={togglePause}
            onAddFive={addFive}
            onEnd={endEarly}
            onSkipBreak={skipBreak}
            onExit={exit}
            onNextPhoto={nextPhoto}
            onPickFile={onPickFile}
            onToggleTask={toggleTask}
            onFullscreen={toggleFullscreen}
            onAnother={startAnother}
          />,
          document.body,
        )}
    </>
  );
}

type ScreenProps = {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  session: Session;
  left: number;
  customUrl: string | null;
  fullscreen: boolean;
  canFullscreen: boolean;
  onPause: () => void;
  onAddFive: () => void;
  onEnd: () => void;
  onSkipBreak: () => void;
  onExit: () => void;
  onNextPhoto: () => void;
  onPickFile: (file: File | undefined) => void;
  onToggleTask: (i: number) => void;
  onFullscreen: () => void;
  onAnother: () => void;
};

function FocusScreen(p: ScreenProps) {
  const { session, left } = p;
  const theme = themeOf(session.scene);
  const photo = FOCUS_PHOTOS[theme][session.photo % FOCUS_PHOTOS[theme].length];
  const ownMissing = session.scene === "custom" && !p.customUrl;
  const src = session.scene === "custom" && p.customUrl ? p.customUrl : photo.src;
  const [layers, setLayers] = useState([src]);
  useEffect(() => {
    setLayers((l) => (l[l.length - 1] === src ? l : [l[l.length - 1], src]));
  }, [src]);
  const current = session.tasks.find((t) => !t.done);
  const progress = session.totalMs > 0 ? 1 - left / session.totalMs : 1;
  const done = session.status === "done";
  const minutes = Math.floor(session.focusedMs / 60_000);
  const doneCount = session.tasks.filter((t) => t.done).length;
  const ownFile = useRef<HTMLInputElement>(null);
  const pickOwn = () => ownFile.current?.click();
  const pomo = session.pomodoro;
  const onBreak = isBreak(session);
  const longBreak = Boolean(pomo && onBreak && pomo.round % LONG_BREAK_EVERY === 0);
  const phaseLabel = !pomo
    ? "Focus mode"
    : onBreak
      ? longBreak
        ? "Long break"
        : "Break"
      : `Pomodoro ${pomo.round} of ${pomo.rounds}`;

  return (
    <div
      ref={p.overlayRef}
      className={`focus-screen${done ? " is-done" : ""}${onBreak && !done ? " is-break" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Focus session"
      tabIndex={-1}
    >
      {layers.map((s) => (
        <div key={s} className="focus-screen__photo" style={{ backgroundImage: `url("${s}")` }} aria-hidden="true" />
      ))}
      <div className="focus-screen__shade" aria-hidden="true" />

      <div className="focus-screen__top">
        <p className="kicker">
          {done ? "Session complete" : session.status === "paused" ? `Paused · ${phaseLabel}` : phaseLabel}
        </p>
        <div className="focus-screen__icons">
          {p.canFullscreen && (
            <button type="button" className="focus-icon" onClick={p.onFullscreen} aria-pressed={p.fullscreen}>
              {p.fullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
          )}
          <button type="button" className="focus-icon" onClick={p.onExit}>
            Exit <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {done ? (
        <div className="focus-screen__center">
          <p className="focus-screen__big focus-screen__big--done">
            {minutes >= 1 ? `${minutes} minute${minutes === 1 ? "" : "s"}.` : "Under a minute."}
            <span className="accent"> Locked in.</span>
          </p>
          {pomo && (
            <p className="focus-screen__sub">
              {pomo.completed} of {pomo.rounds} pomodoro{pomo.rounds === 1 ? "" : "s"} finished.
            </p>
          )}
          <p className="focus-screen__sub">
            {doneCount === session.tasks.length
              ? "Every task checked off. That's the whole game."
              : `${doneCount} of ${session.tasks.length} task${session.tasks.length === 1 ? "" : "s"} done. Tick off the rest if you finished them.`}
          </p>
          <TaskList tasks={session.tasks} onToggle={p.onToggleTask} />
          <div className="focus-screen__actions">
            <button type="button" className="btn btn--primary" onClick={p.onAnother}>
              Start another
            </button>
            <Link className="btn btn--ghost focus-ghost" href="/" onClick={p.onExit}>
              Back to home
            </Link>
          </div>
        </div>
      ) : (
        <div className="focus-screen__center">
          <p className="focus-screen__now">
            {onBreak ? (
              <>
                <span className="kicker">{longBreak ? "Long break" : "Break"}</span> Stand up, drink some water, stay
                off your phone.
              </>
            ) : current ? (
              <>
                <span className="kicker">Now</span> {current.text}
              </>
            ) : (
              "All tasks done. Ride it out or end the session."
            )}
          </p>
          <p className="focus-screen__big" aria-live="off">
            <span className="sr-only">Time left: </span>
            {clock(left)}
          </p>
          <div
            className="focus-progress"
            role="progressbar"
            aria-label="Session progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }} />
          </div>
          {pomo && (
            <ol className="focus-dots" aria-label={`${pomo.completed} of ${pomo.rounds} pomodoros finished`}>
              {Array.from({ length: pomo.rounds }, (_, i) => (
                <li
                  key={i}
                  className={i < pomo.completed ? "is-done" : i === pomo.round - 1 && !onBreak ? "is-now" : undefined}
                />
              ))}
            </ol>
          )}
          {onBreak && current && (
            <p className="focus-screen__sub">
              Up next: <strong>{current.text}</strong>
            </p>
          )}
          {!onBreak && <TaskList tasks={session.tasks} onToggle={p.onToggleTask} />}
          <div className="focus-screen__actions">
            <button type="button" className="btn btn--primary" onClick={p.onPause}>
              {session.status === "paused" ? "Resume" : "Pause"}
            </button>
            {onBreak ? (
              <button type="button" className="btn btn--ghost focus-ghost" onClick={p.onSkipBreak}>
                Skip break
              </button>
            ) : (
              <button type="button" className="btn btn--ghost focus-ghost" onClick={p.onAddFive}>
                +5 min
              </button>
            )}
            <button type="button" className="btn btn--ghost focus-ghost" onClick={p.onEnd}>
              End session
            </button>
          </div>
        </div>
      )}

      <div className="focus-screen__bottom">
        <p className="focus-screen__credit">
          {ownMissing ? (
            <button type="button" className="focus-icon" onClick={pickOwn}>
              Your photo isn&apos;t stored. Pick it again
            </button>
          ) : session.scene === "custom" ? (
            "Your photo"
          ) : (
            <>
              Photo by{" "}
              <a href={photo.url} target="_blank" rel="noopener noreferrer">
                {photo.author}
                {NEW_TAB}
              </a>{" "}
              on Unsplash
            </>
          )}
        </p>
        <p className="focus-screen__line">&ldquo;{FOCUS_LINES[session.line % FOCUS_LINES.length]}&rdquo;</p>
        <input
          ref={ownFile}
          className="sr-only"
          type="file"
          accept="image/*"
          tabIndex={-1}
          aria-label="Choose your own photo"
          onChange={(e) => {
            p.onPickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {!ownMissing && (
          <button type="button" className="focus-icon" onClick={session.scene === "custom" ? pickOwn : p.onNextPhoto}>
            {session.scene === "custom" ? "Change photo" : "New photo"}
          </button>
        )}
      </div>
    </div>
  );
}

function TaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (i: number) => void }) {
  return (
    <ul className="focus-list">
      {tasks.map((t, i) => (
        <li key={i}>
          <label className={t.done ? "is-done" : undefined}>
            <input type="checkbox" checked={t.done} onChange={() => onToggle(i)} />
            <span>{t.text}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
