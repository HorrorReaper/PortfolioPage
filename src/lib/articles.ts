import fs from "node:fs";
import path from "node:path";

export type Article = {
  slug: string;
  title: string;
  date: string;
  lang: string;
  description: string;
  /** Ort der Erstveroeffentlichung, falls der Text zuerst woanders erschien. */
  source?: string;
  topic?: string;
  /** Titelbild fuer Karten und Artikelkopf, z. B. /images/posts/<slug>.webp */
  image?: string;
  imageAlt?: string;
  tags: string[];
  body: string;
  readingMinutes: number;
};

export const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

/** Themen fuer Gruppierung und Admin-Auswahl. Neue Themen entstehen automatisch, sobald ein Beitrag sie nutzt. */
export const DEFAULT_TOPICS = ["AI", "Fitness", "Founder path", "Self-development"];

function parse(slug: string, raw: string): Article {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) throw new Error(`Frontmatter fehlt in ${slug}.md`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const key of ["title", "date", "description"]) {
    if (!meta[key]) throw new Error(`Frontmatter-Feld "${key}" fehlt in ${slug}.md`);
  }

  const body = match[2].trim();
  const words = body.split(/\s+/).length;

  return {
    slug,
    title: meta.title,
    date: meta.date,
    lang: meta.lang ?? "en",
    description: meta.description,
    source: meta.source || undefined,
    topic: meta.topic || undefined,
    image: meta.image || undefined,
    imageAlt: meta.imageAlt || undefined,
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
    body,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

export function getAllArticles(): Article[] {
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(ARTICLES_DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((a) => a.slug === slug);
}

export function getTopics(): string[] {
  const used = getAllArticles().flatMap((a) => (a.topic ? [a.topic] : []));
  return [...new Set([...DEFAULT_TOPICS, ...used])].sort((a, b) => a.localeCompare(b));
}
