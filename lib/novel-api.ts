import { fetchSankaJson } from "./sanka-api";

const fetchNovelApi = (path: string) => fetchSankaJson(path);

export const getNovelHome = () => fetchNovelApi("/novel/home");
export const getNovelHotSearch = () => fetchNovelApi("/novel/hot-search");
export const searchNovels = (query: string) =>
  fetchNovelApi(`/novel/search?q=${encodeURIComponent(query)}`);
export const getNovelGenre = (id: string) => fetchNovelApi(`/novel/genre/${id}`);
export const getNovelChapters = (novelId: string) =>
  fetchNovelApi(`/novel/chapters/${novelId}`);
