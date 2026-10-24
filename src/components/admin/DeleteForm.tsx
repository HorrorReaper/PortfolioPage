"use client";

type Props = {
  action: (data: FormData) => Promise<void>;
  slug: string;
  label: string;
  confirmText: string;
};

/** Loeschen mit Rueckfrage. */
export function DeleteForm({ action, slug, label, confirmText }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button className="btn btn--danger" type="submit">
        {label}
      </button>
    </form>
  );
}
