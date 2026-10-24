import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/site";
import { BrandMark } from "./BrandMark";

/** Beitragskarte mit Bild, Datum und Titel (Writing-Uebersicht). */
export function PostCard({ post, priority = false }: { post: Article; priority?: boolean }) {
  return (
    <article className="post-card">
      <div className="post-card__media">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.imageAlt ?? ""}
            width={800}
            height={500}
            priority={priority}
            sizes="(min-width: 1100px) 380px, (min-width: 700px) 45vw, 100vw"
          />
        ) : (
          <div className="post-card__fallback">
            <BrandMark className="post-card__mark" />
          </div>
        )}
      </div>
      <div className="post-card__body">
        <p className="post-card__meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.topic && <span>{post.topic}</span>}
        </p>
        <h3 className="post-card__title">
          <Link href={`/writing/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="post-card__more" aria-hidden="true">
          Continue reading →
        </p>
      </div>
    </article>
  );
}
