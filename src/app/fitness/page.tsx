import type { Metadata } from "next";
import Link from "next/link";
import { NextRoom } from "@/components/NextRoom";
import { SubpageHero } from "@/components/SubpageHero";
import { getArticle } from "@/lib/articles";

const DESCRIPTION =
  "Fitness: bodybuilding discipline, training standards and the physical side of self-development.";

export const metadata: Metadata = {
  title: "Fitness",
  description: DESCRIPTION,
  alternates: { canonical: "/fitness" },
  openGraph: {
    title: "Fitness | Patrick Eger",
    description: DESCRIPTION,
    url: "/fitness",
    images: [
      {
        url: "/images/fitness-discipline-social.jpg",
        width: 1200,
        height: 630,
        alt: "A quiet gym setup with a training log, lifting belt, chalk and barbell",
      },
    ],
  },
};

const STANDARDS = [
  {
    label: "Consistency",
    title: "Reps before mood.",
    text: "Do the work when motivation is low. That is where identity gets built.",
  },
  {
    label: "Tracking",
    title: "Measure what matters.",
    text: "Training is a reminder that vague effort becomes stronger when it is recorded.",
  },
  {
    label: "Recovery",
    title: "Growth needs repair.",
    text: "Recovery is not softness. It is part of the system that lets intensity compound.",
  },
];

export default function FitnessPage() {
  const related = getArticle("discipline-feels-quiet");

  return (
    <>
      <SubpageHero
        kicker="Fitness & health"
        title="Physical discipline is the base layer."
        lead="Bodybuilding keeps ambition honest: show up, track the reps, recover, repeat."
        image={{
          src: "/images/fitness-discipline.webp",
          alt: "Training log, lifting belt, chalk and barbell in a quiet gym",
          width: 1586,
          height: 992,
        }}
        actions={
          <>
            <a className="btn btn--primary" href="#standards">
              Training standards
            </a>
            {related && (
              <Link className="btn btn--ghost" href={`/writing/${related.slug}`}>
                Read the notes
              </Link>
            )}
          </>
        }
      />

      <section id="standards" className="section" aria-labelledby="standards-title">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 id="standards-title" className="h2">
              Training <span className="accent">standards.</span>
            </h2>
          </div>
          <div className="standards">
            {STANDARDS.map((s) => (
              <article key={s.label} className="standard reveal">
                <p className="kicker">{s.label}</p>
                <h3 className="h3">{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="why-title">
        <div className="wrap statement reveal">
          <h2 id="why-title" className="h2">
            Why fitness belongs here.
          </h2>
          <p className="lead">
            Fitness is not a side interest. It is the most visible proof that standards, patience and repetition can
            change a person.
          </p>
        </div>
      </section>

      {related && (
        <section className="section" aria-labelledby="related-title">
          <div className="wrap">
            <Link href={`/writing/${related.slug}`} className="related reveal">
              <span className="kicker">Related note</span>
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

      <NextRoom current="/fitness" />
    </>
  );
}
