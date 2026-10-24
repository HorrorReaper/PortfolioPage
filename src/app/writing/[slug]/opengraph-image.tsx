import { ImageResponse } from "next/og";
import { getAllArticles, getArticle } from "@/lib/articles";
import { OG_SIZE, OgCard } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export default async function ArticleOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = getArticle(slug)?.title ?? SITE.title;

  return new ImageResponse(<OgCard title={title} footer="patrickeger.com/writing" titleSize={66} />, size);
}
