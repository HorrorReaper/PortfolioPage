import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/lib/og";

export const alt = "Focus: one block, three tasks, zero tabs";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function FocusOpengraphImage() {
  return new ImageResponse(<OgCard title="One block. Three tasks. Zero tabs." footer="patrickeger.de/focus" />, size);
}
