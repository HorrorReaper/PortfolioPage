import type { ReactNode } from "react";

/**
 * Minimaler Markdown-Renderer ohne Abhaengigkeiten.
 * Unterstuetzt: ## / ### Ueberschriften, --- Trenner, - und 1. Listen, Absaetze,
 * **fett**, *kursiv* und [Text](URL).
 */

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}-${n++}`;
    if (m[1] !== undefined) out.push(<strong key={key}>{inline(m[1], key)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={key}>{m[2]}</em>);
    else
      out.push(
        <a key={key} href={m[4]} rel="noopener noreferrer">
          {m[3]}
        </a>,
      );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function lines(text: string, keyPrefix: string): ReactNode[] {
  return text.split("\n").flatMap((line, i, all) => {
    const parts = inline(line, `${keyPrefix}-l${i}`);
    return i < all.length - 1 ? [...parts, <br key={`${keyPrefix}-br${i}`} />] : parts;
  });
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        const key = `b${i}`;
        if (block === "---") return <hr key={key} />;
        if (block.startsWith("### ")) return <h3 key={key}>{inline(block.slice(4), key)}</h3>;
        if (block.startsWith("## ")) {
          const title = block.slice(3);
          return (
            <h2 key={key} id={slugify(title)}>
              {inline(title, key)}
            </h2>
          );
        }
        if (block.split("\n").every((l) => l.startsWith("- "))) {
          return (
            <ul key={key}>
              {block.split("\n").map((l, j) => (
                <li key={`${key}-${j}`}>{inline(l.slice(2), `${key}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (block.split("\n").every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={key}>
              {block.split("\n").map((l, j) => (
                <li key={`${key}-${j}`}>{inline(l.replace(/^\d+\. /, ""), `${key}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        const isStep = block.startsWith("**Step ");
        return (
          <p key={key} className={isStep ? "step" : undefined}>
            {lines(block, key)}
          </p>
        );
      })}
    </>
  );
}
