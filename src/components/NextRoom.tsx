import Link from "next/link";
import { nextRoom } from "@/lib/site";

/** Grosser Link zur naechsten Unterseite am Seitenende. */
export function NextRoom({ current }: { current: string }) {
  const next = nextRoom(current);
  return (
    <nav className="next-room" aria-label="Next page">
      <div className="wrap next-room__inner">
        <Link href="/" className="next-room__home">
          ← Home
        </Link>
        <Link href={next.href} className="next-room__link">
          <span className="kicker">Next</span>
          <span className="next-room__title">
            {next.label} <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}
