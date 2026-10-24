import Link from "next/link";
import { SITE } from "@/lib/site";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import { NewsletterButton } from "./NewsletterButton";

export function Header() {
  return (
    <header className="site-header chrome">
      <div className="wrap site-header__inner">
        <Link href="/" className="brand">
          <BrandMark className="brand__mark" />
          {SITE.name}
        </Link>
        <NavLinks />
        <div className="site-header__cta">
          <NewsletterButton size="small" />
        </div>
      </div>
    </header>
  );
}
