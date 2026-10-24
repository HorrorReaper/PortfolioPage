import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getProject } from "@/lib/projects";
import { deleteProject } from "../../actions";

type Props = { params: Promise<{ slug: string }> };

export default async function EditProjectPage({ params }: Props) {
  const { slug } = await params;
  const isNew = slug === "new";
  const project = isNew ? undefined : getProject(slug);
  if (!isNew && !project) notFound();

  return (
    <section className="admin__section">
      <div className="section-head">
        <div>
          <Link href="/admin" className="article__back">
            ← Übersicht
          </Link>
          <h1 className="h2">{isNew ? "Neues Projekt" : "Projekt bearbeiten"}</h1>
        </div>
        {project && (
          <DeleteForm
            action={deleteProject}
            slug={project.slug}
            label="Projekt löschen"
            confirmText={`„${project.name}“ wirklich löschen? Das lässt sich nicht rückgängig machen.`}
          />
        )}
      </div>
      <ProjectForm project={project} />
    </section>
  );
}
