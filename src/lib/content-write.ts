import fs from "node:fs/promises";
import path from "node:path";
import { ARTICLES_DIR, type Article } from "./articles";
import { getProjects, PROJECTS_FILE, type Project } from "./projects";

/**
 * Schreibzugriff auf content/ und public/images/ fuer das lokale Admin-Panel.
 * Wird nur im Entwicklungsmodus aufgerufen (siehe assertLocalAdmin).
 */

export function assertLocalAdmin() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Das Admin-Panel ist nur lokal (npm run dev) verfügbar.");
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Speichert ein hochgeladenes Bild als WebP (max. 1600 px breit, ohne Metadaten) und liefert den oeffentlichen Pfad. */
export async function saveImage(file: File, folder: "posts" | "projects", slug: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Bitte eine Bilddatei hochladen.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Das Bild ist größer als 10 MB.");

  const dir = path.join(process.cwd(), "public", "images", folder);
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, `${slug}.webp`);
  // Erst hier laden: sharp wird nur lokal im Admin gebraucht.
  const { default: sharp } = await import("sharp");
  await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(target);
  return `/images/${folder}/${slug}.webp`;
}

/** Entfernt ein vom Admin angelegtes Bild. Bilder ausserhalb der Admin-Ordner bleiben unangetastet. */
export async function removeUploadedImage(publicPath?: string) {
  if (!publicPath || !/^\/images\/(posts|projects)\/[a-z0-9-]+\.webp$/.test(publicPath)) return;
  await fs.rm(path.join(process.cwd(), "public", publicPath), { force: true });
}

/** Benennt ein vom Admin angelegtes Bild um, wenn sich der Slug aendert. */
export async function renameUploadedImage(publicPath: string | undefined, folder: "posts" | "projects", slug: string) {
  if (!publicPath || !publicPath.startsWith(`/images/${folder}/`)) return publicPath;
  const next = `/images/${folder}/${slug}.webp`;
  if (next === publicPath) return publicPath;
  await fs.rename(path.join(process.cwd(), "public", publicPath), path.join(process.cwd(), "public", next));
  return next;
}

const oneLine = (value: string) => value.replace(/\s*\r?\n\s*/g, " ").trim();

type ArticleInput = Pick<Article, "slug" | "title" | "date" | "description" | "body"> &
  Partial<Pick<Article, "topic" | "image" | "imageAlt" | "source" | "tags" | "lang">>;

export function articlePath(slug: string) {
  return path.join(ARTICLES_DIR, `${slug}.md`);
}

export async function writeArticle(a: ArticleInput) {
  const meta: [string, string | undefined][] = [
    ["title", a.title],
    ["date", a.date],
    ["lang", a.lang ?? "en"],
    ["description", a.description],
    ["topic", a.topic],
    ["image", a.image],
    ["imageAlt", a.imageAlt],
    ["source", a.source],
    ["tags", a.tags?.length ? a.tags.join(", ") : undefined],
  ];
  const head = meta
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${oneLine(v!)}`)
    .join("\n");
  const body = a.body.replace(/\r\n/g, "\n").trim();
  await fs.writeFile(articlePath(a.slug), `---\n${head}\n---\n\n${body}\n`, "utf8");
}

export async function deleteArticleFile(slug: string) {
  await fs.rm(articlePath(slug), { force: true });
}

export async function writeProjects(projects: Project[]) {
  await fs.writeFile(PROJECTS_FILE, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
}

export async function upsertProject(project: Project, previousSlug?: string) {
  const list = getProjects();
  const index = list.findIndex((p) => p.slug === (previousSlug ?? project.slug));
  if (index >= 0) list[index] = project;
  else list.push(project);
  await writeProjects(list);
}

export async function removeProject(slug: string) {
  await writeProjects(getProjects().filter((p) => p.slug !== slug));
}
