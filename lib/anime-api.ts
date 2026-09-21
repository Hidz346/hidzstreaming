const BASE_URL = "/api";

type AnimeResponse = Record<string, any>;

const fetchAnimeApi = async (path: string): Promise<AnimeResponse> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Anime API returned status ${res.status}`);
  }

  return res.json();
};

const sourcePath = (source: string) => encodeURIComponent(source);
const pageQuery = (page: number) => `?page=${Math.max(1, page)}`;

const getHomeResponse = (source: string) =>
  source === "otakudesu"
    ? fetchAnimeApi("/anime/home")
    : fetchAnimeApi(`/anime/${sourcePath(source)}/home`);

const extractList = (response: AnimeResponse, keys: string[]) => {
  for (const key of keys) {
    const value = response?.[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && Array.isArray(value.animeList)) {
      return value.animeList;
    }
  }

  const data = response?.data;
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.animeList)) return data.animeList;

    for (const key of keys) {
      const value = data[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object" && Array.isArray(value.animeList)) {
        return value.animeList;
      }
    }
  }

  const result = response?.result;
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object") {
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.animeList)) return result.animeList;
  }

  return [];
};

const firstString = (...values: unknown[]) =>
  values.find((value) => typeof value === "string" && value.trim()) as
    | string
    | undefined;

const getPathSlug = (value: string) => {
  try {
    const parsed = new URL(value, "https://local.invalid");
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return value.split("/").filter(Boolean).pop() || value;
  }
};

export const getAnimeIdentifier = (item: any) => {
  const direct = firstString(
    item?.anime_slug,
    item?.slug,
    item?.endpoint,
    item?.animeId,
    item?.id
  );

  if (direct) return getPathSlug(direct);

  const href = firstString(item?.href, item?.url, item?.link, item?.otakudesu_url);
  return href ? getPathSlug(href) : "";
};

export const getAnimeDetailHref = (item: any, source: string = "otakudesu") => {
  const identifier = getAnimeIdentifier(item);
  return identifier
    ? `/anime/${sourcePath(source)}/detail/${encodeURIComponent(identifier)}`
    : "#";
};

export const unwrapAnimeDetail = (response: any) => {
  const candidates = [
    response?.detail,
    response?.anime_detail,
    response?.anime,
    response?.data?.detail,
    response?.data?.anime_detail,
    response?.data?.anime,
    response?.data,
    response?.result?.detail,
    response?.result?.anime_detail,
    response?.result?.anime,
    response?.result,
    response?.data?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      (
        candidate.title ||
        candidate.anime_name ||
        candidate.name ||
        candidate.episodeList ||
        candidate.episode_list ||
        candidate.episode_lists ||
        candidate.episodes
      )
    ) {
      return candidate;
    }
  }

  return null;
};

export const getAnimeHome = async (source: string = "otakudesu") =>
  getHomeResponse(source);

export const getAnimeSchedule = async (source: string = "otakudesu") => {
  const response = await getHomeResponse(source);
  const schedule = extractList(response, ["schedule", "schedules"]);
  return { ...response, schedule };
};

export const getAnimeDetail = async (
  slug: string,
  source: string = "otakudesu"
) =>
  fetchAnimeApi(
    `/anime/${sourcePath(source)}/detail/${encodeURIComponent(slug)}`
  );

export const getAnimeCompleted = async (
  page: number = 1,
  source: string = "otakudesu"
) => {
  const response =
    source === "otakudesu"
      ? await fetchAnimeApi(`/anime/complete/${Math.max(1, page)}`)
      : await getHomeResponse(source);
  const completed = extractList(response, [
    "completed",
    "complete",
    "latestCompleted",
    "complete_anime",
    "animeList",
  ]);
  return {
    ...response,
    data: completed,
    animes: completed,
    animeList: completed,
    page,
  };
};

export const getAnimeOngoing = async (
  page: number = 1,
  source: string = "otakudesu"
) => {
  const response =
    source === "otakudesu"
      ? await fetchAnimeApi(`/anime/ongoing/${Math.max(1, page)}`)
      : await getHomeResponse(source);
  const ongoing = extractList(response, [
    "ongoing",
    "on_going",
    "latest",
    "animeList",
    "ongoing_anime",
  ]);
  return {
    ...response,
    data: ongoing,
    animes: ongoing,
    animeList: ongoing,
    page,
  };
};

export const getAnimeGenres = async (source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/genres`);

export const getAnimeByGenre = async (
  slug: string,
  page: number = 1,
  source: string = "otakudesu"
) =>
  fetchAnimeApi(
    `/anime/${sourcePath(source)}/genre/${encodeURIComponent(slug)}${pageQuery(page)}`
  );

export const getAnimeEpisode = async (
  slug: string,
  source: string = "otakudesu"
) =>
  fetchAnimeApi(
    `/anime/${sourcePath(source)}/episode/${encodeURIComponent(slug)}`
  );

export const searchAnime = async (
  keyword: string,
  page: number = 1,
  source: string = "otakudesu"
) =>
  fetchAnimeApi(
    `/anime/${sourcePath(source)}/search/${encodeURIComponent(keyword)}${pageQuery(page)}`
  );

export const getAnimeBatch = async (slug: string, source: string = "otakudesu") =>
  getAnimeDetail(slug, source);

export const getAnimeServer = async (serverId: string, source: string = "otakudesu") =>
  getAnimeEpisode(serverId, source);

export const getAllAnime = async (page: number = 1, source: string = "otakudesu") =>
  getAnimeOngoing(page, source);

export const getAnimePopular = async (
  page: number = 1,
  source: string = "otakudesu"
) => {
  const response = await getHomeResponse(source);
  const popular = extractList(response, [
    "popular",
    "mostPopular",
    "trending",
    "animeList",
    "ongoing",
    "latest",
    "ongoing_anime",
  ]);
  return {
    ...response,
    data: { ...(response?.data || {}), animes: popular },
    animes: popular,
    page,
  };
};

export const getAnimeLatest = async (
  page: number = 1,
  source: string = "otakudesu"
) => getAnimeOngoing(page, source);

export const getAnimeMovies = async (
  page: number = 1,
  source: string = "otakudesu"
) => {
  const response = await getHomeResponse(source);
  const movies = extractList(response, ["movies", "movie", "animeList"]);
  return { ...response, data: movies, animes: movies, animeList: movies, page };
};
