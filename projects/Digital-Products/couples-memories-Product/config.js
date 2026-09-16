// ============================================================
// EDIT THIS FILE ONLY — change the values below, don't touch script.js
// ============================================================

const CONFIG = {
  // Color theme — options: "red" (default), "purple", "blue", "gold"
  theme: "red",

    // Lock screen — change this six-digit code to any date or number they both know.
    lock: {
      storageKey: "couples-memories-template-unlocked",
      code: "010126",
    },

  // Shown in the header
  names: "Placeholder & Placeholder",
  anniversaryDisplay: "Month DD, YYYY", // text shown under the names
  anniversaryDate: "2026-01-01T00:00:00", // used for the live counter — keep this matching anniversaryDisplay

  // Shown in the footer
  footerNote: "Made with love by Placeholder & Placeholder",

  // "Our Story" section — add or remove entries as needed
  // leave photo as "" for a text-only entry
  timeline: [
    {
      date: "January 01, 2026",
      title: "Placeholder Title",
      description: "Placeholder description of this moment.",
        photo: "assets/images/placeholder-image.jpg",
    },
    {
      date: "January 01, 2026",
      title: "Placeholder Title",
      description: "Placeholder description of this moment.",
      photo: "assets/images/placeholder-image.jpg",
    },
  ],

  // "Photos" section — add or remove entries as needed
  // set wide: true to make a photo take up more horizontal space (same height as the others)
  gallery: [
    { src: "assets/images/placeholder-image.jpg", alt: "Placeholder photo caption", caption: "Placeholder", wide: true },
    { src: "assets/images/placeholder-image.jpg", alt: "Placeholder photo caption", caption: "Placeholder", wide: false },
    { src: "assets/images/placeholder-image.jpg", alt: "Placeholder photo caption", caption: "Placeholder", wide: false },
  ],

  // "Messages" section — add or remove entries as needed
  messages: [
    { text: "Placeholder message goes here.", author: "Placeholder Author" },
    { text: "Placeholder message goes here.", author: "Placeholder Author" },
  ],
};
