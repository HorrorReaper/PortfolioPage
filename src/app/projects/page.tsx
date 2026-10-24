import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NextRoom } from "@/components/NextRoom";
import { SubpageHero } from "@/components/SubpageHero";
import { WorksList } from "@/components/WorksList";
import { LIFEQUEST, LINKS, NEW_TAB_LABEL } from "@/lib/site";

const DESCRIPTION =
  "Projects by Patrick Eger: LifeQuest, a gamified self-development app, plus websites and landing pages for local businesses.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | Patrick Eger",
    description: DESCRIPTION,
    url: "/projects",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Patrick Eger" }],
  },
};

const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;

export default function ProjectsPage() {
  return (
    <>
      <SubpageHero
        kicker="Projects"
        title="Things I build."
        lead="My own product, plus websites and landing pages for local businesses. Building is how I learn fastest."
        actions={
          <>
            <a className="btn btn--primary" href="#lifequest">
              Start with LifeQuest
            </a>
            <a className="btn btn--ghost" href="#web">
              Web projects
            </a>
          </>
        }
      />

      <section id="lifequest" className="section" aria-labelledby="lq-title">
        <div className="wrap product">
          <div className="product__visual reveal">
            <div className="frame">
              <Image
                src={LIFEQUEST.appImage}
                alt={LIFEQUEST.appImageAlt}
                width={1160}
                height={1100}
                sizes="(min-width: 960px) 380px, 80vw"
              />
            </div>
          </div>
          <div className="product__copy reveal">
            <p className="kicker">My product</p>
            <h2 id="lq-title" className="h2">
              {LIFEQUEST.name}
            </h2>
            <p>{LIFEQUEST.intro}</p>
            <p className="prose-narrow">{LIFEQUEST.text}</p>
            <div className="subhero__actions">
              <Link className="btn btn--primary" href="/lifequest">
                About LifeQuest
              </Link>
              <a className="btn btn--ghost" href={LINKS.lifequestApp} target="_blank" rel="noopener noreferrer">
                Open the app
                <span className="btn__arrow" aria-hidden="true">
                  ↗
                </span>
                {NEW_TAB}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="web" className="section" aria-labelledby="web-title">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <h2 id="web-title" className="h2">
                Web projects
              </h2>
              <p className="prose-narrow">Landing pages and websites I&apos;ve built for local businesses and for myself.</p>
            </div>
          </div>
          <WorksList />
        </div>
      </section>

      <section className="section" aria-labelledby="code-title">
        <div className="wrap">
          <a className="related reveal" href={LINKS.developer} target="_blank" rel="noopener noreferrer">
            <span className="kicker">More code</span>
            <span id="code-title" className="related__title">
              Developer portfolio
            </span>
            <span className="related__text">My developer portfolio with more technical work.</span>
            <span className="feed__more">
              Visit <span aria-hidden="true">↗</span>
              {NEW_TAB}
            </span>
          </a>
          <p className="meta" style={{ marginTop: "1rem" }}>
            Code on{" "}
            <a className="link" href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
              {NEW_TAB}
            </a>
            .
          </p>
        </div>
      </section>

      <NextRoom current="/projects" />
    </>
  );
}
