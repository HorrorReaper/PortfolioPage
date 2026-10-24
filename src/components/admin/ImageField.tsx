"use client";

import { useState } from "react";

type Props = {
  current?: string;
  currentAlt?: string;
  allowRemove?: boolean;
  required?: boolean;
};

/** Bild-Upload mit Vorschau und Alternativtext. */
export function ImageField({ current, currentAlt, allowRemove = false, required = false }: Props) {
  const [preview, setPreview] = useState<string | undefined>(current);

  return (
    <fieldset className="field field--image">
      <legend>Bild</legend>
      <div className="field__preview">
        {preview ? (
          // Vorschau einer lokalen Datei: bewusst <img> statt next/image.
          <img src={preview} alt="" />
        ) : (
          <span>Noch kein Bild</span>
        )}
      </div>
      <label htmlFor="image">{current ? "Neues Bild hochladen (ersetzt das aktuelle)" : "Bild hochladen"}</label>
      <input
        id="image"
        name="image"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        required={required && !current}
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : current);
        }}
      />
      <p className="field__help">JPG, PNG, WebP oder AVIF, max. 10 MB. Wird automatisch als WebP (max. 1600 px) gespeichert.</p>

      <label htmlFor="imageAlt">Alternativtext (was ist auf dem Bild zu sehen?)</label>
      <input id="imageAlt" name="imageAlt" type="text" defaultValue={currentAlt} maxLength={200} />

      {allowRemove && current && (
        <label className="field__check">
          <input type="checkbox" name="removeImage" /> Bild entfernen
        </label>
      )}
    </fieldset>
  );
}
