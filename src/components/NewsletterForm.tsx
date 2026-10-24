import { CTA_LABEL, LINKS } from "@/lib/site";

type Props = {
  /** Eindeutige id fuer Label und Hilfetext, wenn mehrere Formulare auf einer Seite stehen. */
  id: string;
};

/**
 * Newsletter-Anmeldung. Das Formular sendet direkt an Substack (offizielles Einbettungsformular),
 * die Bestaetigung oeffnet sich in einem neuen Tab. Ohne JavaScript nutzbar.
 */
export function NewsletterForm({ id }: Props) {
  return (
    <form className="nl-form" action={LINKS.newsletterSubmit} method="post" target="_blank">
      <input type="hidden" name="source" value="embed" />
      <label htmlFor={id} className="nl-form__label">
        Your email address
      </label>
      <div className="nl-form__row">
        <input
          id={id}
          className="nl-form__input"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          aria-describedby={`${id}-help`}
        />
        <button className="btn btn--primary" type="submit">
          {CTA_LABEL}
          <span className="sr-only"> (opens Substack in a new tab)</span>
        </button>
      </div>
      <p id={`${id}-help`} className="nl-form__help">
        Free. Unsubscribe anytime. Sign-up runs through Substack.
      </p>
    </form>
  );
}
