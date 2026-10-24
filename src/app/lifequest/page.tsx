import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NextRoom } from "@/components/NextRoom";
import { SubpageHero } from "@/components/SubpageHero";
import { getArticle } from "@/lib/articles";
import { HOW_IT_WORKS, LIFEQUEST, LINKS, NEW_TAB_LABEL } from "@/lib/site";

const DESCRIPTION =
  "LifeQuest is a live, gamified self-development app by Patrick Eger: journaling, habits, quests and a city that grows as you do.";

export const metadata: Metadata = {
  title: "LifeQuest",
  description: DESCRIPTION,
  alternates: { canonical: "/lifequest" },
  openGraph: {
    title: "LifeQuest | Patrick Eger",
    description: DESCRIPTION,
    url: "/lifequest",
    images: [
      {
        url: "/images/lifequest-concept-social.jpg",
        width: 1200,
        height: 630,
        alt: "LifeQuest concept: turning real-world progress into a growing virtual city",
      },
    ],
  },
};

/** Spielprinzipien laut Astro-Projekt, von Patrick bestaetigt (Oktober 2026). */
const PRINCIPLES = [
  { title: "Log a real action", text: "Progress starts with something you actually did, not with an intention." },
  { title: "Proof before reward", text: "You get proof before you get rewarded. XP has to be earned." },
  { title: "Build with a crew", text: "Build momentum with a crew instead of alone, so someone keeps you honest." },
];

const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;

export default function ProjectsPage() {
  const related = getArticle("messy-middle");

  return (
    <>
      <SubpageHero
        kicker="LifeQuest"
        title="Your life is a game worth playing."
        lead="LifeQuest turns real-world progress into a city-building game: journaling, habits and quests earn XP that grows a city, with a crew to keep you honest. It's a live, working app, not a mockup."
        image={{
          src: "/images/lifequest-concept.webp",
          alt: "Notebook sketch of a quest map: habits and milestones along a path that leads to a growing city",
          width: 1448,
          height: 1086,
        }}
        actions={
          <>
            <a className="btn btn--primary" href={LINKS.lifequestApp} target="_blank" rel="noopener noreferrer">
              Open LifeQuest
              <span className="btn__arrow" aria-hidden="true">
                ↗
              </span>
              {NEW_TAB}
            </a>
            <Link className="btn btn--ghost" href="/ai">
              See the AI work
            </Link>
          </>
        }
      />

      <section className="section" aria-labelledby="how-title">
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
            <h2 id="how-title" className="h2">
              How it works
            </h2>
            <p className="prose-narrow">{LIFEQUEST.text}</p>
            <ul className="steps">
              {HOW_IT_WORKS.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="behavior-title">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <h2 id="behavior-title" className="h2">
                Built to prove <span className="accent">real behavior change.</span>
              </h2>
              <p className="prose-narrow">
                Every mechanic has to earn its place. That discipline is the actual product.
              </p>
            </div>
          </div>
          <div className="roadmap">
            {PRINCIPLES.map((p) => (
              <section key={p.title} className="roadmap__col is-done reveal">
                <h3 className="h3">{p.title}</h3>
                <p className="prose-narrow">{p.text}</p>
              </section>
            ))}
          </div>
          <div className="subhero__actions" style={{ marginTop: "2.5rem" }}>
            <a className="btn btn--primary" href={LINKS.lifequestApp} target="_blank" rel="noopener noreferrer">
              Start your quest
              <span className="btn__arrow" aria-hidden="true">
                ↗
              </span>
              {NEW_TAB}
            </a>
          </div>
        </div>
      </section>

      {related && (
        <section className="section" aria-labelledby="related-title">
          <div className="wrap">
            <Link href={`/writing/${related.slug}`} className="related reveal">
              <span className="kicker">Founder notes</span>
              <span id="related-title" className="related__title">
                {related.title}
              </span>
              <span className="related__text">{related.description}</span>
              <span className="feed__more">
                Read <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </section>
      )}

      <NextRoom current="/lifequest" />
    </>
  );
}
