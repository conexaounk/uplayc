import { DJ } from "@/types";

export const mockDJs: DJ[] = [
  {
    id: "1",
    name: "DJ Sonic",
    avatar: "🎧",
    genre: "Tech House",
    bio: "Produtor e DJ especializado em Tech House com 5 anos de experiência",
    followers: 15000,
    packs: [
      {
        id: "pack-1",
        name: "Tech House Essentials",
        price: 49.99,
        tracks: [
          { id: "track-1", name: "Beat Drop", duration: 320, bpm: 128, previewUrl: "" },
          { id: "track-2", name: "Pulse", duration: 280, bpm: 125, previewUrl: "" },
          { id: "track-3", name: "Rhythm Flow", duration: 300, bpm: 130, previewUrl: "" },
        ],
        sizeGB: 2.5,
        coverEmoji: "🔥",
        isFree: false,
      },
    ],
    freeDownloads: [
      {
        id: "free-pack-1",
        name: "Free Sample Pack",
        price: 0,
        tracks: [
          { id: "free-track-1", name: "Sample Loop", duration: 240, bpm: 128, previewUrl: "" },
        ],
        sizeGB: 0.5,
        coverEmoji: "🎁",
        isFree: true,
      },
    ],
  },
  {
    id: "2",
    name: "DJ Neon",
    avatar: "🌟",
    genre: "Melodic Techno",
    bio: "Criador de sons melódicos e atmosféricos para dancefloors",
    followers: 22000,
    packs: [
      {
        id: "pack-2",
        name: "Melodic Vibes",
        price: 59.99,
        tracks: [
          { id: "track-4", name: "Sunset Dreams", duration: 330, bpm: 120, previewUrl: "" },
          { id: "track-5", name: "Electric Harmony", duration: 310, bpm: 122, previewUrl: "" },
        ],
        sizeGB: 3.2,
        coverEmoji: "✨",
        isFree: false,
      },
    ],
    freeDownloads: [],
  },
  {
    id: "3",
    name: "DJ Bass",
    avatar: "🔊",
    genre: "Drum & Bass",
    bio: "Especialista em Drum & Bass com drops que explodem",
    followers: 18500,
    packs: [
      {
        id: "pack-3",
        name: "DNB Arsenal",
        price: 69.99,
        tracks: [
          { id: "track-6", name: "Fast Kicks", duration: 250, bpm: 170, previewUrl: "" },
          { id: "track-7", name: "Heavy Drop", duration: 280, bpm: 175, previewUrl: "" },
          { id: "track-8", name: "Breakbeat Bliss", duration: 290, bpm: 172, previewUrl: "" },
        ],
        sizeGB: 2.8,
        coverEmoji: "💥",
        isFree: false,
      },
    ],
    freeDownloads: [],
  },
];

export const genres = [
  "Todos",
  "Tech House",
  "Melodic Techno",
  "Drum & Bass",
  "Afro House",
  "Dark Techno",
  "Progressive House",
];
