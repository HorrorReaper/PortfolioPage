"use client";

import { useActionState } from "react";
import { type FormState, saveProject } from "@/app/admin/actions";
import type { Project } from "@/lib/projects";
import { ImageField } from "./ImageField";

export function ProjectForm({ project }: { project?: Project }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProject, {});

  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="originalSlug" value={project?.slug ?? ""} />

      {state.error && (
        <p className="admin__error" role="alert">
          {state.error}
        </p>
      )}

      <div className="admin-form__grid">
        <div className="field">
          <label htmlFor="name">Name *</label>
          <input id="name" name="name" type="text" required defaultValue={project?.name} />
        </div>
        <div className="field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" type="text" defaultValue={project?.slug} pattern="[a-z0-9-]*" />
          <p className="field__help">Leer lassen, dann wird er aus dem Namen gebildet.</p>
        </div>
        <div className="field">
          <label htmlFor="kind">Art * (z. B. Website, Landing page)</label>
          <input id="kind" name="kind" type="text" required defaultValue={project?.kind} list="kinds" />
          <datalist id="kinds">
            <option value="Website" />
            <option value="Landing page" />
            <option value="Web app" />
            <option value="Blog & newsletter brand" />
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="href">Link *</label>
          <input id="href" name="href" type="url" required defaultValue={project?.href} placeholder="https://" />
        </div>
        <div className="field field--wide">
          <label htmlFor="text">Beschreibung * (ein Satz, Englisch)</label>
          <textarea id="text" name="text" rows={2} required maxLength={240} defaultValue={project?.text} />
        </div>
      </div>

      <ImageField current={project?.image} currentAlt={project?.imageAlt} required />

      <div className="admin-form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Speichert…" : "Projekt speichern"}
        </button>
      </div>
    </form>
  );
}
