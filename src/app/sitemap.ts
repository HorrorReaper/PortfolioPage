import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const latest = articles[0]?.date;

  return [
    { url: SITE.url, lastModified: latest, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/writing`, lastModified: latest, changeFrequency: "monthly", priority: 0.8 },
    ...["/ai", "/fitness", "/lifequest", "/projects"].map((path) => ({
      url: `${SITE.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE.url}/impressum`, changeFrequency: "yearly" as const, priority: 0.2 },
    { url: `${SITE.url}/datenschutz`, changeFrequency: "yearly" as const, priority: 0.2 },
    ...articles.map((a) => ({
      url: `${SITE.url}/writing/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
