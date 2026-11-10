import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SignalField } from "@/components/SignalField";
import { Ticker } from "@/components/Ticker";
import { WorksList } from "@/components/WorksList";
import { getArticle } from "@/lib/articles";
import { getProject, getProjects } from "@/lib/projects";
import {
  EXTERNAL_POSTS,
  formatDate,
  HOW_IT_WORKS,
  LIFEQUEST,
  LINKS,
  NEW_TAB_LABEL,
  PILLARS,
  PORTRAIT,
  SOCIALS,
  substackPostUrl,
} from "@/lib/site";

const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;

export default function HomePage() {
  // Startseite bleibt bewusst beim Journaling-Artikel, auch wenn neuere Texte dazukommen.
  const featured = getArticle("10-brutally-honest-journaling-questions")!;
  const academy = getProject("improvement-academy") ?? getProjects()[0];
  const feed = [
    { date: featured.date, title: featured.title, href: `/writing/${featured.slug}`, internal: true },
    ...EXTERNAL_POSTS.map((p) => ({ date: p.date, title: p.title, href: substackPostUrl(p.slug), internal: false })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className={`hero chrome${PORTRAIT ? " hero--portrait" : ""}`} aria-labelledby="hero-title">
        <SignalField />
        <div className={`wrap hero__grid${PORTRAIT ? " hero__grid--portrait" : ""}`}>
          <div className="hero__copy">
            <h1 id="hero-title" className="display">
              I&apos;m building LifeQuest. And myself.
            </h1>
            <p className="lead">
              I mix entrepreneurship, AI and <span className="nowrap">self-development</span> to level up in real life.
              In public, bugs included.
            </p>
            <NewsletterForm id="nl-hero" />
          </div>
          {PORTRAIT ? (
            <div className="hero__portrait">
              <Image
                src={PORTRAIT.src}
                alt={PORTRAIT.alt}
                width={PORTRAIT.width}
                height={PORTRAIT.height}
                priority
                sizes="(min-width: 960px) 420px, 100vw"
              />
            </div>
          ) : (
            <figure className="hero__figure">
              <div className="frame">
                <Image
                  src={LIFEQUEST.image}
                  alt={LIFEQUEST.imageAlt}
                  width={1600}
                  height={800}
                  priority
                  sizes="(min-width: 960px) 580px, 100vw"
                  quality={70}
                />
              </div>
              <figcaption>LifeQuest, my gamified journaling app.</figcaption>
            </figure>
          )}
        </div>
      </section>

      <Ticker />

      {/* Drei Saeulen, ein System */}
      <section className="section" aria-labelledby="system-title">
        <div className="wrap pillars">
          <div className="pillars__head reveal">
            <h2 id="system-title" className="h2">
              Three skill trees.
              <br />
              <span className="accent">One character.</span>
            </h2>
            <p className="prose-narrow">
              Think of it like an RPG: entrepreneurship, AI and self-development are three skill trees, and I&apos;m
              leveling all of them on the same character. Business gives direction, tech gives leverage, and training
              plus journaling keep the character alive long enough to use both.
            </p>
          </div>
          <ul className="pillars__list">
            {PILLARS.map((p) => (
              <li key={p.title} className="pillar reveal">
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Start here */}
      <section className="section" aria-labelledby="start-title">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 id="start-title" className="h2">
              <span className="accent">Start here.</span>
              <br />
              Three ways into my work.
            </h2>
          </div>
          <div className="start-grid">
            <article className="start-card start-card--feature chrome reveal">
              <div className="start-card__body">
                <p className="kicker">Article</p>
                <p className="meta">
                  {formatDate(featured.date)}, {featured.readingMinutes} min read
                </p>
                <h3 className="h2">
                  <Link href={`/writing/${featured.slug}`}>{featured.title}</Link>
                </h3>
                <p>{featured.description}</p>
              </div>
              <p className="start-card__more">
                Read the article <span aria-hidden="true">→</span>
              </p>
            </article>

            <article className="start-card reveal">
              <div className="start-card__media">
                <Image
                  src={academy.image}
                  alt={academy.imageAlt}
                  width={1200}
                  height={750}
                  sizes="(min-width: 900px) 40vw, 100vw"
                  style={{ aspectRatio: "16 / 8", objectFit: "cover", objectPosition: "top" }}
                />
              </div>
              <div className="start-card__body">
                <p className="kicker">Blog &amp; newsletter</p>
                <h3 className="h3">
                  <a href={academy.href} target="_blank" rel="noopener noreferrer">
                    {academy.name}
                    {NEW_TAB}
                  </a>
                </h3>
                <p>{academy.text}</p>
              </div>
            </article>

            <article className="start-card reveal">
              <div className="start-card__body">
                <p className="kicker">My product</p>
                <h3 className="h3">
                  <a href="#projects">{LIFEQUEST.name}</a>
                </h3>
                <p>My life as a video game. Journaling, tasks and habits in one app that pays you XP for showing up.</p>
              </div>
              <p className="start-card__more">
                More about LifeQuest <span aria-hidden="true">→</span>
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* LifeQuest */}
      <section id="projects" className="section" aria-labelledby="lifequest-title">
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
            <h2 id="lifequest-title" className="h2">
              {LIFEQUEST.name}
            </h2>
            <p>{LIFEQUEST.intro}</p>
            <p className="prose-narrow">{LIFEQUEST.text}</p>
            <ul className="steps">
              {HOW_IT_WORKS.map((step) => (
                <li key={step.title}>
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </li>
              ))}
            </ul>
            <p className="prose-narrow">{LIFEQUEST.status}</p>
            <a className="btn btn--primary" href={LINKS.lifequestApp} target="_blank" rel="noopener noreferrer">
              Start playing
              <span className="btn__arrow" aria-hidden="true">
                ↗
              </span>
              {NEW_TAB}
            </a>
          </div>
        </div>
      </section>

      {/* Latest writing */}
      <section className="section" aria-labelledby="writing-title">
        <div className="wrap">
          <div className="section-head reveal">
            <h2 id="writing-title" className="h2">
              Latest writing
            </h2>
            <Link className="btn btn--ghost" href="/writing">
              All articles
            </Link>
          </div>
          <ul className="feed reveal">
            {feed.map((item) => (
              <li key={item.href}>
                {item.internal ? (
                  <Link href={item.href}>
                    <span className="feed__date">{formatDate(item.date)}</span>
                    <span className="feed__title">{item.title}</span>
                    <span className="feed__more">Read</span>
                  </Link>
                ) : (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <span className="feed__date">{formatDate(item.date)}</span>
                    <span className="feed__title">{item.title}</span>
                    <span className="feed__more">
                      On Substack <span aria-hidden="true">↗</span>
                      {NEW_TAB}
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About */}
      <section id="about" className="section" aria-labelledby="about-title">
        <div className="wrap about">
          <div className="about__text reveal">
            <h2 id="about-title" className="h2">
              About me
            </h2>
            <p>
              Hey, I&apos;m Patrick. I study business informatics at HTW Dresden and work as a business development
              working student at SpeechMind, an AI SaaS startup. In practice that means a bit of everything, with AI
              tools open pretty much all day.
            </p>
            <p>
              As a kid I was overweight and convinced I was addicted to sugar (chocolate, mostly). At some point I
              rewrote that story, started seeing myself as an athlete and went from 260 to 180 pounds, roughly 118 to
              82 kg. Still the best proof I have that people can change.
            </p>
            <p>
              Now I&apos;m building LifeQuest, lifting, journaling and writing down what I learn. The plan: grow
              LifeQuest in the open as a serial builder, without living a one-dimensional life. Business, bodybuilding
              and the people I care about all get a seat at the table.
            </p>
          </div>
          <dl className="facts reveal">
            <div>
              <dt>Studies</dt>
              <dd>Business Informatics, HTW Dresden</dd>
            </div>
            <div>
              <dt>Currently</dt>
              <dd>Business Development working student at SpeechMind</dd>
            </div>
            <div>
              <dt>Founder of</dt>
              <dd>LifeQuest</dd>
            </div>
            <div>
              <dt>Daily non-negotiables</dt>
              <dd>Training, journaling, deep work before the inbox, reading</dd>
            </div>
            <div>
              <dt>Topics</dt>
              <dd>Entrepreneurship, AI &amp; tech, self-development, building in public, fitness</dd>
            </div>
            <div>
              <dt>Online</dt>
              <dd>
                <ul className="socials">
                  {SOCIALS.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer">
                        {s.label}
                        {NEW_TAB}
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Web projects */}
      <section className="section" aria-labelledby="web-title">
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

      {/* Closing */}
      <section className="closing chrome" aria-labelledby="closing-title">
        <div className="wrap closing__inner">
          <h2 id="closing-title" className="h2">
            Follow along as I level up.
          </h2>
          <p className="prose-narrow">
            My newsletter Improvement Academy: AI, business, health and personal growth. Written the way I&apos;d
            explain it to a friend.
          </p>
          <NewsletterForm id="nl-closing" />
        </div>
      </section>
    </>
  );
}
