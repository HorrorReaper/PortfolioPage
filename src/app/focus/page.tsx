import type { Metadata } from "next";
import Link from "next/link";
import { FocusApp } from "@/components/FocusApp";

const DESCRIPTION =
  "A free focus timer with Pomodoro mode: pick a duration and up to three tasks, then get a calm full-screen view with a photo and a countdown.";

export const metadata: Metadata = {
  title: "Focus",
  description: DESCRIPTION,
  alternates: { canonical: "/focus" },
  openGraph: {
    title: "Focus | Patrick Eger",
    description: DESCRIPTION,
    url: "/focus",
  },
};

export default function FocusPage() {
  return (
    <section className="hero chrome subhero focus-page" aria-labelledby="page-title">
      <div className="wrap focus-page__grid">
        <div className="hero__copy">
          <p className="kicker">Side project</p>
          <h1 id="page-title" className="display subhero__title">
            One block. Three tasks. <span className="accent">Zero tabs.</span>
          </h1>
          <p className="lead">
            Set a timer, write down what actually matters, and let the rest of the internet wait. It&apos;s the deep
            work block I do every morning, as a tiny tool.
          </p>
          <ul className="focus-notes">
            <li>One long block or Pomodoro: 25/5, 50/10 or your own rhythm.</li>
            <li>No account. Your tasks stay in your browser.</li>
            <li>Reload by accident? Your timer and tasks keep going.</li>
            <li>
              Want the long game?{" "}
              <Link className="link" href="/lifequest">
                LifeQuest
              </Link>{" "}
              turns habits and tasks into XP.
            </li>
          </ul>
        </div>
        <FocusApp />
      </div>
    </section>
  );
}
