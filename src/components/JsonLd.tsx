/** Rendert strukturierte Daten (schema.org) als JSON-LD. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // "<" wird maskiert, damit der Inhalt nie ein </script> erzeugen kann.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
