import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  kicker: string;
  title: string;
  lead: string;
  actions: ReactNode;
  image?: { src: string; alt: string; width: number; height: number };
  /** Optionaler Hintergrund, z. B. das Signalfeld der AI-Seite. */
  backdrop?: ReactNode;
};

/** Hero fuer Unterseiten: Text links, Bild im HUD-Rahmen rechts. */
export function SubpageHero({ kicker, title, lead, actions, image, backdrop }: Props) {
  return (
    <section className="hero chrome subhero" aria-labelledby="page-title">
      {backdrop}
      <div className={`wrap subhero__grid${image ? "" : " subhero__grid--solo"}`}>
        <div className="hero__copy">
          <p className="kicker">{kicker}</p>
          <h1 id="page-title" className="display subhero__title">
            {title}
          </h1>
          <p className="lead">{lead}</p>
          <div className="subhero__actions">{actions}</div>
        </div>
        {image && (
          <div className="subhero__media">
            <div className="frame">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
                sizes="(min-width: 960px) 560px, 100vw"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
