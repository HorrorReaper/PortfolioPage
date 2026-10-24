import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  // Bild-Uploads im lokalen Admin-Panel (Server Actions).
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  // Alte URLs der Astro-Version weiterleiten.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/ai.html", destination: "/ai", permanent: true },
      { source: "/fitness.html", destination: "/fitness", permanent: true },
      { source: "/projects.html", destination: "/lifequest", permanent: true },
      { source: "/writing.html", destination: "/writing", permanent: true },
      // Die 3D-Karte ist vorerst offline (Komponente bleibt in src/components/NatureMap.tsx).
      { source: "/nature-map.html", destination: "/", permanent: false },
      { source: "/map", destination: "/", permanent: false },
      { source: "/blog/:slug.html", destination: "/writing/:slug", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
