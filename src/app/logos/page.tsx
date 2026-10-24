import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo concepts",
  robots: { index: false, follow: false },
};

/** Vorschau der zwei Logo-Entwuerfe. Dateien liegen in public/brand/. */
const LOGOS = [
  {
    id: "a",
    name: "Ligature",
    idea: "P and E share one body: the bowl of the P closes into the stem of the E. One continuous shape, like one person building on two sides. Slanted like the Anton headlines, with the same chamfered corners as the site.",
    mark: "/brand/logo-a-ligature.svg",
    tile: "/brand/logo-a-ligature-tile.svg",
    light: "/brand/logo-a-ligature-dark.svg",
    files: ["logo-a-ligature.svg", "logo-a-ligature-tile.svg", "logo-a-ligature-dark.svg"],
  },
  {
    id: "b",
    name: "Emblem",
    idea: "P and E inside a hexagon, like a badge you unlock in a game. The hexagon picks up the LifeQuest shape from the site; P in white and E in amber split the name into its two parts.",
    mark: "/brand/logo-b-emblem.svg",
    tile: "/brand/logo-b-emblem.svg",
    light: "/brand/logo-b-emblem-light.svg",
    files: ["logo-b-emblem.svg", "logo-b-emblem-light.svg"],
  },
];

export default function LogosPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "5rem" }}>
      <header className="page-head">
        <p className="kicker">Brand</p>
        <h1 className="display">Two logo concepts.</h1>
        <p className="lead">Both built from P and E, both drawn as vector shapes in the Quest design.</p>
      </header>

      {LOGOS.map((logo) => (
        <section key={logo.id} className="logo-concept" aria-labelledby={`logo-${logo.id}`}>
          <div className="logo-concept__head">
            <p className="kicker">Concept {logo.id.toUpperCase()}</p>
            <h2 id={`logo-${logo.id}`} className="h2">
              {logo.name}
            </h2>
            <p className="prose-narrow">{logo.idea}</p>
          </div>

          <div className="logo-stage">
            <div className="logo-stage__cell logo-stage__cell--dark logo-stage__cell--hero">
              <img src={logo.mark} alt={`Logo concept ${logo.name} on night blue`} width={260} height={260} />
            </div>
            <div className="logo-stage__cell logo-stage__cell--light">
              <img src={logo.light} alt={`Logo concept ${logo.name} on a light background`} width={160} height={160} />
            </div>
            <div className="logo-stage__cell logo-stage__cell--dark logo-stage__lockup">
              <img src={logo.mark} alt="" width={64} height={64} />
              <span>Patrick Eger</span>
            </div>
            <div className="logo-stage__cell logo-stage__cell--dark logo-stage__sizes">
              {[64, 32, 16].map((size) => (
                <img key={size} src={logo.tile} alt={`App icon at ${size} pixels`} width={size} height={size} />
              ))}
            </div>
          </div>

          <p className="meta">
            Files:{" "}
            {logo.files.map((f, i) => (
              <span key={f}>
                <a className="link" href={`/brand/${f}`} download>
                  {f}
                </a>
                {i < logo.files.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </section>
      ))}
    </div>
  );
}
