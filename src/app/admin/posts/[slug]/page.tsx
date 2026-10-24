import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { PostForm } from "@/components/admin/PostForm";
import { getArticle, getTopics } from "@/lib/articles";
import { deletePost } from "../../actions";

type Props = { params: Promise<{ slug: string }> };

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params;
  const isNew = slug === "new";
  const post = isNew ? undefined : getArticle(slug);
  if (!isNew && !post) notFound();

  return (
    <section className="admin__section">
      <div className="section-head">
        <div>
          <Link href="/admin" className="article__back">
            ← Übersicht
          </Link>
          <h1 className="h2">{isNew ? "Neuer Beitrag" : "Beitrag bearbeiten"}</h1>
        </div>
        {post && (
          <DeleteForm
            action={deletePost}
            slug={post.slug}
            label="Beitrag löschen"
            confirmText={`„${post.title}“ wirklich löschen? Das lässt sich nicht rückgängig machen.`}
          />
        )}
      </div>
      <PostForm post={post} topics={getTopics()} />
    </section>
  );
}
