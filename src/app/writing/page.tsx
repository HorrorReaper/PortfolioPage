import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { NextRoom } from "@/components/NextRoom";
import { PostCard } from "@/components/PostCard";
import { getAllArticles } from "@/lib/articles";
import { EXTERNAL_POSTS, LINKS, NEW_TAB_LABEL, substackPostUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes from the climb: articles on entrepreneurship, AI, fitness and self-development. On this site and in the Improvement Academy newsletter.",
  alternates: { canonical: "/writing" },
};

const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;
const RECENT_COUNT = 6;

export default function WritingIndexPage() {
  const articles = getAllArticles();
  const recent = articles.slice(0, RECENT_COUNT);

  // Nach Thema gruppiert, wie "Popular blog posts by topic" bei tim.blog.
  const byTopic = articles.reduce<Record<string, typeof articles>>((acc, a) => {
    (acc[a.topic ?? "More notes"] ??= []).push(a);
    return acc;
  }, {});
  const topics = Object.keys(byTopic).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <div className="wrap">
        <header className="page-head">
          <p className="kicker">Writing</p>
          <h1 className="display">Notes from the climb.</h1>
          <p className="lead">
            Notes on discipline, AI, training and the founder path. Lessons, systems and honest notes from the road to
            my best self.
          </p>
        </header>

        <section className="index-group" aria-labelledby="recent-title">
          <h2 id="recent-title" className="h2">
            Most recent posts
          </h2>
          <div className="post-grid">
            {recent.map((post, i) => (
              <PostCard key={post.slug} post={post} priority={i < 3} />
            ))}
          </div>
        </section>

        <section className="index-group" aria-labelledby="topics-title">
          <h2 id="topics-title" className="h2">
            Posts by <span className="accent">topic</span>
          </h2>
          <div className="topic-grid">
            {topics.map((topic) => (
              <section key={topic} className="topic-box" aria-label={topic}>
                <h3 className="topic-box__title">{topic}</h3>
                <ul>
                  {byTopic[topic].map((a) => (
                    <li key={a.slug}>
                      <Link href={`/writing/${a.slug}`}>{a.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <section className="topic-box" aria-label="From the newsletter">
              <h3 className="topic-box__title">From the newsletter</h3>
              <ul>
                {EXTERNAL_POSTS.map((post) => (
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

        <section className="index-group" aria-labelledby="academy-title">
          <a className="related" href={LINKS.improvementAcademy} target="_blank" rel="noopener noreferrer">
            <span className="kicker">Where the long-form lives</span>
            <span id="academy-title" className="related__title">
              Improvement Academy
            </span>
            <span className="related__text">
              Long-form notes on fitness, business, self-improvement and AI &amp; tech, for becoming the best version of
              yourself.
            </span>
            <span className="feed__more">
              Read on Improvement Academy <span aria-hidden="true">↗</span>
              {NEW_TAB}
            </span>
          </a>
        </section>

        <section className="index-group" aria-labelledby="idx-newsletter-title" style={{ paddingBottom: "5rem" }}>
          <h2 id="idx-newsletter-title" className="h2">
            New articles, straight to your inbox.
          </h2>
          <NewsletterForm id="nl-index" />
        </section>
      </div>
      <NextRoom current="/writing" />
    </>
  );
}
