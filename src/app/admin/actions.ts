"use server";

import fs from "node:fs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getArticle } from "@/lib/articles";
import {
  articlePath,
  assertLocalAdmin,
  deleteArticleFile,
  removeProject,
  removeUploadedImage,
  renameUploadedImage,
  saveImage,
  slugify,
  upsertProject,
  writeArticle,
} from "@/lib/content-write";
import { getProject } from "@/lib/projects";

export type FormState = { error?: string };

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const upload = (data: FormData, key: string) => {
  const file = data.get(key);
  return file instanceof File && file.size > 0 ? file : null;
};

function refreshSite() {
  revalidatePath("/", "layout");
}

/* ---------- Beitraege ---------- */

export async function savePost(_: FormState, data: FormData): Promise<FormState> {
  assertLocalAdmin();
  const originalSlug = text(data, "originalSlug");
  const title = text(data, "title");
  const description = text(data, "description");
  const body = String(data.get("body") ?? "").trim();
  const date = text(data, "date");
  const topic = text(data, "newTopic") || text(data, "topic");
  const slug = slugify(text(data, "slug") || title);
  const imageAlt = text(data, "imageAlt");
  const source = text(data, "source");
  const image = upload(data, "image");

  if (!title || !description || !body) return { error: "Titel, Kurzbeschreibung und Text sind Pflichtfelder." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Bitte ein gültiges Datum angeben." };
  if (!slug) return { error: "Aus dem Titel ließ sich keine URL bilden. Bitte einen Slug eintragen." };
  if (slug !== originalSlug && fs.existsSync(articlePath(slug))) {
    return { error: `Es gibt bereits einen Beitrag mit der URL /writing/${slug}.` };
  }
  if (source && !/^https?:\/\//.test(source)) return { error: "Die Quelle muss mit http:// oder https:// beginnen." };

  const existing = originalSlug ? getArticle(originalSlug) : undefined;
  const removeImage = data.get("removeImage") === "on";
  if ((image || (existing?.image && !removeImage)) && !imageAlt) {
    return { error: "Bitte einen Alternativtext für das Bild angeben." };
  }

  let imagePath = existing?.image;
  try {
    if (removeImage) {
      await removeUploadedImage(imagePath);
      imagePath = undefined;
    }
    if (image) imagePath = await saveImage(image, "posts", slug);
    else if (existing && slug !== originalSlug) imagePath = await renameUploadedImage(imagePath, "posts", slug);

    await writeArticle({
      slug,
      title,
      date,
      description,
      body,
      topic: topic || undefined,
      image: imagePath,
      imageAlt: imagePath ? imageAlt : undefined,
      source: source || undefined,
      tags: existing?.tags,
      lang: existing?.lang,
    });
    if (existing && slug !== originalSlug) await deleteArticleFile(originalSlug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." };
  }

  refreshSite();
  redirect(`/admin?saved=${encodeURIComponent(title)}`);
}

export async function deletePost(data: FormData) {
  assertLocalAdmin();
  const slug = slugify(text(data, "slug"));
  const article = getArticle(slug);
  if (article) {
    await removeUploadedImage(article.image);
    await deleteArticleFile(slug);
  }
  refreshSite();
  redirect("/admin?deleted=1");
}

/* ---------- Projekte ---------- */

export async function saveProject(_: FormState, data: FormData): Promise<FormState> {
  assertLocalAdmin();
  const originalSlug = text(data, "originalSlug");
  const name = text(data, "name");
  const slug = slugify(text(data, "slug") || name);
  const kind = text(data, "kind");
  const href = text(data, "href");
  const description = text(data, "text");
  const imageAlt = text(data, "imageAlt");
  const image = upload(data, "image");

  if (!name || !kind || !description) return { error: "Name, Art und Beschreibung sind Pflichtfelder." };
  if (!/^https?:\/\//.test(href)) return { error: "Der Link muss mit http:// oder https:// beginnen." };
  if (!slug) return { error: "Bitte einen Slug eintragen." };
  if (slug !== originalSlug && getProject(slug)) return { error: `Es gibt bereits ein Projekt mit dem Slug ${slug}.` };

  const existing = originalSlug ? getProject(originalSlug) : undefined;
  if (!existing && !image) return { error: "Neue Projekte brauchen ein Bild (z. B. einen Screenshot)." };
  if (!imageAlt) return { error: "Bitte einen Alternativtext für das Bild angeben." };

  try {
    let imagePath = existing?.image ?? "";
    if (image) imagePath = await saveImage(image, "projects", slug);
    else if (existing && slug !== originalSlug) imagePath = (await renameUploadedImage(imagePath, "projects", slug)) ?? "";

    await upsertProject({ slug, name, kind, href, text: description, image: imagePath, imageAlt }, existing?.slug);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Speichern fehlgeschlagen." };
  }

  refreshSite();
  redirect(`/admin?saved=${encodeURIComponent(name)}`);
}

export async function deleteProject(data: FormData) {
  assertLocalAdmin();
  const slug = slugify(text(data, "slug"));
  const project = getProject(slug);
  if (project) {
    await removeUploadedImage(project.image);
    await removeProject(slug);
  }
  refreshSite();
  redirect("/admin?deleted=1");
}
