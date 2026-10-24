"use client";

import { useEffect, useRef } from "react";

/**
 * Dekoratives Partikelnetz hinter dem AI-Hero (aus dem Astro-Projekt uebernommen, auf Bernstein umgefaerbt).
 * Pausiert ausserhalb des Viewports und steht still bei prefers-reduced-motion.
 */
export function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const pointer = { x: 0.6, y: 0.4, active: false };
    let particles: { x: number; y: number; vx: number; vy: number; r: number; phase: number }[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let visible = true;

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(18, Math.min(56, Math.round((width * height) / (coarse ? 52000 : 34000))));
      particles = Array.from({ length: count }, (_, i) => ({
        x: ((i * 0.61803398875) % 1) * width,
        y: ((i * 0.41421356237 + 0.12) % 1) * height,
        vx: 3.5 + ((i * 7) % 9),
        vy: -2 + ((i * 5) % 7),
        r: 0.8 + (i % 4) * 0.35,
        phase: i * 0.73,
      }));
    };

    const draw = (time = 0) => {
      const delta = Math.min(32, time - last || 16) / 1000;
      last = time;
      context.clearRect(0, 0, width, height);
      const fx = pointer.x * width;
      const fy = pointer.y * height;
      const reach = coarse ? 116 : 148;

      particles.forEach((p, i) => {
        if (!reduced) {
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          if (p.x > width + 12) p.x = -12;
          if (p.y < -12) p.y = height + 12;
          if (p.y > height + 12) p.y = -12;
        }
        const focus = pointer.active ? Math.max(0, 1 - Math.hypot(p.x - fx, p.y - fy) / 280) : 0;
        const pulse = reduced ? 0.6 : 0.58 + Math.sin(time * 0.0012 + p.phase) * 0.24;

        for (let j = i + 1; j < particles.length; j += 1) {
          const o = particles[j];
          const d = Math.hypot(p.x - o.x, p.y - o.y);
          if (d < reach) {
            context.strokeStyle = `rgba(255, 178, 36, ${(1 - d / reach) * (0.09 + focus * 0.14)})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(o.x, o.y);
            context.stroke();
          }
        }
        context.fillStyle = `rgba(255, 210, 130, ${0.16 + pulse * 0.26 + focus * 0.24})`;
        context.beginPath();
        context.arc(p.x, p.y, p.r + focus * 0.8, 0, Math.PI * 2);
        context.fill();
      });

      if (!reduced && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      last = 0;
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - box.left) / Math.max(1, box.width);
      pointer.y = (e.clientY - box.top) / Math.max(1, box.height);
      pointer.active = true;
    };
    const onVisibility = () => {
      if (!document.hidden) restart();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) restart();
    });

    resize();
    restart();
    observer.observe(canvas);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="signal-field" aria-hidden="true" />;
}
