import fs from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

const emblem = `data:image/svg+xml;base64,${fs
  .readFileSync(path.join(process.cwd(), "public", "brand", "logo-b-emblem.svg"))
  .toString("base64")}`;

/** Gemeinsames Layout der Social-Vorschaubilder: Emblem und Name oben, Titel, Fusszeile. */
export function OgCard({ title, footer, titleSize = 80 }: { title: string; footer: string; titleSize?: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#070914",
        color: "#e9ebf7",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <img src={emblem} width={96} height={96} alt="" />
        <div style={{ fontSize: 36, color: "#ffb224", fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
          {SITE.name}
        </div>
      </div>
      <div style={{ fontSize: titleSize, lineHeight: 1.06, fontWeight: 700, letterSpacing: -1.5 }}>{title}</div>
      <div style={{ fontSize: 30, color: "#a3abcf" }}>{footer}</div>
    </div>
  );
}
