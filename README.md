# patrickeger.com

Personal brand website of Patrick Eger. English-language (legal pages in German), built with Next.js (App Router) and
TypeScript. Positioning: combining entrepreneurship, AI & tech and self-development to become the best version of
myself and live my best life.

Design "Quest": dark only (night blue, amber accent, subtle grid), Anton for display type, Geist for text,
JetBrains Mono for labels, chamfered corners instead of rounded ones. All tokens sit at the top of
[src/app/globals.css](src/app/globals.css).
No CSS framework, no UI library, no analytics. Runtime dependencies: `next`, `react`, `react-dom` and `three` (for the 3D map in
`src/components/NatureMap.tsx`, currently not linked; `/map` redirects home until it is reactivated).

## Pages

| Route | Content |
| --- | --- |
| `/` | Hero, how AI / entrepreneurship / personal growth connect, About, Projects, latest articles, newsletter |
| `/ai` | AI & Tech: current angle, experiments, how I use AI (animated signal field in the hero) |
| `/fitness` | Fitness: training standards and why fitness belongs to the brand |
| `/lifequest` | LifeQuest: the live app, how it works and its game principles |
| `/projects` | Projects overview: LifeQuest, web projects, developer portfolio |
| `/writing` | Writing index: on-site articles, Improvement Academy and the newsletter archive |
| `/writing/<slug>` | On-site articles (journaling questions plus three notes from the previous Astro site) |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon` | Generated SEO assets |

**Primary CTA:** "Join the newsletter". Inline signup forms in the hero, the closing block, the Writing index and
under every article post the email address directly to Substack's official embed endpoint
(`https://patricke004.substack.com/api/v1/free?nojs=true`, field `email`) and open Substack's confirmation page in a
new tab. The header button (desktop) links to `https://patricke004.substack.com/subscribe`. One label, one intent.
The form posts to Substack only when a visitor submits it; it was not submitted during development.

## Run locally

Requires Node.js 20.9 or newer (developed on Node 26).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production check:

```bash
npm run build
npm start -- -p 3100
npm run check        # smoke test against http://localhost:3100
npm run typecheck
```

`npm run check` ([scripts/check-site.mjs](scripts/check-site.mjs)) verifies status codes, title, description,
canonical, Open Graph, one `h1`, `alt` attributes, JSON-LD validity, no dash characters in visible text,
no placeholder text, the CTA target, internal links, 404 behaviour, robots and sitemap.

## Adding your portrait

The layout is designed like a personal-brand blog (tim.blog): with a portrait, the hero shows it in a frame on the left
(above the headline on mobile). Put the photo in `public/images/` and set `PORTRAIT` in
[src/lib/site.ts](src/lib/site.ts):

```ts
export const PORTRAIT: Portrait | null = { src: "/images/patrick.jpg", alt: "Patrick Eger", width: 1200, height: 1500 };
```

While `PORTRAIT` is `null`, no placeholder is shown and the hero uses the LifeQuest screenshot instead.
The current photo is 400 x 400 px; a version of at least 1000 px width will look sharper on high-density screens.

## Admin panel (local)

Run `npm run dev` and open <http://localhost:3000/admin>. There you can add, edit and delete

- **posts**: title, URL slug, date, topic, short description, cover image with alt text, Markdown body, optional
  original source. Saved as `content/articles/<slug>.md`, images as `public/images/posts/<slug>.webp`.
- **web projects**: name, type, link, one-line description and screenshot. Saved in `content/projects.json`, images as
  `public/images/projects/<slug>.webp`.

Uploaded images are converted to WebP (max. 1600 px wide, metadata stripped). The admin only exists in development:
in a production build `/admin` returns 404 and the save actions refuse to run. To publish, commit the changed files and
deploy (on Vercel: push to the main branch).

The Writing page shows the six newest posts as image cards and all posts grouped by topic, like tim.blog/new-start-here.
Posts without a cover image get a card with the logo instead.

## Where to change things

| What | Where |
| --- | --- |
| Name, URLs, nav, CTA label, projects, pillars, newsletter archive list, **portrait** | [src/lib/site.ts](src/lib/site.ts) |
| Homepage copy and layout | [src/app/page.tsx](src/app/page.tsx) |
| Colours, spacing, typography (light and dark tokens) | [src/app/globals.css](src/app/globals.css) |
| Articles | `content/articles/*.md` |
| Images | `public/images/` |

### Add an article

Create `content/articles/<slug>.md`. The slug becomes the URL (`/writing/<slug>`). Required frontmatter:

```md
---
title: Article title
date: 2026-11-01
lang: de            # or en; sets the lang attribute of the article body
description: One or two sentences for search results and social cards.
source: https://...  # where it was first published
tags: Tag one, Tag two
---

Body in Markdown: ## and ### headings, paragraphs, - lists, ---, **bold**, *italic*, [link](url).
```

Rebuild or redeploy. The index, sitemap, canonical URL, structured data and social image are generated automatically.

## Deployment (Vercel, recommended)

1. Put the project in a Git repository and push it to GitHub (`git init`, commit, create a repo, push).
   `.gitignore` already excludes `node_modules` and `.next`.
2. Go to <https://vercel.com/new>, import the repository. Framework preset is detected as Next.js.
   Build command `npm run build`, no environment variables are needed. Click **Deploy**.
3. In the Vercel project: **Settings, Domains**, add `patrickeger.com` and `www.patrickeger.com`.
   Set `patrickeger.com` as primary and let `www` redirect to it.
4. At your domain registrar set the DNS records Vercel shows (typically an `A` record `76.76.21.21` for the apex
   domain and a `CNAME` for `www` pointing to `cname.vercel-dns.com`; use the exact values Vercel displays).
5. Wait for the certificate (automatic HTTPS), then open <https://patrickeger.com> and run through the checklist below.
6. Submit `https://patrickeger.com/sitemap.xml` in Google Search Console.

Every push to the main branch redeploys automatically.

### Alternative: any Node host or Docker

```bash
npm ci && npm run build && npm start   # listens on port 3000, set PORT to change
```

Put it behind a reverse proxy (Caddy, nginx) with HTTPS. Node.js 20.9 or newer is required. Pages are statically
generated, so a CDN in front works well.

## Before going live

1. **Legal pages are in place** (`/impressum`, `/datenschutz`, linked in the footer). Data lives in `LEGAL` in
   [src/lib/site.ts](src/lib/site.ts). The privacy policy is written for exactly this setup: hosting on **Vercel**,
   no cookies, no analytics, self-hosted fonts, newsletter signup on Substack. **If you host elsewhere, or add
   analytics, a contact form or embeds, update [src/app/datenschutz/page.tsx](src/app/datenschutz/page.tsx).**
   Have the texts checked by a lawyer or a generator service if the site is used commercially.
2. In Vercel, accept the Data Processing Addendum (Settings, Legal) so the "Auftragsverarbeitung" statement is true.
3. Confirm the open points in the section below.

## Not on the site because the facts were missing

- Portrait photo (placeholder images were deliberately not published). See "Adding your portrait".
- University, study start, location, skills: the LinkedIn profile could not be read (LinkedIn blocks automated access).
- Anything about SpeechMind beyond "AI SaaS startup" and your role; no link to SpeechMind.
- A contact form. Contact is by e-mail (shown in the Impressum) or LinkedIn.
- Medium articles (Medium blocked access), testimonials, user numbers, achievements. None were invented.
- Newsletter publishing rhythm. Not stated anywhere, so not claimed.

## Imported from the previous Astro site

Subpages, the three blog notes and the images in `public/images/` (`hero-operator`, `fitness-discipline`,
`calm-journal`, `lifequest-concept`) come from `patrick-eger-portfolio`. Old URLs (`/ai.html`, `/blog/<slug>`,
`/nature-map.html` and so on) redirect permanently to the new routes (see `next.config.ts`).

## Logo

The logo is the "Emblem" (P and E in a hexagon). Files: `public/brand/logo-b-emblem.svg` (dark backgrounds) and
`logo-b-emblem-light.svg` (light backgrounds). It is used as favicon (`src/app/icon.svg`, `icon1.png`,
`apple-icon.png`), in header and footer (`src/components/BrandMark.tsx`) and in the social preview images
(`src/lib/og.tsx`). If you change the shape, update the SVG file and `BrandMark.tsx` together, then regenerate the PNG
icons. The unused concept A and a comparison page live at `/logos` (not indexed).
