import axios from "axios";

const imageCache = new Map();
const MAX_CACHE_ENTRIES = 500;
const MAX_LOOKUPS = 4;
const FOUND_TTL = 60 * 60 * 1000;
const MISSING_TTL = 60 * 1000;

export async function findAircraftWithImage(flights) {
  let lookups = 0;

  for (const flight of flights) {
    const key = flight.r || flight.hex || flight.desc || flight.t;
    const cached = imageCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      if (cached.imageUrl) {
        return { selectedPlane: flight, imageUrl: cached.imageUrl };
      }
      continue;
    }

    if (lookups >= MAX_LOOKUPS) continue;
    lookups += 1;

    const searchTerm = flight.r
      ? `"${flight.r}" aircraft`
      : `${flight.desc || flight.t || flight.flight?.trim() || "aircraft"} aircraft`;

    try {
      const response = await axios.get(
        "https://commons.wikimedia.org/w/api.php",
        {
          params: {
            action: "query",
            generator: "search",
            gsrsearch: searchTerm,
            gsrnamespace: 6,
            gsrlimit: 1,
            prop: "imageinfo",
            iiprop: "url",
            format: "json",
          },
          timeout: 2000,
          headers: { "User-Agent": "Skywatcher/1.0" },
        },
      );

      const pages = Object.values(response.data?.query?.pages || {});
      const imageUrl = pages[0]?.imageinfo?.[0]?.url || null;

      imageCache.delete(key);
      if (imageCache.size >= MAX_CACHE_ENTRIES) {
        imageCache.delete(imageCache.keys().next().value);
      }
      imageCache.set(key, {
        imageUrl,
        expiresAt: Date.now() + (imageUrl ? FOUND_TTL : MISSING_TTL),
      });

      if (imageUrl) return { selectedPlane: flight, imageUrl };
    } catch {
      break;
    }
  }

  return { selectedPlane: flights[0] || null, imageUrl: null };
}
