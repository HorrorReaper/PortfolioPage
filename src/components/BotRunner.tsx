"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Mini-Jump-and-Run fuer die 404-Seite (angelehnt an das Chrome-Dino-Spiel):
 * Ein AI-Bot sammelt Proteinpulver und springt ueber boese Schokoriegel.
 * Steuerung: Leertaste / Pfeil hoch / W oder Tippen. Alles wird mit Canvas-Formen gezeichnet, ohne Bilddateien.
 */

type Phase = "ready" | "running" | "over";
type Thing = { x: number; y: number; w: number; h: number; kind: "bar" | "protein"; taken?: boolean };

const H = 260;
const GROUND = H - 42;
const BOT = { x: 64, w: 38, h: 46 };
const GRAVITY = 2300;
const JUMP = -760;
const START_SPEED = 330;
const MAX_SPEED = 860;
const BEST_KEY = "pe-botrunner-best";

const C = {
  bg: "#0b0e1a",
  grid: "rgba(255,178,36,0.06)",
  ground: "#2a3262",
  amber: "#ffb224",
  text: "#e9ebf7",
  muted: "#a3abcf",
  body: "#1b2350",
  visor: "#05070f",
  choc: "#5b3420",
  chocDark: "#3d2214",
  wrapper: "#c2603f",
  tub: "#e9ebf7",
};

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Ohne Speicher gilt der Rekord nur fuer diese Sitzung.
  }
}

export function BotRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [hud, setHud] = useState({ score: 0, protein: 0, best: 0 });

  // Spielzustand ausserhalb von React, damit die Schleife nicht bei jedem Frame neu rendert.
  const game = useRef({
    phase: "ready" as Phase,
    width: 720,
    y: GROUND - BOT.h,
    vy: 0,
    speed: START_SPEED,
    distance: 0,
    protein: 0,
    things: [] as Thing[],
    nextSpawn: 420,
    groundOffset: 0,
    legTick: 0,
    frame: 0,
    last: 0,
    best: 0,
    shake: 0,
    overAt: 0,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const g = game.current;
    const W = g.width;

    ctx.save();
    if (g.shake > 0) ctx.translate((Math.random() - 0.5) * g.shake, (Math.random() - 0.5) * g.shake);

    // Hintergrund mit Raster
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    const gridShift = -(g.groundOffset * 0.3) % 32;
    for (let x = gridShift; x < W; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND);
      ctx.stroke();
    }
    for (let y = 0; y < GROUND; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Boden
    ctx.fillStyle = C.ground;
    ctx.fillRect(0, GROUND, W, 2);
    ctx.fillStyle = "rgba(163,171,207,0.35)";
    for (let x = -(g.groundOffset % 46); x < W; x += 46) ctx.fillRect(x, GROUND + 10, 18, 2);
    for (let x = -((g.groundOffset * 1.3) % 71); x < W; x += 71) ctx.fillRect(x + 20, GROUND + 22, 8, 2);

    // Objekte
    for (const t of g.things) {
      if (t.kind === "bar") drawBar(ctx, t);
      else if (!t.taken) drawTub(ctx, t, g.frame);
    }

    // Bot
    drawBot(ctx, BOT.x, g.y, g.legTick, g.phase === "over", g.y < GROUND - BOT.h - 1);

    ctx.restore();
  }, []);

  const reset = useCallback(() => {
    const g = game.current;
    g.y = GROUND - BOT.h;
    g.vy = 0;
    g.speed = START_SPEED;
    g.distance = 0;
    g.protein = 0;
    g.things = [];
    g.nextSpawn = 420;
    g.groundOffset = 0;
    g.shake = 0;
  }, []);

  const loop = useCallback(
    (time: number) => {
      const g = game.current;
      if (g.phase !== "running") return;
      const dt = Math.min(0.033, (time - (g.last || time)) / 1000);
      g.last = time;
      g.frame += 1;

      // Physik
      g.speed = Math.min(MAX_SPEED, g.speed + 9 * dt);
      const dx = g.speed * dt;
      g.distance += dx;
      g.groundOffset += dx;
      g.vy += GRAVITY * dt;
      g.y += g.vy * dt;
      if (g.y > GROUND - BOT.h) {
        g.y = GROUND - BOT.h;
        g.vy = 0;
      }
      if (g.y >= GROUND - BOT.h) g.legTick += dx;

      // Neue Objekte
      g.nextSpawn -= dx;
      if (g.nextSpawn <= 0) {
        const pieces = 1 + Math.floor(Math.random() * (g.speed > 560 ? 3 : 2));
        const tall = g.speed > 480 && Math.random() < 0.25;
        const w = 16 + pieces * 12;
        const h = tall ? 50 : 34;
        g.things.push({ kind: "bar", x: g.width + 10, y: GROUND - h, w, h });
        // Protein zwischen den Riegeln, mal am Boden, mal in der Luft
        if (Math.random() < 0.7) {
          const high = Math.random() < 0.55;
          g.things.push({
            kind: "protein",
            x: g.width + 10 + w + 120 + Math.random() * 80,
            y: high ? GROUND - 118 : GROUND - 30,
            w: 22,
            h: 28,
          });
        }
        const gap = 260 + Math.random() * 320;
        g.nextSpawn = gap + g.speed * 0.35;
      }

      for (const t of g.things) t.x -= dx;
      g.things = g.things.filter((t) => t.x + t.w > -20);

      // Kollisionen (Bot-Hitbox etwas kleiner als die Grafik)
      const bx = BOT.x + 6;
      const by = g.y + 6;
      const bw = BOT.w - 12;
      const bh = BOT.h - 8;
      for (const t of g.things) {
        const hit = bx < t.x + t.w - 3 && bx + bw > t.x + 3 && by < t.y + t.h && by + bh > t.y + 4;
        if (!hit) continue;
        if (t.kind === "protein" && !t.taken) {
          t.taken = true;
          g.protein += 1;
        } else if (t.kind === "bar") {
          g.phase = "over";
          g.overAt = performance.now();
          g.shake = 6;
          const score = Math.floor(g.distance / 10) + g.protein * 50;
          if (score > g.best) {
            g.best = score;
            saveBest(score);
          }
          draw();
          setHud({ score, protein: g.protein, best: g.best });
          setPhase("over");
          window.setTimeout(() => {
            game.current.shake = 0;
            draw();
          }, 120);
          return;
        }
      }

      draw();
      if (g.frame % 6 === 0) {
        setHud({ score: Math.floor(g.distance / 10) + g.protein * 50, protein: g.protein, best: g.best });
      }
      requestAnimationFrame(loop);
    },
    [draw],
  );

  const start = useCallback(() => {
    const g = game.current;
    reset();
    g.phase = "running";
    g.last = 0;
    setPhase("running");
    setHud({ score: 0, protein: 0, best: g.best });
    canvasRef.current?.focus({ preventScroll: true });
    requestAnimationFrame(loop);
  }, [loop, reset]);

  const jump = useCallback(() => {
    const g = game.current;
    if (g.phase !== "running") {
      // Kurze Pause nach dem Crash, damit ein Dauerdruecken nicht sofort neu startet
      if (g.phase === "over" && performance.now() - g.overAt < 500) return;
      start();
      return;
    }
    if (g.y >= GROUND - BOT.h - 0.5) g.vy = JUMP;
  }, [start]);

  // Groesse an den Container anpassen
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    game.current.best = readBest();
    setHud((h) => ({ ...h, best: game.current.best }));

    const resize = () => {
      const width = Math.round(Math.min(wrap.clientWidth, 960));
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      game.current.width = width;
      canvas.width = width * ratio;
      canvas.height = H * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${H}px`;
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [draw]);

  // Tastatur: aktiv, wenn das Spiel fokussiert ist oder laeuft (damit die Leertaste sonst normal scrollt)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (![" ", "Spacebar", "ArrowUp", "w", "W"].includes(e.key)) return;
      const focused = document.activeElement === canvasRef.current;
      if (!focused && game.current.phase !== "running") return;
      e.preventDefault();
      if (!e.repeat) jump();
    };
    const onVisibility = () => {
      // Tab im Hintergrund: Runde beenden statt unbemerkt weiterlaufen
      if (document.hidden && game.current.phase === "running") {
        game.current.phase = "ready";
        setPhase("ready");
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      game.current.phase = "ready";
    };
  }, [jump]);

  return (
    <section className="runner" aria-labelledby="runner-title">
      <div className="runner__head">
        <h2 id="runner-title" className="h3">
          While you&apos;re here: help the bot bulk.
        </h2>
        <p className="meta">
          Collect protein, dodge the evil chocolate bars. Space, arrow up or tap to jump.
        </p>
      </div>

      <div className="runner__stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="runner__canvas"
          tabIndex={0}
          role="img"
          aria-label="Jump and run game: an AI bot collects protein powder and jumps over chocolate bars."
          onPointerDown={(e) => {
            e.preventDefault();
            jump();
          }}
        />
        <div className="runner__hud" aria-live="off">
          <span>Protein {hud.protein}</span>
          <span>Score {hud.score}</span>
          <span>Best {hud.best}</span>
        </div>
        {phase !== "running" && (
          <div className="runner__overlay">
            <p className="runner__msg">
              {phase === "over" ? "Sugar crash!" : "Ready to bulk?"}
            </p>
            {phase === "over" && (
              <p className="meta" role="status">
                {hud.protein} protein, {hud.score} points{hud.score > 0 && hud.score >= hud.best ? ". New best!" : "."}
              </p>
            )}
            <button type="button" className="btn btn--primary btn--small" onClick={start}>
              {phase === "over" ? "Try again" : "Start game"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Zeichnen ---------- */

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBot(ctx: CanvasRenderingContext2D, x: number, y: number, legTick: number, dead: boolean, airborne: boolean) {
  // Antenne
  ctx.strokeStyle = C.muted;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 19, y + 4);
  ctx.lineTo(x + 19, y - 6);
  ctx.stroke();
  ctx.fillStyle = C.amber;
  ctx.beginPath();
  ctx.arc(x + 19, y - 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Kopf
  ctx.fillStyle = C.body;
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 2;
  roundRect(ctx, x + 3, y + 4, 32, 22, 6);
  ctx.fill();
  ctx.stroke();
  // Visier und Augen
  ctx.fillStyle = C.visor;
  roundRect(ctx, x + 7, y + 9, 24, 12, 4);
  ctx.fill();
  ctx.fillStyle = dead ? "#ff6b6b" : C.amber;
  if (dead) {
    ctx.font = "bold 10px monospace";
    ctx.fillText("x", x + 11, y + 19);
    ctx.fillText("x", x + 21, y + 19);
  } else {
    ctx.fillRect(x + 12, y + 12, 4, 6);
    ctx.fillRect(x + 22, y + 12, 4, 6);
  }

  // Koerper
  ctx.fillStyle = C.body;
  roundRect(ctx, x + 7, y + 27, 24, 13, 3);
  ctx.fill();
  ctx.strokeStyle = C.ground;
  ctx.stroke();
  ctx.fillStyle = C.amber;
  ctx.fillRect(x + 16, y + 31, 6, 3);

  // Beine (laufen am Boden, angezogen in der Luft)
  ctx.fillStyle = C.muted;
  if (airborne) {
    ctx.fillRect(x + 11, y + 40, 6, 4);
    ctx.fillRect(x + 21, y + 40, 6, 4);
  } else {
    const step = Math.floor(legTick / 14) % 2;
    ctx.fillRect(x + 11, y + 40, 6, step ? 6 : 3);
    ctx.fillRect(x + 21, y + 40, 6, step ? 3 : 6);
  }
}

function drawBar(ctx: CanvasRenderingContext2D, t: Thing) {
  // Verpackung links, Schokolade rechts
  ctx.fillStyle = C.wrapper;
  ctx.fillRect(t.x, t.y + 4, 10, t.h - 4);
  ctx.fillStyle = C.choc;
  roundRect(ctx, t.x + 8, t.y, t.w - 8, t.h, 3);
  ctx.fill();
  // Rippen
  ctx.strokeStyle = C.chocDark;
  ctx.lineWidth = 2;
  for (let x = t.x + 20; x < t.x + t.w - 4; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, t.y + 3);
    ctx.lineTo(x, t.y + t.h - 3);
    ctx.stroke();
  }
  // Boese Augen und Brauen
  const cx = t.x + 8 + (t.w - 8) / 2;
  const ey = t.y + 12;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - 9, ey, 6, 6);
  ctx.fillRect(cx + 3, ey, 6, 6);
  ctx.fillStyle = "#0b0e1a";
  ctx.fillRect(cx - 6, ey + 2, 3, 4);
  ctx.fillRect(cx + 3, ey + 2, 3, 4);
  ctx.strokeStyle = "#0b0e1a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 11, ey - 4);
  ctx.lineTo(cx - 3, ey - 1);
  ctx.moveTo(cx + 11, ey - 4);
  ctx.lineTo(cx + 3, ey - 1);
  ctx.stroke();
  // Grinsen
  ctx.beginPath();
  ctx.moveTo(cx - 5, ey + 12);
  ctx.lineTo(cx, ey + 10);
  ctx.lineTo(cx + 5, ey + 12);
  ctx.stroke();
}

function drawTub(ctx: CanvasRenderingContext2D, t: Thing, frame: number) {
  const bob = Math.sin(frame / 8 + t.x / 40) * 2;
  const y = t.y + bob;
  // Leuchten
  ctx.fillStyle = "rgba(255,178,36,0.14)";
  ctx.beginPath();
  ctx.arc(t.x + t.w / 2, y + t.h / 2, 18, 0, Math.PI * 2);
  ctx.fill();
  // Dose
  ctx.fillStyle = C.tub;
  roundRect(ctx, t.x, y + 5, t.w, t.h - 5, 3);
  ctx.fill();
  // Deckel
  ctx.fillStyle = C.amber;
  roundRect(ctx, t.x - 1, y, t.w + 2, 7, 2);
  ctx.fill();
  // Etikett
  ctx.fillStyle = C.body;
  ctx.fillRect(t.x + 2, y + 12, t.w - 4, 10);
  ctx.fillStyle = C.amber;
  ctx.font = "bold 8px monospace";
  ctx.textAlign = "center";
  ctx.fillText("PRO", t.x + t.w / 2, y + 20);
  ctx.textAlign = "start";
}
