import { CTA_LABEL, LINKS } from "@/lib/site";

type Props = {
  size?: "default" | "small";
};

/** Primaerer Call-to-Action der Website: fuehrt zur Substack-Anmeldung. */
export function NewsletterButton({ size = "default" }: Props) {
  return (
    <a
      className={`btn btn--primary${size === "small" ? " btn--small" : ""}`}
      href={LINKS.newsletter}
      target="_blank"
      rel="noopener noreferrer"
    >
      {CTA_LABEL}
      <span className="btn__arrow" aria-hidden="true">
        ↗
      </span>
      <span className="sr-only"> (opens Substack in a new tab)</span>
    </a>
  );
}
