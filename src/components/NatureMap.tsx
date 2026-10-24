"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Interaktive 3D-Karte (aus dem Astro-Projekt portiert, Farben an das Quest-Design angepasst).
 * Vorerst nicht eingebunden: zum Reaktivieren src/app/map/page.tsx anlegen, NAV/Sitemap ergaenzen und den
 * Redirect fuer /map in next.config.ts entfernen.
 * three.js wird erst auf dieser Seite dynamisch geladen.
 */

export type LandmarkId = "home" | "ai" | "writing" | "fitness" | "projects";

export const LANDMARKS: { id: LandmarkId; label: string; status: string; href: string }[] = [
  { id: "home", label: "Basecamp", status: "Home and personal thesis", href: "/" },
  { id: "ai", label: "AI River", status: "Practical leverage and technology", href: "/ai" },
  { id: "writing", label: "Writing Forest", status: "Founder notes", href: "/writing" },
  { id: "fitness", label: "Training Ground", status: "Discipline and health", href: "/fitness" },
  { id: "projects", label: "Project Village", status: "LifeQuest", href: "/lifequest" },
];

export function NatureMap() {
  const host = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [active, setActive] = useState<LandmarkId>("home");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const activeRef = useRef<LandmarkId>("home");

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvasHost = host.current;
    if (!canvasHost) return;
    let disposed = false;
    let cleanup = () => {};

    import("three")
      .then((THREE) => {
        if (disposed) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0b0e1a, 0.045);

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setClearColor(0x0b0e1a, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        canvasHost.appendChild(renderer.domElement);

        scene.add(new THREE.HemisphereLight(0xe9ebf7, 0x0b0e1a, 2.2));
        const sun = new THREE.DirectionalLight(0xffe2a8, 3.0);
        sun.position.set(-6, 9, 5);
        scene.add(sun);

        const pointer = new THREE.Vector2(-2, -2);
        const drift = new THREE.Vector2(0, 0);
        const raycaster = new THREE.Raycaster();
        const interactive: import("three").Mesh[] = [];
        const groups = new Map<LandmarkId, import("three").Group>();
        let hovered: LandmarkId | null = null;
        let frame = 0;
        let visible = true;
        let baseY = 7.1;
        let baseZ = 11.3;

        const mat = (color: number, extra: Record<string, unknown> = {}) =>
          new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
        const m = {
          terrain: mat(0x1b2346),
          ridge: mat(0x39427a),
          stone: mat(0x5a628f),
          river: new THREE.MeshStandardMaterial({
            color: 0xffb224,
            emissive: 0xb86e00,
            emissiveIntensity: 0.7,
            roughness: 0.3,
            transparent: true,
            opacity: 0.88,
          }),
          bark: mat(0x3a2d24),
          leaf: mat(0x1d3a4d),
          accent: mat(0xffb224, { emissive: 0x7a4d00, emissiveIntensity: 0.6, roughness: 0.4 }),
          training: mat(0xc2603f),
          village: mat(0xd9a85b),
          roof: mat(0x8a3b2f),
          path: mat(0x6b6f8f),
        };

        const terrainGeometry = new THREE.PlaneGeometry(22, 15, 76, 52);
        const pos = terrainGeometry.attributes.position;
        for (let i = 0; i < pos.count; i += 1) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const ridge = Math.max(0, 1 - Math.hypot(x + 6.8, y - 2.2) / 4.1) * 2.9;
          const rise = Math.max(0, 1 - Math.hypot(x - 1.8, y + 1.2) / 7.6) * 0.52;
          pos.setZ(i, ridge + rise + Math.sin(x * 1.15) * 0.14 + Math.cos(y * 1.35) * 0.12);
        }
        terrainGeometry.computeVertexNormals();
        const terrain = new THREE.Mesh(terrainGeometry, m.terrain);
        terrain.rotation.x = -Math.PI / 2;
        scene.add(terrain);

        const river = new THREE.Mesh(
          new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(-9, 0.2, -4.8),
              new THREE.Vector3(-5.4, 0.24, -2.4),
              new THREE.Vector3(-1.4, 0.22, -2.8),
              new THREE.Vector3(2.7, 0.2, -0.9),
              new THREE.Vector3(6.5, 0.22, -2.9),
              new THREE.Vector3(9.5, 0.22, -1.4),
            ]),
            82,
            0.16,
            10,
            false,
          ),
          m.river,
        );
        scene.add(river);
        scene.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(-6.5, 0.18, 3.8),
                new THREE.Vector3(-2.4, 0.2, 2.1),
                new THREE.Vector3(1.6, 0.19, 1.6),
                new THREE.Vector3(4.8, 0.19, 3.6),
              ]),
              62,
              0.09,
              8,
              false,
            ),
            m.path,
          ),
        );

        const bind = (group: import("three").Group, id: LandmarkId) => {
          group.userData.baseY = group.position.y;
          groups.set(id, group);
          group.traverse((child) => {
            if ((child as import("three").Mesh).isMesh) {
              child.userData.landmarkId = id;
              interactive.push(child as import("three").Mesh);
            }
          });
          scene.add(group);
        };
        const tree = (parent: import("three").Object3D, x: number, z: number, s = 1) => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * s, 0.075 * s, 0.48 * s, 7), m.bark);
          trunk.position.set(x, 0.34 * s, z);
          const crown = new THREE.Mesh(new THREE.ConeGeometry(0.38 * s, 0.9 * s, 7), m.leaf);
          crown.position.set(x, 0.98 * s, z);
          parent.add(trunk, crown);
        };

        // Basecamp
        {
          const g = new THREE.Group();
          g.position.set(-6.8, 0.9, 2.2);
          const peak = new THREE.Mesh(new THREE.ConeGeometry(1.25, 3.4, 5), m.ridge);
          peak.position.y = 1.55;
          peak.rotation.y = 0.25;
          const cap = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.78, 5), m.accent);
          cap.position.y = 3.36;
          cap.rotation.y = 0.25;
          g.add(peak, cap);
          bind(g, "home");
        }
        // AI River
        {
          const g = new THREE.Group();
          g.position.set(2.9, 0.42, -1.1);
          const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.56, 0.22, 6), m.stone);
          const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 0), m.accent);
          crystal.position.y = 0.78;
          crystal.rotation.set(0.4, 0.28, 0.12);
          g.add(base, crystal);
          bind(g, "ai");
        }
        // Writing Forest
        {
          const g = new THREE.Group();
          g.position.set(-2.4, 0.18, 3.1);
          for (const [x, z, s] of [
            [-0.8, -0.2, 1.1],
            [-0.2, 0.34, 0.84],
            [0.42, -0.18, 1],
            [0.9, 0.44, 0.72],
            [-1.18, 0.52, 0.76],
          ])
            tree(g, x, z, s);
          const journal = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.48), m.accent);
          journal.position.set(0.18, 0.14, -0.68);
          journal.rotation.y = -0.28;
          g.add(journal);
          bind(g, "writing");
        }
        // Training Ground
        {
          const g = new THREE.Group();
          g.position.set(4.4, 0.16, 2.6);
          const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 0.22, 7), m.stone);
          const left = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.68, 0.68), m.training);
          const right = left.clone();
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.72, 12), m.accent);
          left.position.set(-0.95, 0.52, 0);
          right.position.set(0.95, 0.52, 0);
          bar.position.set(0, 0.52, 0);
          bar.rotation.z = Math.PI / 2;
          g.add(platform, left, right, bar);
          bind(g, "fitness");
        }
        // Project Village
        {
          const g = new THREE.Group();
          g.position.set(6.6, 0.22, -3.2);
          for (const [x, z, s] of [
            [-0.54, 0, 0.58],
            [0.24, 0.2, 0.72],
            [0.84, -0.28, 0.5],
          ]) {
            const house = new THREE.Mesh(new THREE.BoxGeometry(0.62 * s, 0.54 * s, 0.62 * s), m.village);
            house.position.set(x, 0.28 * s, z);
            const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5 * s, 0.45 * s, 4), m.roof);
            roof.position.set(x, 0.82 * s, z);
            roof.rotation.y = Math.PI / 4;
            g.add(house, roof);
          }
          bind(g, "projects");
        }
        // Baeume
        {
          const g = new THREE.Group();
          for (const [x, z, s] of [
            [-7.5, -3.7, 0.72],
            [-6.6, -4.4, 0.54],
            [-4.8, 4.7, 0.62],
            [-0.4, 4.8, 0.5],
            [7.8, 3.8, 0.66],
            [8.4, 1.4, 0.48],
            [0.8, -5.2, 0.58],
          ])
            tree(g, x, z, s);
          scene.add(g);
        }

        const scaleTarget = new THREE.Vector3();
        const render = (time = 0) => {
          const t = time * 0.001;
          if (!reduceMotion) {
            camera.position.x += (drift.x * 0.7 - camera.position.x) * 0.025;
            camera.position.y += (baseY + drift.y * 0.22 - camera.position.y) * 0.018;
            camera.position.z += (baseZ + drift.y * 0.38 - camera.position.z) * 0.02;
            camera.lookAt(0, 0.08, 0);
            m.river.opacity = 0.8 + Math.sin(t * 2.2) * 0.08;
          }
          groups.forEach((group, id) => {
            const on = id === hovered || id === activeRef.current;
            const s = on ? 1.12 : 1;
            group.scale.lerp(scaleTarget.set(s, s, s), reduceMotion ? 1 : 0.12);
            if (!reduceMotion) group.position.y = group.userData.baseY + Math.sin(t * 1.4 + group.position.x) * 0.035;
          });
          renderer.render(scene, camera);
        };

        const resize = () => {
          const w = canvasHost.clientWidth;
          const h = canvasHost.clientHeight;
          const aspect = w / Math.max(h, 1);
          renderer.setSize(w, h, false);
          camera.aspect = aspect;
          camera.fov = w < 620 ? 46 : 44;
          baseY = w < 620 ? 8.8 : aspect > 1.45 ? 8.7 : 7.7;
          baseZ = w < 620 ? 12.6 : aspect > 1.45 ? 12.4 : 11.6;
          camera.position.set(0, baseY, baseZ);
          camera.lookAt(0, 0.08, 0);
          camera.updateProjectionMatrix();
          render(0);
        };

        const loop = (time: number) => {
          render(time);
          frame = visible ? requestAnimationFrame(loop) : 0;
        };
        const start = () => {
          if (!reduceMotion && visible && !frame) frame = requestAnimationFrame(loop);
        };
        const stop = () => {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
        };

        const onMove = (event: PointerEvent) => {
          const b = renderer.domElement.getBoundingClientRect();
          pointer.x = ((event.clientX - b.left) / b.width) * 2 - 1;
          pointer.y = -(((event.clientY - b.top) / b.height) * 2 - 1);
          drift.copy(pointer);
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(interactive, false)[0];
          const id = (hit?.object.userData.landmarkId as LandmarkId | undefined) ?? null;
          if (id !== hovered) {
            hovered = id;
            renderer.domElement.style.cursor = id ? "pointer" : "grab";
            if (id) setActive(id);
          }
          if (reduceMotion) render(performance.now());
        };
        const onLeave = () => {
          hovered = null;
          renderer.domElement.style.cursor = "grab";
          if (reduceMotion) render(performance.now());
        };
        const onClick = () => {
          const target = LANDMARKS.find((l) => l.id === hovered);
          if (target) router.push(target.href);
        };

        renderer.domElement.addEventListener("pointermove", onMove, { passive: true });
        renderer.domElement.addEventListener("pointerleave", onLeave);
        renderer.domElement.addEventListener("click", onClick);
        window.addEventListener("resize", resize, { passive: true });
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) start();
          else stop();
        });
        observer.observe(canvasHost);

        resize();
        setStatus("ready");
        if (reduceMotion) render(performance.now());
        else start();

        cleanup = () => {
          stop();
          observer.disconnect();
          window.removeEventListener("resize", resize);
          renderer.domElement.removeEventListener("pointermove", onMove);
          renderer.domElement.removeEventListener("pointerleave", onLeave);
          renderer.domElement.removeEventListener("click", onClick);
          scene.traverse((obj) => {
            const mesh = obj as import("three").Mesh;
            if (mesh.isMesh) mesh.geometry.dispose();
          });
          Object.values(m).forEach((material) => material.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => setStatus("error"));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [router]);

  return (
    <div className="map-stage" data-status={status}>
      <div
        ref={host}
        className="map-canvas"
        role="img"
        aria-label="Interactive 3D landscape with landmarks for AI, writing, fitness, LifeQuest and the home page."
      />
      {status === "error" && (
        <p className="map-fallback">The 3D map could not load on this device. Use the routes below to move through the site.</p>
      )}
      <nav className="map-routes" aria-label="Map routes">
        {LANDMARKS.map((l) => (
          <Link
            key={l.id}
            href={l.href}
            className={l.id === active ? "is-active" : undefined}
            onMouseEnter={() => setActive(l.id)}
            onFocus={() => setActive(l.id)}
          >
            <span className="map-routes__label">{l.label}</span>
            <span className="map-routes__status">{l.status}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
