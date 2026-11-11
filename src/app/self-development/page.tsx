import type { Metadata } from "next";
import Link from "next/link";
import { NextRoom } from "@/components/NextRoom";
import { PostCard } from "@/components/PostCard";
import { SubpageHero } from "@/components/SubpageHero";
import { getAllArticles } from "@/lib/articles";
import { EXTERNAL_POSTS, NEW_TAB_LABEL, substackPostUrl } from "@/lib/site";

const DESCRIPTION =
  "Self-development without the guru stuff: journaling, deep work, training and reading, the daily system behind everything else.";

export const metadata: Metadata = {
  title: "Self-Development",
  description: DESCRIPTION,
  alternates: { canonical: "/self-development" },
  openGraph: {
    title: "Self-Development | Patrick Eger",
    description: DESCRIPTION,
    url: "/self-development",
    images: [
      {
        url: "/images/calm-journal-social.jpg",
        width: 1200,
        height: 630,
        alt: "An open journal, pen, laptop and gym towel on a calm desk",
      },
    ],
  },
};

const HABITS = [
  {
    label: "Journaling",
    title: "Honest questions, daily.",
    text: "A few uncomfortable questions in the morning or evening. It's how I find out what I'm avoiding before it finds me.",
  },
  {
    label: "Deep work",
    title: "The big task goes first.",
    text: "The one thing that actually matters gets done before emails and notifications get a vote.",
  },
  {
    label: "Training",
    title: "Reps before mood.",
    text: "Bodybuilding is the non-negotiable. It taught me that consistency beats motivation, every single time.",
    href: "/fitness",
  },
  {
    label: "Reading & learning",
    title: "Build, don't just watch.",
    text: "Books, podcasts and new tools. And whenever possible, I learn by building instead of watching another tutorial.",
  },
];

/** Newsletter-Beitraege mit Bezug zu Selbstentwicklung (Slugs aus EXTERNAL_POSTS). */
const NEWSLETTER_PICKS = [
  "stop-living-on-autopilot-4-mental",
  "stop-chasing-15-goals-the-one-thing",
  "the-9-principle-system-i-used-to",
  "the-visualization-technique-that",
  "how-to-get-more-done-in-1-day-than",
];

const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;

export default function SelfDevelopmentPage() {
  const reads = getAllArticles().filter((a) => a.topic === "Self-development" || a.topic === "Fitness");
  const picks = EXTERNAL_POSTS.filter((p) => NEWSLETTER_PICKS.includes(p.slug));

  return (
    <>
      <SubpageHero
        kicker="Self-development"
        title="Leveling up, one boring habit at a time."
        lead="The system behind everything else: journaling, deep work, training and reading. No guru stuff, just what I actually do."
        image={{
          src: "/images/calm-journal.webp",
          alt: "Open journal, pen, laptop and gym towel on a calm desk",
          width: 1586,
          height: 992,
        }}
        actions={
          <>
            <a className="btn btn--primary" href="#system">
              My daily system
            </a>
            <Link className="btn btn--ghost" href="/writing/10-brutally-honest-journaling-questions">
              Journaling questions
            </Link>
          </>
        }
      />

      <section id="system" className="section" aria-labelledby="system-title">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <h2 id="system-title" className="h2">
                My daily <span className="accent">non-negotiables.</span>
              </h2>
              <p className="prose-narrow">
                Not glamorous, not new, and that&apos;s the point. These four keep the rest of my life from falling
                apart.
              </p>
            </div>
          </div>
          <div className="lab-grid habit-grid">
            {HABITS.map((h) => (
              <article key={h.label} className="lab-card reveal">
                <p className="kicker">{h.label}</p>
                <h3 className="h3">{h.title}</h3>
                <p>{h.text}</p>
                {h.href && (
                  <Link className="link" href={h.href}>
                    How I train
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="story-title">
        <div className="wrap statement reveal">
          <h2 id="story-title" className="h2">
            Your actions follow <span className="accent">your story.</span>
          </h2>
          <p className="lead">
            For years my story was &ldquo;I&apos;m addicted to sugar.&rdquo; So I acted like it. The day I rewrote it
            and started seeing myself as an athlete, the habits followed, and so did the scale.
          </p>
          <p className="prose-narrow">
            That&apos;s the core of self-development for me: change the story you tell yourself, then collect small
            proof every day that the new one is true.{" "}
            <Link className="link" href="/fitness">
              The full story is on the fitness page.
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="tool-title">
        <div className="wrap">
          <Link href="/lifequest" className="related reveal">
            <span className="kicker">The tool I built for this</span>
            <span id="tool-title" className="related__title">
              LifeQuest
            </span>
            <span className="related__text">
              Journal, habits, tasks and daily plans in one app that pays you XP for showing up. Because if
              self-development is a game anyway, it might as well have levels.
            </span>
            <span className="feed__more">
              Check it out <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="reads-title">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 id="reads-title" className="h2">
              Start reading here
            </h2>
            <Link className="btn btn--ghost" href="/writing">
              All articles
            </Link>
          </div>
          <div className="post-grid">
            {reads.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <section className="topic-box" aria-label="More from the newsletter" style={{ marginTop: "1rem" }}>
            <h3 className="topic-box__title">More from the newsletter</h3>
            <ul>
              {picks.map((post) => (
                <li key={post.slug}>
                  <a href={substackPostUrl(post.slug)} target="_blank" rel="noopener noreferrer">
                    {post.title}
                    {NEW_TAB}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <NextRoom current="/self-development" />
    </>
  );
}
