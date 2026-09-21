const BASE_URL = "/api";

type AnimeResponse = Record<string, any>;

const fetchAnimeApi = async (path: string): Promise<AnimeResponse> => {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 600 },
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
    for (const key of keys) {
      const value = data[key];
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object" && Array.isArray(value.animeList)) {
        return value.animeList;
      }
    }
  }

  return [];
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
  const response = await getHomeResponse(source);
  const completed = extractList(response, ["completed", "complete", "latestCompleted"]);
  return { ...response, data: completed, animes: completed, animeList: completed, page };
};

export const getAnimeOngoing = async (
  page: number = 1,
  source: string = "otakudesu"
) => {
  const response = await getHomeResponse(source);
  const ongoing = extractList(response, ["ongoing", "on_going", "latest", "animeList"]);
  return { ...response, data: ongoing, animes: ongoing, animeList: ongoing, page };
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
  const popular = extractList(response, ["popular", "mostPopular", "trending", "animeList", "ongoing", "latest"]);
  return { ...response, data: { ...(response?.data || {}), animes: popular }, animes: popular, page };
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
