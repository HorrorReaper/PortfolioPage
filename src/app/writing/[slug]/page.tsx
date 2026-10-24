import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getAllArticles, getArticle } from "@/lib/articles";
import { Markdown } from "@/lib/markdown";
import { formatDate, SITE } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `/writing/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      authors: [SITE.name],
      tags: article.tags,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: article.lang,
    datePublished: article.date,
    mainEntityOfPage: `${SITE.url}/writing/${article.slug}`,
    author: { "@type": "Person", name: SITE.name, url: SITE.url },
    keywords: article.tags.join(", "),
  };

  return (
    <article className="wrap article">
      <header className="article__head">
        <Link href="/writing" className="article__back">
          ← All articles
        </Link>
        <h1 className="article__title" lang={article.lang}>
          {article.title}
        </h1>
        <p className="meta">
          {article.topic && <>{article.topic}, </>}
          <time dateTime={article.date}>{formatDate(article.date)}</time>, {article.readingMinutes} min read, by{" "}
          {SITE.name}
        </p>
        {article.source && (
          <p className="article__notice">
            First published in my newsletter Improvement Academy on Substack:{" "}
            <a className="link" href={article.source} target="_blank" rel="noopener noreferrer">
              read the original
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        )}
      </header>

      {article.image && (
        <div className="article__cover">
          <div className="frame">
            <Image
              src={article.image}
              alt={article.imageAlt ?? ""}
              width={1600}
              height={1000}
              priority
              sizes="(min-width: 1060px) 992px, 100vw"
            />
          </div>
        </div>
      )}

      <div className="prose" lang={article.lang}>
        <Markdown source={article.body} />
      </div>

      <aside className="article__end" aria-labelledby="art-newsletter-title">
        <h2 id="art-newsletter-title" className="h2">
          More of this in the newsletter.
        </h2>
        <p className="prose-narrow">
          In my newsletter Improvement Academy, I write about AI, business, health and personal growth.
        </p>
        <NewsletterForm id="nl-article" />
      </aside>

      <JsonLd data={jsonLd} />
    </article>
  );
}
