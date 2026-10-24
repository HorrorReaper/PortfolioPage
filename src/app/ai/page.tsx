import type { Metadata } from "next";
import Link from "next/link";
import { NextRoom } from "@/components/NextRoom";
import { SignalField } from "@/components/SignalField";
import { SubpageHero } from "@/components/SubpageHero";
import { getArticle } from "@/lib/articles";

const DESCRIPTION = "AI & tech: experiments, tools, automations and practical leverage for builders and small businesses.";

export const metadata: Metadata = {
  title: "AI & Tech",
  description: DESCRIPTION,
  alternates: { canonical: "/ai" },
  openGraph: {
    title: "AI & Tech | Patrick Eger",
    description: DESCRIPTION,
    url: "/ai",
    images: [{ url: "/images/hero-operator-social.jpg", width: 1200, height: 630, alt: "Founder desk with laptop and notebook" }],
  },
};

const EXPERIMENTS = [
  {
    label: "Experiments",
    title: "Prompt systems",
    text: "Reusable thinking workflows for strategy, writing, planning and product decisions.",
  },
  {
    label: "Automation",
    title: "SMB workflows",
    text: "Simple ways to remove repetitive work from sales, operations and customer follow-up.",
  },
  {
    label: "Builder log",
    title: "Technical reps",
    text: "Lessons from building LifeQuest and learning the tooling behind modern products.",
  },
];

const PRINCIPLES = [
  {
    title: "Utility first",
    text: "Every tool note should answer what changed, what saved time, or what became clearer.",
  },
  {
    title: "Judgment leads",
    text: "I use AI to expand options, challenge assumptions and speed up execution. Not to avoid deciding what matters.",
  },
  {
    title: "Proof over hype",
    text: "Workflows, examples and experiments come before big claims.",
  },
];

export default function AiPage() {
  const related = getArticle("judgment-before-tools");

  return (
    <>
      <SubpageHero
        kicker="AI & technology"
        title="AI as practical leverage."
        lead="Experiments, automations and technical lessons for more capable builders."
        backdrop={<SignalField />}
        image={{
          src: "/images/hero-operator.webp",
          alt: "Modern founder desk with laptop, notebook and a technology-focused workspace",
          width: 1586,
          height: 992,
        }}
        actions={
          <>
            <a className="btn btn--primary" href="#experiments">
              See the experiments
            </a>
            <Link className="btn btn--ghost" href="/lifequest">
              LifeQuest
            </Link>
          </>
        }
      />

      <section id="experiments" className="section" aria-labelledby="experiments-title">
        <div className="wrap lab-grid">
          <article className="lab-card lab-card--large reveal">
            <p className="kicker">Current angle</p>
            <h2 id="experiments-title" className="h2">
              AI as a practical operating layer.
            </h2>
            <p>
              I&apos;m interested in AI that saves time, improves judgment and helps small businesses and founders
              execute with better systems.
            </p>
          </article>
          {EXPERIMENTS.map((e) => (
            <article key={e.title} className="lab-card reveal">
              <p className="kicker">{e.label}</p>
              <h3 className="h3">{e.title}</h3>
              <p>{e.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="principles-title">
        <div className="wrap pillars">
          <div className="pillars__head reveal">
            <h2 id="principles-title" className="h2">
              How I use <span className="accent">AI.</span>
            </h2>
            <p className="prose-narrow">Tools change quickly. Clear thinking compounds.</p>
          </div>
          <ul className="pillars__list">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="pillar reveal">
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
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

      <NextRoom current="/ai" />
    </>
  );
}
