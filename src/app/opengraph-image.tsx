import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <OgCard title="I'm building LifeQuest. And myself." footer="Entrepreneurship. AI. Self-development." />,
    size,
  );
}
