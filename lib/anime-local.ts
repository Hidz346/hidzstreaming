import {
  TTL,
  getByGenre,
  getCompleted,
  getDetail,
  getEpisode,
  getGenres,
  getHome,
  getOngoing,
  getSchedule,
  searchAnime,
} from "./samehadaku";

// Sumber yang dilayani langsung oleh scraper bawaan. "otakudesu" tetap dipakai
// sebagai nama sumber default di URL situs, datanya sekarang dari Samehadaku.
const LOCAL_SOURCES = new Set(["otakudesu", "samehadaku"]);

const ENDPOINTS = new Set([
  "home",
  "ongoing",
  "complete",
  "completed",
  "schedule",
  "genres",
  "genre",
  "search",
  "detail",
  "episode",
]);

export type LocalAnimeResult = {
  body: unknown;
  cacheSeconds: number;
};

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const toPage = (value?: string | null) => {
  const page = parseInt(value ?? "", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const seconds = (ms: number) => Math.round(ms / 1000);

/**
 * Menjawab request /api/anime/* dari scraper bawaan.
 * Mengembalikan null untuk path yang tidak ditangani, sehingga route bisa
 * meneruskannya ke API lama. Error dilempar apa adanya.
 */
export async function resolveLocalAnime(
  path: string[],
  params: URLSearchParams
): Promise<LocalAnimeResult | null> {
  const segments = path.map(safeDecode);

  // Bentuk lama untuk otakudesu tidak membawa nama sumber: /anime/home, /anime/ongoing/1, dst.
  if (!ENDPOINTS.has(segments[0])) {
    if (!LOCAL_SOURCES.has(segments[0])) return null;
    segments.shift();
  }

  const [endpoint, arg] = segments;
  if (!endpoint || !ENDPOINTS.has(endpoint)) return null;

  const pageFromPath = toPage(arg ?? params.get("page"));
  const pageFromQuery = toPage(params.get("page"));

  switch (endpoint) {
    case "home":
      return { body: await getHome(), cacheSeconds: seconds(TTL.list) };
    case "ongoing":
      return { body: await getOngoing(pageFromPath), cacheSeconds: seconds(TTL.list) };
    case "complete":
    case "completed":
      return { body: await getCompleted(pageFromPath), cacheSeconds: seconds(TTL.list) };
    case "schedule":
      return { body: await getSchedule(), cacheSeconds: seconds(TTL.schedule) };
    case "genres":
      return { body: await getGenres(), cacheSeconds: seconds(TTL.genres) };
    case "genre":
      return arg
        ? { body: await getByGenre(arg, pageFromQuery), cacheSeconds: seconds(TTL.list) }
        : null;
    case "search":
      return arg
        ? { body: await searchAnime(arg, pageFromQuery), cacheSeconds: seconds(TTL.list) }
        : null;
    case "detail":
      return arg
        ? { body: await getDetail(arg), cacheSeconds: seconds(TTL.detail) }
        : null;
    case "episode":
      return arg
        ? { body: await getEpisode(arg), cacheSeconds: seconds(TTL.episode) }
        : null;
    default:
      return null;
  }
}
