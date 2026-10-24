import Link from "next/link";
import { NAV } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="wrap notfound">
      <h1 className="display">Page not found.</h1>
      <p className="lead">This path ends here. Pick a route and keep exploring.</p>
      <div className="subhero__actions">
        <Link className="btn btn--primary" href="/">
          Back to home
        </Link>
        <Link className="btn btn--ghost" href="/projects">
          See my projects
        </Link>
      </div>
      <nav aria-label="Available pages" className="socials">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
