import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Immer frisch aus content/ lesen.
export const dynamic = "force-dynamic";

/** Lokales Admin-Panel: existiert nur unter `npm run dev`, auf der Live-Seite liefert /admin eine 404. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <div className="wrap admin" lang="de">
      <div className="admin__bar">
        <Link href="/admin" className="admin__home">
          Admin
        </Link>
        <span className="meta">Nur lokal. Änderungen gehen mit dem nächsten Deploy live.</span>
      </div>
      {children}
    </div>
  );
}
