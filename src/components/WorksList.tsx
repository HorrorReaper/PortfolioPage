import Image from "next/image";
import { getProjects } from "@/lib/projects";
import { NEW_TAB_LABEL } from "@/lib/site";

/** Liste der Webprojekte (Startseite und Projekte-Seite). */
export function WorksList() {
  return (
    <ul className="works reveal">
      {getProjects().map((p) => (
        <li key={p.name} className="work">
          <div className="work__media">
            <Image
              src={p.image}
              alt={p.imageAlt}
              width={1200}
              height={750}
              sizes="(min-width: 800px) 352px, 100vw"
              style={{ aspectRatio: "16 / 10", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
          <div className="work__body">
            <p className="kicker">{p.kind}</p>
            <h3 className="h3">
              <a href={p.href} target="_blank" rel="noopener noreferrer">
                {p.name}
                <span className="sr-only">{NEW_TAB_LABEL}</span>
              </a>
            </h3>
            <p>{p.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
