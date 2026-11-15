"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FOCUS_LINES, FOCUS_PHOTOS, FOCUS_THEMES, type FocusTheme } from "@/lib/focus";
import { NEW_TAB_LABEL } from "@/lib/site";

/**
 * Fokus-Timer im Stil von Momentum: Dauer und bis zu drei Tasks waehlen, dann Vollbild mit Foto und Countdown.
 * Alles bleibt im Browser. Die Session liegt in localStorage (Fortsetzen nach Reload), ein eigenes Foto
 * nur als Object-URL im Speicher und ist nach dem Schliessen des Tabs weg.
 */

type Scene = FocusTheme | "custom";
type Task = { text: string; done: boolean };
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
  focusedMs: number;
};

const STORAGE_KEY = "pe-focus-session";
const PRESETS = [25, 50, 90];
const MIN_MINUTES = 5;
const MAX_MINUTES = 240;
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
    if (stored.status === "running" && stored.endsAt && stored.endsAt <= Date.now()) {
      update({ ...stored, status: "done", endsAt: null, focusedMs: stored.totalMs });
    } else {
      setSession(stored);
    }
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

  const finish = useCallback(
    (s: Session, focusedMs: number, withSignal: boolean) => {
      update({ ...s, status: "done", endsAt: null, pausedLeft: 0, focusedMs });
      if (withSignal) {
        chime(audioRef.current);
        stopBlink();
        let on = false;
        blinkRef.current = window.setInterval(() => {
          on = !on;
          setTitle(on ? "Time's up! | Focus" : "Locked in. | Focus");
        }, 1000);
      }
    },
    [update, stopBlink, setTitle],
  );

  // Takt: Restzeit aus endsAt berechnen, damit Hintergrund-Tabs nicht driften
  useEffect(() => {
    if (session?.status !== "running") return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (session.endsAt && session.endsAt <= t) finish(session, session.totalMs, true);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [session, finish]);

  // Tab-Titel mit Restzeit
  const left = session ? leftOf(session, now) : 0;
  useEffect(() => {
    if (!session) {
      stopBlink();
      setTitle(null);
      return;
    }
    if (session.status === "running") setTitle(`${clock(left)} | Focus`);
    if (session.status === "paused") setTitle(`Paused ${clock(left)} | Focus`);
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

  const start = (e: FormEvent) => {
    e.preventDefault();
    const tasks = taskInputs.map((t) => t.trim()).filter(Boolean);
    const minutes = preset === "custom" ? Number(customMinutes) : preset;
    if (tasks.length === 0) {
      setError("Add at least one task. What's the one thing this block is for?");
      return;
    }
    if (!Number.isFinite(minutes) || minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
      setError(`Pick a duration between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.`);
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
    const totalMs = Math.round(minutes * 60_000);
    setNow(Date.now());
    update({
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

  const endEarly = () => {
    if (!session) return;
    finish(session, session.totalMs - leftOf(session, Date.now()), false);
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
          <div className="focus-chips" role="radiogroup" aria-label="Duration">
            {PRESETS.map((m) => (
              <label key={m} className={`focus-chip${preset === m ? " is-on" : ""}`}>
                <input type="radio" name="duration" checked={preset === m} onChange={() => setPreset(m)} />
                {m} min
              </label>
            ))}
            <label className={`focus-chip${preset === "custom" ? " is-on" : ""}`}>
              <input type="radio" name="duration" checked={preset === "custom"} onChange={() => setPreset("custom")} />
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

  return (
    <div
      ref={p.overlayRef}
      className={`focus-screen${done ? " is-done" : ""}`}
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
        <p className="kicker">{done ? "Session complete" : session.status === "paused" ? "Paused" : "Focus mode"}</p>
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
          <p className="focus-screen__sub">
            {doneCount === session.tasks.length
              ? "Every task checked off. That's the whole game."
              : `${doneCount} of ${session.tasks.length} tasks done. Tick off the rest if you finished them.`}
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
            {current ? (
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
          <TaskList tasks={session.tasks} onToggle={p.onToggleTask} />
          <div className="focus-screen__actions">
            <button type="button" className="btn btn--primary" onClick={p.onPause}>
              {session.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button type="button" className="btn btn--ghost focus-ghost" onClick={p.onAddFive}>
              +5 min
            </button>
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
