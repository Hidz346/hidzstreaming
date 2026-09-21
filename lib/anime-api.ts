// Use internal proxy API path
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

export const getAnimeHome = async (source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? "/anime/animasu/home" : "/anime/home");
};

export const getAnimeSchedule = async (source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? "/anime/animasu/schedule" : "/anime/schedule");
};

export const getAnimeDetail = async (slug: string, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/detail/${slug}` : `/anime/anime/${slug}`);
};

export const getAnimeCompleted = async (page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/completed?page=${page}` : `/anime/complete-anime?page=${page}`);
};

export const getAnimeOngoing = async (page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/ongoing?page=${page}` : `/anime/ongoing-anime?page=${page}`);
};

export const getAnimeGenres = async (source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? "/anime/animasu/genres" : "/anime/genre");
};

export const getAnimeByGenre = async (slug: string, page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/genre/${slug}?page=${page}` : `/anime/genre/${slug}?page=${page}`);
};

export const getAnimeEpisode = async (slug: string, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/episode/${slug}` : `/anime/episode/${slug}`);
};

export const searchAnime = async (keyword: string, page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/search/${encodeURIComponent(keyword)}?page=${page}` : `/anime/search/${encodeURIComponent(keyword)}`);
};

export const getAnimeBatch = async (slug: string, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/batch/${slug}` : `/anime/batch/${slug}`);
};

export const getAnimeServer = async (serverId: string, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/server/${serverId}` : `/anime/server/${serverId}`);
};

export const getAllAnime = async (page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/animelist?page=${page}` : `/anime/unlimited?page=${page}`);
};

export const getAnimePopular = async (page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/popular?page=${page}` : `/anime/ongoing-anime?page=${page}`);
};

export const getAnimeLatest = async (page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/latest?page=${page}` : `/anime/home`);
};

export const getAnimeMovies = async (page: number = 1, source: string = 'otakudesu') => {
  return await fetchAnimeApi(source === 'otakudesu' ? `/anime/animasu/movies?page=${page}` : `/anime/complete-anime?page=${page}`);
};

