/**
 * Zentrale Inhalte und Konfiguration der Website (Sprache: Englisch).
 * Alle Fakten stammen aus dem Briefing oder aus den verlinkten, oeffentlichen Quellen.
 */

export const SITE = {
  name: "Patrick Eger",
  url: "https://patrickeger.com",
  locale: "en_US",
  title: "Patrick Eger: Entrepreneurship, AI and Self-Development",
  description:
    "I combine entrepreneurship, AI & tech and self-development to become the best version of myself and live my best life.",
} as const;

export const LINKS = {
  newsletter: "https://patricke004.substack.com/subscribe",
  /** Offizielles Substack-Einbettungsformular (POST, Feld "email"). */
  newsletterSubmit: "https://patricke004.substack.com/api/v1/free?nojs=true",
  newsletterHome: "https://patricke004.substack.com/",
  lifequest: "https://uselifequest.com/",
  /** Die oeffentlich nutzbare App (laut Patrick live, Oktober 2026). */
  lifequestApp: "https://lifequest-bice-beta.vercel.app/",
  linkedin: "https://www.linkedin.com/in/patrick-eger-ba22b1212/",
  medium: "https://medium.com/@pe.business007",
  substack: "https://substack.com/@patricke3",
  github: "https://github.com/HorrorReaper",
  developer: "https://patrickeger.vercel.app/",
  improvementAcademy: "https://improvement-academy.com/",
} as const;

/** Anbieterangaben fuer Impressum und Datenschutzerklaerung (Rechtstexte bleiben auf Deutsch). */
export const LEGAL = {
  name: "Patrick Eger",
  street: "Am Ziegenrücken 24",
  city: "01809 Dohna",
  email: "pe.business004@outlook.de",
  updated: "Oktober 2026",
} as const;

export const LEGAL_NAV = [
  { label: "Imprint", href: "/impressum" },
  { label: "Privacy", href: "/datenschutz" },
] as const;

/**
 * Portraet fuer den Hero. Solange es null ist, zeigt die Website keine Platzhalterbilder.
 * Datei nach public/images/ legen und hier eintragen, z. B.:
 * { src: "/images/patrick.jpg", alt: "Portrait of Patrick Eger", width: 1200, height: 1500 }
 */
export type Portrait = { src: string; alt: string; width: number; height: number };
export const PORTRAIT: Portrait | null = {
  src: "/images/patrick.jpg",
  alt: "Portrait of Patrick Eger",
  width: 400,
  height: 400,
};

export const CTA_LABEL = "Join the newsletter";
export const NEW_TAB_LABEL = " (opens in a new tab)";

export const SOCIALS = [
  { label: "LinkedIn", href: LINKS.linkedin },
  { label: "Medium", href: LINKS.medium },
  { label: "Substack", href: LINKS.substack },
  { label: "GitHub", href: LINKS.github },
] as const;

export const NAV = [
  { label: "AI", href: "/ai" },
  { label: "Fitness", href: "/fitness" },
  { label: "LifeQuest", href: "/lifequest" },
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
] as const;

/** Reihenfolge der Unterseiten fuer den "Next"-Link am Seitenende (Rundgang). */
export const ROOMS = [
  { label: "AI & Tech", href: "/ai" },
  { label: "Writing", href: "/writing" },
  { label: "Fitness", href: "/fitness" },
  { label: "LifeQuest", href: "/lifequest" },
  { label: "Projects", href: "/projects" },
] as const;

export const nextRoom = (href: string) => {
  const i = ROOMS.findIndex((r) => r.href === href);
  return ROOMS[(i + 1) % ROOMS.length];
};

/** Die drei Saeulen: Unternehmertum, KI/Tech und Selbstentwicklung. */
export const PILLARS = [
  {
    title: "Entrepreneurship",
    text: "I'm building my own product, LifeQuest, and I build websites and landing pages for local businesses. Building things is how I learn fastest.",
  },
  {
    title: "AI & Tech",
    text: "As a business development working student at an AI SaaS startup, I see what AI changes in practice. I use new tools wherever they make me faster and better.",
  },
  {
    title: "Self-Development",
    text: "Journaling, training and clear habits are the foundation. Without them, neither the business nor the tech gets me where I want to go.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    title: "Write",
    text: "Pick a template like a morning briefing, evening review or weekly review, or build your own.",
  },
  {
    title: "Finish",
    text: "Earn XP for completed entries, tasks and habits.",
  },
  {
    title: "Level up",
    text: "Your character levels up, and you spend the coins you earn to customize it.",
  },
] as const;

export const LIFEQUEST = {
  name: "LifeQuest",
  href: LINKS.lifequest,
  image: "/images/lifequest.webp",
  imageAlt: "LifeQuest homepage with the headline “Your life is a game” and a sample overview of habits and tasks",
  appImage: "/images/lifequest-app.webp",
  appImageAlt: "Sample LifeQuest view: level, streak and XP progress, habits, a task and the question of the day",
  intro: "LifeQuest is where all three meet: my own business, built as a web app, made for self-development.",
  text: "It combines journaling with tasks, habits and daily plans. Every entry, finished task and habit earns XP, so showing up becomes a game.",
  status: "The app is live and free to use. Challenges are in progress, mobile apps for iOS and Android are planned.",
} as const;

export type ExternalPost = { title: string; date: string; slug: string };

/** Beitraege aus dem Newsletter "Improvement Academy" (Substack), Stand 2026-10-24. */
export const EXTERNAL_POSTS: ExternalPost[] = [
  { title: "Stop Living on Autopilot: 4 Mental Models for a Better Life", date: "2026-06-29", slug: "stop-living-on-autopilot-4-mental" },
  { title: "11 Lessons on how to achieve Peak Performance by Rian Doris ( and How to Actually Use Them)", date: "2026-01-14", slug: "11-lessons-on-how-to-achieve-peak" },
  { title: "The 9-Principle System I used to Master any Skill in 90 days", date: "2025-12-26", slug: "the-9-principle-system-i-used-to" },
  { title: "Andrew Carnegie's 18 Principles: The Timeless Blueprint for Building Wealth and Character", date: "2025-11-30", slug: "andrew-carnegies-18-principles-the" },
  { title: "What John D Rockefeller Taught Me About Not Burning Out Like an Idiot", date: "2025-11-01", slug: "what-john-d-rockefeller-taught-me" },
  { title: "Why doing things the right way gives you so much joy", date: "2025-10-19", slug: "why-doing-things-the-right-way-gives" },
  { title: "Stop Chasing 15 Goals: The ONE-Thing Protocol That Creates Unstoppable Momentum in 90 Days", date: "2025-10-02", slug: "stop-chasing-15-goals-the-one-thing" },
  { title: "The Visualization Technique That Actually Works, at least for me :)", date: "2025-09-05", slug: "the-visualization-technique-that" },
  { title: "How to get more done in 1 day than most people get done in 1 week", date: "2025-08-02", slug: "how-to-get-more-done-in-1-day-than" },
  { title: "From an austrian village to a global superstar, this is what I learned from Arnold Schwarzenegger", date: "2025-04-23", slug: "from-an-austrian-village-to-a-global" },
  { title: "50 facts every health expert agrees on( part 4 )", date: "2025-01-12", slug: "50-facts-every-health-expert-agrees-286" },
];

export const substackPostUrl = (slug: string) => `https://patricke004.substack.com/p/${slug}`;

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
