"use client";

import { useActionState } from "react";
import { type FormState, savePost } from "@/app/admin/actions";
import type { Article } from "@/lib/articles";
import { ImageField } from "./ImageField";

type Props = { post?: Article; topics: string[] };

export function PostForm({ post, topics }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePost, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="admin-form">
      <input type="hidden" name="originalSlug" value={post?.slug ?? ""} />

      {state.error && (
        <p className="admin__error" role="alert">
          {state.error}
        </p>
      )}

      <div className="admin-form__grid">
        <div className="field field--wide">
          <label htmlFor="title">Titel *</label>
          <input id="title" name="title" type="text" required defaultValue={post?.title} />
        </div>
        <div className="field">
          <label htmlFor="slug">URL-Slug</label>
          <input id="slug" name="slug" type="text" defaultValue={post?.slug} pattern="[a-z0-9-]*" />
          <p className="field__help">Leer lassen, dann wird er aus dem Titel gebildet. Ergibt /writing/slug.</p>
        </div>
        <div className="field">
          <label htmlFor="date">Datum *</label>
          <input id="date" name="date" type="date" required defaultValue={post?.date ?? today} />
        </div>
        <div className="field">
          <label htmlFor="topic">Thema</label>
          <select id="topic" name="topic" defaultValue={post?.topic ?? ""}>
            <option value="">Kein Thema</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="newTopic">Oder neues Thema</label>
          <input id="newTopic" name="newTopic" type="text" maxLength={40} />
        </div>
        <div className="field field--wide">
          <label htmlFor="description">Kurzbeschreibung * (Karte, Google, Social Media)</label>
          <textarea id="description" name="description" rows={2} required maxLength={300} defaultValue={post?.description} />
        </div>
        <div className="field field--wide">
          <label htmlFor="source">Zuerst erschienen auf (optional, URL)</label>
          <input id="source" name="source" type="url" defaultValue={post?.source} placeholder="https://" />
        </div>
      </div>

      <ImageField current={post?.image} currentAlt={post?.imageAlt} allowRemove />

      <div className="field">
        <label htmlFor="body">Text * (Markdown)</label>
        <textarea id="body" name="body" rows={22} required className="field__mono" defaultValue={post?.body} />
        <p className="field__help">
          ## Zwischenüberschrift, ### kleinere Überschrift, **fett**, *kursiv*, [Linktext](https://…), Listen mit „- “ oder „1. “, --- für eine
          Trennlinie. Absätze durch eine Leerzeile trennen.
        </p>
      </div>

      <div className="admin-form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Speichert…" : "Beitrag speichern"}
        </button>
      </div>
    </form>
  );
}
