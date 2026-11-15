/**
 * Hintergrundfotos fuer /focus: frei nutzbare Unsplash-Fotos (ueber Lorem Picsum ausgewaehlt),
 * verkleinert und lokal unter public/images/focus abgelegt. Keine externen Requests.
 */

export type FocusPhoto = { src: string; author: string; url: string };
export type FocusTheme = "nature" | "luxury" | "motivation";

export const FOCUS_THEMES: { id: FocusTheme; label: string }[] = [
  { id: "nature", label: "Nature" },
  { id: "luxury", label: "Luxury Lifestyle" },
  { id: "motivation", label: "Motivation" },
];

export const FOCUS_PHOTOS: Record<FocusTheme, FocusPhoto[]> = {
  nature: [
    {
      src: "/images/focus/nature-1.webp",
      author: "Paul Jarvis",
      url: "https://unsplash.com/photos/NYDo21ssGao",
    },
    {
      src: "/images/focus/nature-2.webp",
      author: "Jerry Adney",
      url: "https://unsplash.com/photos/_WiFMBRT7Aw",
    },
    {
      src: "/images/focus/nature-3.webp",
      author: "Go Wild",
      url: "https://unsplash.com/photos/V0yAek6BgGk",
    },
    {
      src: "/images/focus/nature-4.webp",
      author: "Matteo Minelli",
      url: "https://unsplash.com/photos/hlnucYOsL-c",
    },
    {
      src: "/images/focus/nature-5.webp",
      author: "Monika Majkowska",
      url: "https://unsplash.com/photos/Nq8LdWC7HnM",
    },
    {
      src: "/images/focus/nature-6.webp",
      author: "Aleksandra Boguslawska",
      url: "https://unsplash.com/photos/XeCvtUX-AE0",
    },
    {
      src: "/images/focus/nature-7.webp",
      author: "Paul E. Harrer",
      url: "https://unsplash.com/photos/TI-B-TNYJMU",
    },
    {
      src: "/images/focus/nature-8.webp",
      author: "Aleksandra Boguslawska",
      url: "https://unsplash.com/photos/c54ZhWDLEDo",
    },
  ],
  luxury: [
    {
      src: "/images/focus/luxury-1.webp",
      author: "Dietmar Becker",
      url: "https://unsplash.com/photos/8Zt0xOOK4nI",
    },
    {
      src: "/images/focus/luxury-2.webp",
      author: "Anders Jildén",
      url: "https://unsplash.com/photos/nrLtvA05jk8",
    },
    {
      src: "/images/focus/luxury-3.webp",
      author: "Namphuong Van",
      url: "https://unsplash.com/photos/hfIheOEJp9M",
    },
    {
      src: "/images/focus/luxury-4.webp",
      author: "Vadim Sherbakov",
      url: "https://unsplash.com/photos/xS_RzdD5CFE",
    },
    {
      src: "/images/focus/luxury-5.webp",
      author: "Vadim Sherbakov",
      url: "https://unsplash.com/photos/KSyemQIWwP8",
    },
    {
      src: "/images/focus/luxury-6.webp",
      author: "Anders Jildén",
      url: "https://unsplash.com/photos/yb0Qs65aZmc",
    },
    {
      src: "/images/focus/luxury-7.webp",
      author: "Dominik Martin",
      url: "https://unsplash.com/photos/B6uUPYt7wz4",
    },
    {
      src: "/images/focus/luxury-8.webp",
      author: "Matthew Wiebe",
      url: "https://unsplash.com/photos/nOhUx3tiaQQ",
    },
  ],
  motivation: [
    {
      src: "/images/focus/motivation-1.webp",
      author: "Danka & Peter",
      url: "https://unsplash.com/photos/tvicgTdh7Fg",
    },
    {
      src: "/images/focus/motivation-2.webp",
      author: "davide ragusa",
      url: "https://unsplash.com/photos/sM3lniBo2LY",
    },
    {
      src: "/images/focus/motivation-3.webp",
      author: "Robin Benad",
      url: "https://unsplash.com/photos/NKV6xXErcyY",
    },
    {
      src: "/images/focus/motivation-4.webp",
      author: "Fré Sonneveld",
      url: "https://unsplash.com/photos/1rZcfdsjoR4",
    },
    {
      src: "/images/focus/motivation-5.webp",
      author: "petradr",
      url: "https://unsplash.com/photos/8hgm6mKK04U",
    },
    {
      src: "/images/focus/motivation-6.webp",
      author: "Tiago Gerken",
      url: "https://unsplash.com/photos/vCqmY3bfqfo",
    },
    {
      src: "/images/focus/motivation-7.webp",
      author: "Elisabetta Foco",
      url: "https://unsplash.com/photos/dFkCXUMB4r4",
    },
    {
      src: "/images/focus/motivation-8.webp",
      author: "Philipp Reiner",
      url: "https://unsplash.com/photos/M8PV59TCj6E",
    },
  ],
};

/** Kurze Zeilen fuer den Fokus-Bildschirm, alle aus Patricks eigenen Texten auf dieser Website. */
export const FOCUS_LINES = [
  "Reps before mood.",
  "The big task goes first.",
  "Consistency beats motivation, every single time.",
  "Not glamorous. That's the point.",
  "Change the story, then collect proof that it's true.",
  "Shipping things is the best teacher I've had.",
];
