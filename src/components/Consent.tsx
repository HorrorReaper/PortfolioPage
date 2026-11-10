"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { GTM_ID } from "@/lib/site";

/**
 * Einwilligung fuer Google Tag Manager.
 * GTM wird erst geladen, wenn der Besucher zustimmt (TTDSG/DSGVO). Die Wahl liegt im localStorage;
 * ueber den Footer-Link "Cookie settings" (Event "consent:open") laesst sie sich jederzeit aendern.
 */

type Choice = "granted" | "denied";
const STORAGE_KEY = "pe-consent-analytics";
export const OPEN_CONSENT_EVENT = "consent:open";

function readChoice(): Choice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function storeChoice(choice: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Ohne Speicher gilt die Wahl nur fuer diesen Seitenaufruf.
  }
}

/** Entfernt Google-Analytics-Cookies, wenn die Einwilligung widerrufen wird. */
function clearGoogleCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function Consent() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = readChoice();
    setChoice(stored);
    setOpen(stored === null);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const decide = (next: Choice) => {
    const wasGranted = choice === "granted";
    storeChoice(next);
    setChoice(next);
    setOpen(false);
    if (next === "denied" && wasGranted) {
      // Bereits geladene Skripte lassen sich nicht entladen: Cookies loeschen und neu laden.
      clearGoogleCookies();
      window.location.reload();
    }
  };

  return (
    <>
      {choice === "granted" && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});`}
          </Script>
          <Script id="gtm" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} />
        </>
      )}

      {open && (
        <section className="consent" role="dialog" aria-modal="false" aria-labelledby="consent-title">
          <h2 id="consent-title" className="consent__title">
            Cookies &amp; analytics
          </h2>
          <p className="consent__text">
            With your consent, I use Google Tag Manager to understand how this site is used. This sets cookies and sends
            data to Google, including to the USA. Without consent, nothing is loaded. You can change your choice anytime
            under &ldquo;Cookie settings&rdquo; in the footer. More in the{" "}
            <Link className="link" href="/datenschutz">
              privacy policy
            </Link>
            .
          </p>
          <div className="consent__actions">
            <button type="button" className="btn btn--primary btn--small" onClick={() => decide("granted")}>
              Accept
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => decide("denied")}>
              Decline
            </button>
          </div>
        </section>
      )}
    </>
  );
}

/** Footer-Link zum erneuten Oeffnen des Banners. */
export function ConsentSettingsButton() {
  return (
    <button
      type="button"
      className="consent-link"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      Cookie settings
    </button>
  );
}
