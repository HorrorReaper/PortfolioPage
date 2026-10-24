import Image from "next/image";
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { getProjects } from "@/lib/projects";
import { formatDate } from "@/lib/site";

type Props = { searchParams: Promise<{ saved?: string; deleted?: string }> };

export default async function AdminDashboard({ searchParams }: Props) {
  const { saved, deleted } = await searchParams;
  const articles = getAllArticles();
  const projects = getProjects();

  return (
    <>
      {saved && (
        <p className="admin__notice" role="status">
          Gespeichert: {saved}
        </p>
      )}
      {deleted && (
        <p className="admin__notice" role="status">
          Gelöscht.
        </p>
      )}

      <section className="admin__section" aria-labelledby="admin-posts">
        <div className="section-head">
          <h1 id="admin-posts" className="h2">
            Beiträge
          </h1>
          <Link className="btn btn--primary" href="/admin/posts/new">
            Neuer Beitrag
          </Link>
        </div>
        <ul className="admin-list">
          {articles.map((a) => (
            <li key={a.slug} className="admin-list__item">
              <div className="admin-list__thumb">
                {a.image ? <Image src={a.image} alt="" width={160} height={100} /> : <span>Kein Bild</span>}
              </div>
              <div className="admin-list__body">
                <strong>{a.title}</strong>
                <span className="meta">
                  {formatDate(a.date)}
                  {a.topic ? `, ${a.topic}` : ""}, /writing/{a.slug}
                </span>
              </div>
              <div className="admin-list__actions">
                <Link className="btn btn--ghost btn--small" href={`/writing/${a.slug}`}>
                  Ansehen
                </Link>
                <Link className="btn btn--primary btn--small" href={`/admin/posts/${a.slug}`}>
                  Bearbeiten
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin__section" aria-labelledby="admin-projects">
        <div className="section-head">
          <h2 id="admin-projects" className="h2">
            Webprojekte
          </h2>
          <Link className="btn btn--primary" href="/admin/projects/new">
            Neues Projekt
          </Link>
        </div>
        <ul className="admin-list">
          {projects.map((p) => (
            <li key={p.slug} className="admin-list__item">
              <div className="admin-list__thumb">
                <Image src={p.image} alt="" width={160} height={100} />
              </div>
              <div className="admin-list__body">
                <strong>{p.name}</strong>
                <span className="meta">
                  {p.kind}, {p.href}
                </span>
              </div>
              <div className="admin-list__actions">
                <Link className="btn btn--primary btn--small" href={`/admin/projects/${p.slug}`}>
                  Bearbeiten
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="meta">
          Erscheinen auf der Startseite und unter /projects. LifeQuest hat eine eigene Seite und wird im Code gepflegt.
        </p>
      </section>
    </>
  );
}
