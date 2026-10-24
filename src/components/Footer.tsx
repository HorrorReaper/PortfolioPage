import Link from "next/link";
import { LEGAL_NAV, LINKS, NAV, NEW_TAB_LABEL, SITE, SOCIALS } from "@/lib/site";
import { BrandMark } from "./BrandMark";

const NEW_TAB = <span className="sr-only">{NEW_TAB_LABEL}</span>;

export function Footer() {
  return (
    <footer className="site-footer chrome">
      <div className="wrap">
        <div className="site-footer__grid">
          <div className="site-footer__about">
            <p className="brand">
              <BrandMark className="brand__mark" />
              {SITE.name}
            </p>
            <p>Business informatics student and founder of LifeQuest. Entrepreneurship, AI &amp; tech and self-development.</p>
          </div>

          <nav aria-label="Pages">
            <h2 className="site-footer__title">Pages</h2>
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Projects">
            <h2 className="site-footer__title">Projects</h2>
            <ul>
              <li>
                <a href={LINKS.lifequest} target="_blank" rel="noopener noreferrer">
                  LifeQuest{NEW_TAB}
                </a>
              </li>
              <li>
                <a href={LINKS.improvementAcademy} target="_blank" rel="noopener noreferrer">
                  Improvement Academy{NEW_TAB}
                </a>
              </li>
              <li>
                <a href={LINKS.developer} target="_blank" rel="noopener noreferrer">
                  Developer portfolio{NEW_TAB}
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Social">
            <h2 className="site-footer__title">Online</h2>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    {NEW_TAB}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="site-footer__bar">
          <p>© {new Date().getFullYear()} {SITE.name}</p>
          <nav aria-label="Legal">
            <ul className="site-footer__legal">
              {LEGAL_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
