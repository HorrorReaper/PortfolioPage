/**
 * Logo "Emblem": P und E im Sechseck. Gleiche Formen wie public/brand/logo-b-emblem.svg
 * (bei Aenderungen beide anpassen).
 */
export const EMBLEM = {
  ring: "M25 4H75L100 50L75 96H25L0 50Z M27.6 9H72.4L94.3 50L72.4 91H27.6L5.7 50Z",
  inner: "M27.6 9H72.4L94.3 50L72.4 91H27.6L5.7 50Z",
  p: "M24 28H46L50 32V48L46 52H32V72H24Z M32 36V44H42V36Z",
  e: "M58 28H78V36H62V46H74V54H62V64H78V72H54V32Z",
  letters: "translate(8.8 0) skewX(-10)",
} as const;

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path fill="var(--accent)" fillRule="evenodd" d={EMBLEM.ring} />
      <path fill="var(--chrome)" d={EMBLEM.inner} />
      <g transform={EMBLEM.letters}>
        <path fill="var(--text)" fillRule="evenodd" d={EMBLEM.p} />
        <path fill="var(--accent)" d={EMBLEM.e} />
      </g>
    </svg>
  );
}
