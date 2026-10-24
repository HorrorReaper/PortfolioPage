import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten auf patrickeger.com.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <div className="wrap article" lang="de">
      <header className="article__head">
        <h1 className="article__title">Datenschutzerklärung</h1>
        <p className="meta" lang="en">
          Legal information is provided in German, as required for operators based in Germany.
        </p>
        <p className="meta">Stand: {LEGAL.updated}</p>
      </header>

      <div className="prose">
        <h2>Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:
        </p>
        <p>
          {LEGAL.name}
          <br />
          {LEGAL.street}
          <br />
          {LEGAL.city}
          <br />
          E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        </p>
        <p>
          Weitere Angaben findest du im <Link href="/impressum">Impressum</Link>.
        </p>

        <h2>Das Wichtigste in Kürze</h2>
        <p>
          Diese Website setzt keine Cookies, bindet keine Analyse- oder Werbedienste ein und lädt keine Schriftarten
          oder Skripte von fremden Servern. Es gibt kein Kontaktformular und kein Nutzerkonto. Personenbezogene Daten
          fallen nur beim Aufruf der Seiten (Server-Logfiles), bei einer E-Mail an mich und bei der Newsletter-Anmeldung
          bei Substack an.
        </p>

        <h2>Hosting und Server-Logfiles</h2>
        <p>
          Die Website wird bei Vercel Inc., Covina, Kalifornien, USA, gehostet. Beim Aufruf einer Seite verarbeitet der
          Hosting-Anbieter technisch notwendige Daten, die dein Browser übermittelt: IP-Adresse, Datum und Uhrzeit des
          Abrufs, aufgerufene Seite, Browsertyp und Betriebssystem sowie die zuvor besuchte Seite. Das ist nötig, um die
          Seite auszuliefern, die Stabilität und Sicherheit zu gewährleisten und Angriffe abzuwehren.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und stabilen Betrieb
          der Website). Mit dem Anbieter besteht ein Vertrag zur Auftragsverarbeitung. Soweit Daten in die USA
          übermittelt werden, stützt sich die Übermittlung auf den Angemessenheitsbeschluss zum EU-US Data Privacy
          Framework beziehungsweise auf Standardvertragsklauseln. Die Speicherdauer der Logfiles richtet sich nach den
          Einstellungen des Anbieters; ich nutze sie nicht, um dich zu identifizieren, und führe sie nicht mit anderen
          Daten zusammen.
        </p>

        <h2>Cookies und Tracking</h2>
        <p>
          Ich verwende keine Cookies und keine Tracking- oder Analysewerkzeuge. Deshalb ist auch kein Cookie-Banner
          nötig.
        </p>

        <h2>Schriftarten</h2>
        <p>
          Die verwendeten Schriftarten (Geist, Anton und JetBrains Mono) werden von meinem eigenen Server ausgeliefert. Es findet
          dabei keine Verbindung zu Google oder anderen Schriftanbietern statt.
        </p>

        <h2>Kontakt per E-Mail</h2>
        <p>
          Wenn du mir eine E-Mail schreibst, verarbeite ich deine Adresse und den Inhalt der Nachricht, um deine Anfrage
          zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn es um einen Vertrag oder vorvertragliche
          Maßnahmen geht, sonst Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).
          Ich lösche die Nachrichten, sobald sie nicht mehr erforderlich sind und keine gesetzliche Aufbewahrungspflicht
          besteht.
        </p>

        <h2>Newsletter über Substack</h2>
        <p>
          Der Newsletter Improvement Academy wird über Substack (Substack Inc., San Francisco, USA) betrieben. Die
          Anmeldeformulare auf dieser Website (Startseite, Artikelseiten) senden die eingegebene E-Mail-Adresse erst
          dann an Substack, wenn du auf „Join the newsletter“ klickst. Die Übertragung geht direkt von deinem Browser
          an Substack und öffnet die Bestätigungsseite von Substack in einem neuen Tab; auf meinem Server wird die
          Adresse nicht gespeichert. Substack verarbeitet deine Daten als eigener Anbieter nach seinen
          Datenschutzhinweisen, auf die ich keinen Einfluss habe. Als Herausgeber sehe ich in Substack, dass du den
          Newsletter abonniert hast, und kann dir Beiträge senden. Rechtsgrundlage ist deine Einwilligung durch die
          Anmeldung (Art. 6 Abs. 1 lit. a DSGVO). Das Abonnement kannst du jederzeit über den Abmeldelink in jeder
          E-Mail beenden. Der Button „Join the newsletter“ im Kopfbereich öffnet direkt die Anmeldeseite von
          Substack.
        </p>

        <h2>Externe Links</h2>
        <p>
          Diese Website verlinkt auf externe Angebote, zum Beispiel LinkedIn, Medium, Substack, LifeQuest und weitere
          Websites. Die Links führen nur dann zu einer Datenübermittlung an den jeweiligen Anbieter, wenn du sie
          anklickst. Danach gelten dessen Datenschutzbestimmungen. Die Seiten werden nicht automatisch eingebettet.
        </p>

        <h2>Deine Rechte</h2>
        <p>Du hast gegenüber mir als Verantwortlichem folgende Rechte, soweit die gesetzlichen Voraussetzungen vorliegen:</p>
        <ul>
          <li>Auskunft über die zu dir gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Schreib dazu einfach an <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
        </p>

        <h2>Beschwerderecht</h2>
        <p>
          Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren. Für mich zuständig ist die Sächsische
          Datenschutz- und Transparenzbeauftragte (
          <a href="https://www.datenschutz.sachsen.de" rel="noopener noreferrer">
            datenschutz.sachsen.de
          </a>
          ).
        </p>

        <h2>Änderungen</h2>
        <p>
          Ich passe diese Erklärung an, wenn sich die Website oder die Rechtslage ändert. Es gilt die jeweils hier
          veröffentlichte Fassung.
        </p>
      </div>
    </div>
  );
}
