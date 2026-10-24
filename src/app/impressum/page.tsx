import type { Metadata } from "next";
import { LEGAL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Anbieterkennzeichnung nach § 5 DDG für patrickeger.com.`,
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <div className="wrap article" lang="de">
      <header className="article__head">
        <h1 className="article__title">Impressum</h1>
        <p className="meta" lang="en">
          Legal information is provided in German, as required for operators based in Germany.
        </p>
      </header>

      <div className="prose">
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          {LEGAL.name}
          <br />
          {LEGAL.street}
          <br />
          {LEGAL.city}
          <br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>
          {LEGAL.name}, {LEGAL.street}, {LEGAL.city}
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Diese Website enthält Links zu externen Websites Dritter. Auf deren Inhalte habe ich keinen Einfluss und
          übernehme dafür keine Gewähr. Für die Inhalte verlinkter Seiten ist stets der jeweilige Anbieter
          verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entferne ich solche Links umgehend.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die Texte auf dieser Website stammen, sofern nicht anders angegeben, von mir. Die Screenshots zeigen die
          jeweils genannten Websites. Eine Vervielfältigung oder Verwendung über das gesetzlich Erlaubte hinaus
          bedarf meiner vorherigen Zustimmung.
        </p>
      </div>
    </div>
  );
}
