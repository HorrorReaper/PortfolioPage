/**
 * Smoke-Test gegen einen laufenden Server (npm run build && npm start, dann npm run check).
 * Prueft Routen, Metadaten, Ueberschriften, Bilder, interne Links, CTA und verbotene Zeichen.
 * Aufruf: node scripts/check-site.mjs [basisUrl]
 */
const BASE = process.argv[2] ?? "http://localhost:3100";
const CTA = "https://patricke004.substack.com/subscribe";
const ROUTES = [
  "/",
  "/ai",
  "/fitness",
  "/lifequest",
  "/projects",
  "/writing",
  "/writing/10-brutally-honest-journaling-questions",
  "/writing/judgment-before-tools",
  "/writing/discipline-feels-quiet",
  "/writing/messy-middle",
  "/impressum",
  "/datenschutz",
];

let failures = 0;
const ok = (cond, msg) => {
  if (!cond) failures++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`);
};

const get = async (path) => {
  const res = await fetch(BASE + path, { redirect: "manual" });
  return { status: res.status, type: res.headers.get("content-type") ?? "", text: await res.text() };
};
const meta = (html, re) => re.exec(html)?.[1];
const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ");

const seen = new Set();

for (const route of ROUTES) {
  console.log(`\n== ${route}`);
  const { status, text: html } = await get(route);
  ok(status === 200, `Status 200 (war ${status})`);
  ok(/<html[^>]*lang="en"/.test(html), "html lang=\"en\"");
  ok(!!meta(html, /<title>([^<]{5,})<\/title>/), `Titel: ${meta(html, /<title>([^<]*)<\/title>/)}`);
  ok(!!meta(html, /<meta name="description" content="([^"]{40,})"/), "Meta-Description vorhanden");
  ok(!!meta(html, /<link rel="canonical" href="([^"]+)"/), `Canonical: ${meta(html, /<link rel="canonical" href="([^"]+)"/)}`);
  ok(!!meta(html, /<meta property="og:title" content="([^"]+)"/), "og:title");
  ok(/<meta property="og:image" content="[^"]+"/.test(html), "og:image");
  ok(/<meta name="viewport"/.test(html), "viewport-Meta");
  ok((html.match(/<h1[\s>]/g) ?? []).length === 1, "genau eine h1");
  ok(/<main id="main"/.test(html) && /class="skip-link"/.test(html), "main-Landmark und Skip-Link");
  ok(!/<img(?![^>]*\balt=)[^>]*>/.test(html), "alle img haben alt");

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
      ok(true, "JSON-LD ist gueltiges JSON");
    } catch {
      ok(false, "JSON-LD ist gueltiges JSON");
    }
  }

  const visible = textOf(html);
  ok(!/[–—]/.test(visible), "keine Gedankenstriche im sichtbaren Text");
  ok(!/lorem ipsum|TODO|platzhalter|placeholder/i.test(visible), "keine Platzhaltertexte");
  if (!route.startsWith("/impressum") && !route.startsWith("/datenschutz")) {
    ok(!/(und|nicht|oder|über|Artikel lesen|abonnieren)/i.test(visible), "keine deutschen Reste im sichtbaren Text");
  }

  ok(html.includes(`href="${CTA}"`), "Primaer-CTA verweist auf Substack-Anmeldung");
  ok(html.includes('href="/impressum"') && html.includes('href="/datenschutz"'), "Footer verlinkt Impressum und Datenschutz");
  for (const m of html.matchAll(/<a [^>]*href="(\/[^"#]*)(#[^"]*)?"/g)) seen.add(m[1] || "/");
}

console.log("\n== Interne Links");
for (const path of [...seen].sort()) {
  const { status } = await get(path);
  ok(status === 200, `${path} -> ${status}`);
}

console.log("\n== Sonstiges");
const nf = await get("/gibt-es-nicht");
ok(nf.status === 404, "unbekannte Route liefert 404");
const robots = await get("/robots.txt");
ok(robots.status === 200 && robots.text.includes("Sitemap:"), "robots.txt mit Sitemap");
const sitemap = await get("/sitemap.xml");
ok(sitemap.status === 200 && sitemap.text.includes("/writing/10-brutally-honest-journaling-questions"), "sitemap.xml enthaelt Artikel");
for (const [from, to] of [["/ai.html", "/ai"], ["/projects.html", "/lifequest"], ["/map", "/"], ["/blog/messy-middle", "/writing/messy-middle"]]) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  ok([301, 307, 308].includes(res.status) && (res.headers.get("location") ?? "").endsWith(to), `Weiterleitung ${from} -> ${to}`);
}
const og = await get("/opengraph-image");
ok(og.status === 200 && og.type.includes("image/png"), "opengraph-image liefert PNG");

console.log(`\n${failures === 0 ? "ALLE PRUEFUNGEN BESTANDEN" : `${failures} PRUEFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
