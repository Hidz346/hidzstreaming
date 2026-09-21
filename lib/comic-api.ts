import { fetchSankaJson } from "./sanka-api";

const fetchComicApi = (path: string) => fetchSankaJson(path);

export const getComicHomepage = () => fetchComicApi("/comic/homepage");
export const getComicTerbaru = () => fetchComicApi("/comic/terbaru");
export const getComicPopuler = () => fetchComicApi("/comic/populer");
export const getComicTrending = () => fetchComicApi("/comic/trending");
export const searchComics = (query: string) =>
  fetchComicApi(`/comic/search?q=${encodeURIComponent(query)}`);
export const getComicDetail = (slug: string) => fetchComicApi(`/comic/comic/${slug}`);
export const getComicChapter = (slug: string) => fetchComicApi(`/comic/chapter/${slug}`);
export const getComicChapterNavigation = (slug: string) =>
  fetchComicApi(`/comic/chapter/${slug}/navigation`);
export const getComicList = (type: string, page: number = 1) =>
  fetchComicApi(`/comic/type/${type}?page=${page}`);
