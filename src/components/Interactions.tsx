"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Seitenweite Maus- und Scroll-Effekte:
 * - Raster-Glow: das Hintergrundraster leuchtet um den Mauszeiger auf (--mx/--my auf <html>)
 * - Spotlight: Karten und dunkle Flaechen bekommen einen Lichtkegel an der Mausposition (--px/--py)
 * - Tilt: Karten neigen sich leicht zum Mauszeiger
 * - Magnet: primaere Buttons ziehen leicht zum Mauszeiger
 * - Reveal-Fallback: Einblenden beim Scrollen fuer Browser ohne animation-timeline
 * Maus-Effekte nur bei feinem Zeiger und ohne prefers-reduced-motion.
 */

const SPOT = ".post-card, .start-card, .lab-card, .roadmap__col, .topic-box, .related, .facts, .hero";
const TILT = ".post-card, .start-card, .lab-card, .roadmap__col";
const MAGNET = ".btn--primary";
const MAX_TILT = 5;
const MAX_PULL = 6;

export function Interactions() {
  const pathname = usePathname();

  // Reveal-Fallback (Firefox, Safari): IntersectionObserver statt CSS-Scroll-Timeline.
  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    root.classList.add("reveal-io");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Maus-Effekte
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const root = document.documentElement;
    root.classList.add("fx");
    let frame = 0;
    let last: PointerEvent | null = null;
    let tilted: HTMLElement | null = null;
    let pulled: HTMLElement | null = null;

    // Tilt nutzt die Einzel-Properties rotate/translate statt transform, weil Scroll-Reveal-Animationen
    // transform belegen und Animationen Inline-Styles ueberstimmen.
    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.removeProperty("transform");
      el.style.removeProperty("rotate");
      el.style.removeProperty("translate");
    };

    const update = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      root.style.setProperty("--mx", `${e.clientX}px`);
      root.style.setProperty("--my", `${e.clientY}px`);

      const target = e.target instanceof Element ? e.target : null;

      const spot = target?.closest<HTMLElement>(SPOT);
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--px", `${e.clientX - r.left}px`);
        spot.style.setProperty("--py", `${e.clientY - r.top}px`);
        spot.style.setProperty("--nx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        spot.style.setProperty("--ny", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      }

      const tilt = target?.closest<HTMLElement>(TILT) ?? null;
      if (tilt !== tilted) {
        reset(tilted);
        tilted = tilt;
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const angle = Math.hypot(x, y) * 2 * MAX_TILT;
        tilt.style.rotate = `${(-y).toFixed(3)} ${x.toFixed(3)} 0 ${angle.toFixed(2)}deg`;
        tilt.style.translate = "0 -4px";
      }

      const magnet = target?.closest<HTMLElement>(MAGNET) ?? null;
      if (magnet !== pulled) {
        reset(pulled);
        pulled = magnet;
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        magnet.style.transform = `translate(${(x * MAX_PULL).toFixed(1)}px, ${(y * MAX_PULL * 0.6).toFixed(1)}px)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeave = () => {
      reset(tilted);
      reset(pulled);
      tilted = pulled = null;
      root.style.setProperty("--mx", "-999px");
      root.style.setProperty("--my", "-999px");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
      root.classList.remove("fx");
    };
  }, []);

  return null;
}
