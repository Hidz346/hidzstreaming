// Use the internal proxy API so the client never calls Sanka directly.
const BASE_URL = "/api";

const fetchAnimeApi = async (path: string) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Anime API returned status ${res.status}`);
  }

  return res.json();
};

const sourcePath = (source: string) => encodeURIComponent(source);

export const getAnimeHome = async (source: string = "otakudesu") =>
  source === "otakudesu"
    ? fetchAnimeApi("/anime/home")
    : fetchAnimeApi(`/anime/${sourcePath(source)}/home`);

export const getAnimeSchedule = async (source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/schedule`);

export const getAnimeDetail = async (slug: string, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/detail/${encodeURIComponent(slug)}`);

export const getAnimeCompleted = async (page: number = 1, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/completed?page=${page}`);

export const getAnimeOngoing = async (page: number = 1, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/ongoing?page=${page}`);

export const getAnimeGenres = async (source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/genres`);

export const getAnimeByGenre = async (
  slug: string,
  page: number = 1,
  source: string = "otakudesu"
) =>
  fetchAnimeApi(
    `/anime/${sourcePath(source)}/genre/${encodeURIComponent(slug)}?page=${page}`
  );

export const getAnimeEpisode = async (slug: string, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/episode/${encodeURIComponent(slug)}`);

export const searchAnime = async (
  keyword: string,
  page: number = 1,
  source: string = "otakudesu"
) =>
  fetchAnimeApi(
    `/anime/${sourcePath(source)}/search/${encodeURIComponent(keyword)}?page=${page}`
  );

export const getAnimeBatch = async (slug: string, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/batch/${encodeURIComponent(slug)}`);

export const getAnimeServer = async (serverId: string, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/server/${encodeURIComponent(serverId)}`);

export const getAllAnime = async (page: number = 1, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/animelist?page=${page}`);

export const getAnimePopular = async (page: number = 1, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/popular?page=${page}`);

export const getAnimeLatest = async (page: number = 1, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/latest?page=${page}`);

export const getAnimeMovies = async (page: number = 1, source: string = "otakudesu") =>
  fetchAnimeApi(`/anime/${sourcePath(source)}/movies?page=${page}`);
