import fs from "node:fs";
import path from "node:path";

export type Project = {
  slug: string;
  name: string;
  kind: string;
  href: string;
  image: string;
  imageAlt: string;
  text: string;
};

export const PROJECTS_FILE = path.join(process.cwd(), "content", "projects.json");

/** Webprojekte aus content/projects.json (wird im Admin-Panel gepflegt). */
export function getProjects(): Project[] {
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf8")) as Project[];
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
