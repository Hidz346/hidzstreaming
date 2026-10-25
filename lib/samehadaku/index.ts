import { SamehadakuError, absoluteUrl, cached, requestText } from "./http";
import {
  animeSlugFromEpisode,
  buildStreams,
  episodeNumberOf,
  isEpisodeSlug,
  isSafeSlug,
  parseCatalog,
  parseDetail,
  parseEmbed,
  parseEpisodeCards,
  parseEpisodePage,
  parseGenreLinks,
  parseScheduleHtml,
  slugFromUrl,
} from "./parsers";
import type {
  AnimeCard,
  EpisodeLink,
  GenreLink,
  Pagination,
  PlayerOption,
  ScheduleEntry,
  StreamSource,
} from "./parsers";

export { SamehadakuError } from "./http";

const MINUTE = 60_000;

export const TTL = {
  list: 5 * MINUTE,
  detail: 15 * MINUTE,
  episode: 5 * MINUTE,
  schedule: 30 * MINUTE,
  genres: 60 * MINUTE,
};

const MAX_PLAYER_OPTIONS = 6;

const SCHEDULE_DAYS = [
  ["monday", "Senin"],
  ["tuesday", "Selasa"],
  ["wednesday", "Rabu"],
  ["thursday", "Kamis"],
  ["friday", "Jumat"],
  ["saturday", "Sabtu"],
  ["sunday", "Minggu"],
] as const;

// Dipakai bila daftar genre tidak bisa dibaca dari situs sumber.
const FALLBACK_GENRES: GenreLink[] = [
  ["action", "Action"],
  ["adventure", "Adventure"],
  ["comedy", "Comedy"],
  ["demons", "Demons"],
  ["drama", "Drama"],
  ["ecchi", "Ecchi"],
  ["fantasy", "Fantasy"],
  ["game", "Game"],
  ["harem", "Harem"],
  ["historical", "Historical"],
  ["horror", "Horror"],
  ["isekai", "Isekai"],
  ["josei", "Josei"],
  ["magic", "Magic"],
  ["martial-arts", "Martial Arts"],
  ["mecha", "Mecha"],
  ["military", "Military"],
  ["music", "Music"],
  ["mystery", "Mystery"],
  ["parody", "Parody"],
  ["psychological", "Psychological"],
  ["romance", "Romance"],
  ["school", "School"],
  ["sci-fi", "Sci-Fi"],
  ["seinen", "Seinen"],
  ["shoujo", "Shoujo"],
  ["shounen", "Shounen"],
  ["slice-of-life", "Slice of Life"],
  ["sports", "Sports"],
  ["super-power", "Super Power"],
  ["supernatural", "Supernatural"],
  ["thriller", "Thriller"],
  ["vampire", "Vampire"],
].map(([slug, title]) => ({ slug, title }));

type CatalogFilters = { status?: string; type?: string; order?: string };

const catalogPath = (page: number, filters: CatalogFilters) => {
  const query = new URLSearchParams({ title: "" });
  if (filters.status) query.set("status", filters.status);
  if (filters.type) query.set("type", filters.type);
  if (filters.order) query.set("order", filters.order);

  const base = page > 1 ? `/daftar-anime-2/page/${page}/` : "/daftar-anime-2/";
  return `${base}?${query.toString()}`;
};

const listPayload = (items: AnimeCard[], page: number, pagination: Pagination) => ({
  status: "success",
  data: { animeList: items },
  pagination: {
    currentPage: page,
    hasNextPage: pagination.hasNext,
    hasNext: pagination.hasNext,
    totalPages: pagination.total,
  },
});

const emptyList = (page: number) =>
  listPayload([], page, { current: page, total: null, hasNext: false });

const withStatus = (items: AnimeCard[], status: string) =>
  items.map((item) => ({ ...item, status }));

const assertSlug = (slug: string) => {
  if (!isSafeSlug(slug)) throw new SamehadakuError("Slug tidak valid", 404);
};

const isNotFound = (error: unknown) =>
  error instanceof SamehadakuError && error.status === 404;

const loadCatalog = async (path: string) => parseCatalog(await requestText(path));

const homeHtml = () => cached("page:home", TTL.list, () => requestText("/"));

const settledValue = <T>(result: PromiseSettledResult<T[]>): T[] =>
  result.status === "fulfilled" ? result.value : [];

export const getHome = () =>
  cached("home", TTL.list, async () => {
    const loadLatest = async () => {
      const cards = parseEpisodeCards(await homeHtml());
      if (cards.length) return cards;

      const airing = await loadCatalog(
        catalogPath(1, { status: "Currently Airing", order: "update" })
      );
      return withStatus(airing.items, "Ongoing");
    };

    const [latest, completed, popular, movies] = await Promise.allSettled([
      loadLatest(),
      loadCatalog(catalogPath(1, { status: "Finished Airing", order: "update" })).then(
        (result) => withStatus(result.items, "Completed")
      ),
      loadCatalog(catalogPath(1, { order: "popular" })).then((result) => result.items),
      loadCatalog(catalogPath(1, { type: "Movie", order: "update" })).then(
        (result) => result.items
      ),
    ]);

    const ongoingList = settledValue(latest);
    const completedList = settledValue(completed);

    if (!ongoingList.length && !completedList.length) {
      const failure = [latest, completed].find((result) => result.status === "rejected");
      throw failure && failure.status === "rejected"
        ? failure.reason
        : new SamehadakuError("Beranda sumber anime kosong");
    }

    return {
      status: "success",
      data: {
        ongoing_anime: ongoingList,
        complete_anime: completedList,
        popular: settledValue(popular),
        movies: settledValue(movies),
      },
    };
  });

export const getOngoing = (page: number) =>
  cached(`ongoing:${page}`, TTL.list, async () => {
    const { items, pagination } = await loadCatalog(
      catalogPath(page, { status: "Currently Airing", order: "update" })
    );

    if (!items.length && page === 1) {
      throw new SamehadakuError("Daftar ongoing kosong");
    }

    return listPayload(withStatus(items, "Ongoing"), page, pagination);
  });

export const getCompleted = (page: number) =>
  cached(`completed:${page}`, TTL.list, async () => {
    const { items, pagination } = await loadCatalog(
      catalogPath(page, { status: "Finished Airing", order: "update" })
    );

    if (!items.length && page === 1) {
      throw new SamehadakuError("Daftar completed kosong");
    }

    return listPayload(withStatus(items, "Completed"), page, pagination);
  });

export const getByGenre = (slug: string, page: number) =>
  cached(`genre:${slug}:${page}`, TTL.list, async () => {
    assertSlug(slug);

    try {
      const path = page > 1 ? `/genre/${slug}/page/${page}/` : `/genre/${slug}/`;
      const { items, pagination } = await loadCatalog(path);
      return listPayload(items, page, pagination);
    } catch (error) {
      if (isNotFound(error)) return emptyList(page);
      throw error;
    }
  });

export const searchAnime = (query: string, page: number) => {
  const keyword = query.trim().slice(0, 100);

  return cached(`search:${keyword.toLowerCase()}:${page}`, TTL.list, async () => {
    if (!keyword) return emptyList(page);

    try {
      const encoded = encodeURIComponent(keyword);
      const path = page > 1 ? `/search/${encoded}/page/${page}/` : `/search/${encoded}/`;
      const { items, pagination } = await loadCatalog(path);
      return listPayload(items, page, pagination);
    } catch (error) {
      if (isNotFound(error)) return emptyList(page);
      throw error;
    }
  });
};

export const getGenres = () =>
  cached("genres", TTL.genres, async () => {
    let genres: GenreLink[] = [];

    try {
      genres = parseGenreLinks(await homeHtml());
    } catch {
      // Dibiarkan kosong, daftar bawaan dipakai di bawah.
    }

    if (genres.length < 10) {
      const known = new Set(genres.map((genre) => genre.slug));
      genres = [...genres, ...FALLBACK_GENRES.filter((genre) => !known.has(genre.slug))];
    }

    genres.sort((a, b) => a.title.localeCompare(b.title));

    return {
      status: "success",
      data: {
        genreList: genres.map((genre) => ({
          title: genre.title,
          genreId: genre.slug,
          slug: genre.slug,
        })),
      },
    };
  });

const cleanScheduleUrl = (url: string) => url.replace(/^https?:\/\/[^/]+(?=https?:\/\/)/i, "");

async function loadScheduleDay(day: string): Promise<ScheduleEntry[]> {
  const body = await requestText(`/wp-json/custom/v1/all-schedule?perpage=20&day=${day}`, {
    ajax: true,
    attempts: 1,
  });

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new SamehadakuError("Jadwal tidak mengembalikan JSON");
  }

  if (!Array.isArray(data)) return [];

  const entries: ScheduleEntry[] = [];
  for (const item of data) {
    const slug = slugFromUrl(cleanScheduleUrl(String(item?.url ?? "")));
    const title = String(item?.title ?? "").trim();
    if (!slug || !title) continue;

    entries.push({
      title,
      animeId: slug,
      slug,
      poster: String(item?.featured_img_src ?? ""),
      type: item?.east_type || undefined,
      score: item?.east_score || undefined,
      genre: item?.genre || undefined,
      time: item?.east_time || undefined,
    });
  }

  return entries;
}

export const getSchedule = () =>
  cached("schedule", TTL.schedule, async () => {
    const days = await Promise.allSettled(
      SCHEDULE_DAYS.map(([key]) => loadScheduleDay(key))
    );

    let schedule: { day: string; animeList: ScheduleEntry[] }[] = SCHEDULE_DAYS.map(
      ([, label], index) => ({ day: label, animeList: settledValue(days[index]) })
    ).filter((group) => group.animeList.length > 0);

    if (!schedule.length) {
      const fallback = parseScheduleHtml(await requestText("/jadwal-rilis/"));
      if (!fallback.length) throw new SamehadakuError("Jadwal rilis kosong");
      schedule = [{ day: "Jadwal", animeList: fallback }];
    }

    return { status: "success", schedule };
  });

const toEpisodeItem = (episode: EpisodeLink) => ({
  title: episode.title,
  episodeId: episode.episodeId,
  slug: episode.slug,
  date: episode.date,
});

async function loadAnimePage(slug: string) {
  const detail = parseDetail(await requestText(`/anime/${slug}/`));
  if (!detail.title) throw new SamehadakuError("Halaman anime tidak dikenali");
  return detail;
}

export const getDetail = (slug: string) =>
  cached(`detail:${slug}`, TTL.detail, async () => {
    assertSlug(slug);

    let detail;
    try {
      detail = await loadAnimePage(slug);
    } catch (error) {
      // Kartu di beranda bisa membawa slug episode, jadi coba slug animenya.
      if (!isNotFound(error) || !isEpisodeSlug(slug)) throw error;
      detail = await loadAnimePage(animeSlugFromEpisode(slug));
    }

    return {
      status: "success",
      data: {
        title: detail.title,
        japanese: detail.japanese,
        poster: detail.poster,
        status: detail.status,
        type: detail.type,
        score: detail.score,
        studio: detail.studio,
        season: detail.season,
        episodes: detail.episodes,
        release_date: detail.released,
        duration: detail.duration,
        synopsis: detail.synopsis,
        genre_list: detail.genres.map((genre) => ({
          genreName: genre.title,
          genreId: genre.slug,
        })),
        episode_lists: detail.episodeList.map(toEpisodeItem),
        recommendations: detail.recommended,
      },
    };
  });

/** Hanya URL http(s) yang boleh masuk ke iframe, dan selalu dinaikkan ke https. */
const toEmbedUrl = (url: string) => {
  const value = url.trim();
  if (value.startsWith("//")) return `https:${value}`;
  return /^https?:\/\//i.test(value) ? value.replace(/^http:\/\//i, "https://") : "";
};

const cleanEpisodeTitle = (title: string) =>
  title
    .replace(/^nonton\s+(?:anime\s+)?/i, "")
    .replace(/\s+subtitle\s+indonesia\s*$/i, "")
    .trim();

async function loadPlayerStreams(
  options: PlayerOption[],
  referer: string
): Promise<StreamSource[]> {
  const results = await Promise.allSettled(
    options.slice(0, MAX_PLAYER_OPTIONS).map(async (option) => {
      const html = await requestText("/wp-admin/admin-ajax.php", {
        form: {
          action: "player_ajax",
          post: option.post,
          nume: option.nume,
          type: option.type,
        },
        referer,
        ajax: true,
        timeout: 6000,
        attempts: 1,
      });

      const url = toEmbedUrl(parseEmbed(html) ?? "");
      return url ? ({ name: option.label, url, type: "iframe" } as StreamSource) : null;
    })
  );

  return results.flatMap((result) =>
    result.status === "fulfilled" && result.value ? [result.value] : []
  );
}

export const getEpisode = (slug: string) =>
  cached(`episode:${slug}`, TTL.episode, async () => {
    assertSlug(slug);

    const pageUrl = absoluteUrl(`/${slug}/`);
    const page = parseEpisodePage(await requestText(pageUrl));
    if (!page.title) throw new SamehadakuError("Halaman episode tidak dikenali");

    const embedded = await loadPlayerStreams(page.playerOptions, pageUrl);

    const streams: StreamSource[] = [];
    const seen = new Set<string>();
    const push = (stream: StreamSource) => {
      if (seen.has(stream.url)) return;
      seen.add(stream.url);
      streams.push(stream);
    };

    const defaultUrl = toEmbedUrl(page.defaultPlayer ?? "");
    if (defaultUrl) push({ name: "Default", url: defaultUrl, type: "iframe" });
    embedded.forEach(push);
    buildStreams(page.downloads).forEach(push);

    // Embed lebih dulu, file langsung (butuh hotlink) di urutan akhir.
    streams.sort((a, b) => Number(a.type === "direct") - Number(b.type === "direct"));

    // Daftar episode lebih bisa dipercaya daripada tombol navigasi, yang bisa menunjuk episode yang belum rilis.
    const index = page.episodeList.findIndex((episode) => episode.slug === slug);
    const listed = index !== -1;
    const prev = listed ? page.episodeList[index + 1]?.slug : slugFromUrl(page.prev);
    const next = listed ? page.episodeList[index - 1]?.slug : slugFromUrl(page.next);

    const number = episodeNumberOf(slug);
    const title = cleanEpisodeTitle(page.title);

    return {
      status: "success",
      data: {
        title,
        episode: number !== null ? `Episode ${number}` : undefined,
        poster: page.poster,
        anime: {
          slug: animeSlugFromEpisode(slug),
          title: title.replace(/\s+episode\s+\d+.*$/i, "").trim(),
        },
        streams,
        downloads: page.downloads.map((group) => ({
          title: group.resolution,
          resolution: group.resolution,
          urls: group.mirrors.map((mirror) => ({ server: mirror.name, url: mirror.url })),
        })),
        episode_lists: page.episodeList.map(toEpisodeItem),
        prevEpisode: prev ? { episodeId: prev } : null,
        nextEpisode: next ? { episodeId: next } : null,
      },
    };
  });
