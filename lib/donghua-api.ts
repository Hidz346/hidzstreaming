import { fetchSankaJson } from "./sanka-api";

const fetchDonghuaApi = (path: string) => fetchSankaJson(`/anime/donghua${path}`);

export const getDonghuaHome = async () => {
  const data = await fetchDonghuaApi("/home/1");
  
  const recentList = (data.latest_release || []).map((item: any) => ({
    title: item.title,
    poster: item.poster,
    episodes: (item.current_episode || "").replace(/Ep\s*/i, "").trim(),
    releasedOn: "Baru",
    animeId: item.slug,
    href: `/watch?url=${item.slug}&source=donghua`,
    type: "episode"
  }));

  const completedList = (data.completed_donghua || []).map((item: any) => ({
    title: item.title,
    poster: item.poster,
    episodes: "END",
    releasedOn: "Tamat",
    animeId: item.slug,
    href: `/detail?url=${item.slug}&source=donghua`,
    type: "series"
  }));

  return { recent: recentList, completed: completedList };
};

export const searchDonghua = async (query: string) => {
  const data = await fetchDonghuaApi(`/search/${encodeURIComponent(query)}`);
  const list = Array.isArray(data) ? data : (data.search || data.data || []);

  return list.map((item: any) => ({
    title: item.title,
    poster: item.poster,
    status: item.status,
    rating: item.rating,
    animeId: item.slug,
    href: `/detail?url=${item.slug}&source=donghua`
  }));
};

export const getDonghuaDetail = async (slug: string) => {
  const raw = await fetchDonghuaApi(`/detail/${slug}`);

  return {
    title: raw.title,
    poster: raw.poster,
    status: raw.status,
    rating: raw.rating,
    releasedOn: raw.released,
    studio: raw.studio,
    season: raw.season,
    totalEpisodes: raw.total_episodes || raw.total_episode || raw.episodes,
    network: raw.network,
    country: raw.country,
    duration: raw.duration,
    updatedOn: raw.updated,
    synopsis: raw.synopsis,
    genres: raw.genres || [],
    episodes: (raw.episodes_list || []).map((ep: any) => ({
      title: ep.episode,
      episodeId: ep.slug,
      date: "",
      href: `/watch?url=${ep.slug}&source=donghua`
    }))
  };
};

export const getDonghuaEpisode = async (episodeId: string) => {
  const raw = await fetchDonghuaApi(`/episode/${episodeId}`);
  const details = raw.donghua_details || {};

  const serverList = (raw.streaming?.servers || []).map((server: any) => ({
    title: server.name,
    url: server.url
  }));

  if (raw.streaming?.main_url) {
    serverList.unshift({
      title: raw.streaming.main_url.name,
      url: raw.streaming.main_url.url
    });
  }

  const downloadLinks: any[] = [];
  if (raw.download_url) {
    for (const [resolution, links] of Object.entries(raw.download_url)) {
      const formattedRes = resolution.replace("download_url_", "").toUpperCase();
      const serverLinks = Object.entries(links as Record<string, string>).map(
        ([name, url]) => ({ name, url })
      );

      if (serverLinks.length > 0) {
        downloadLinks.push({ resolution: formattedRes, links: serverLinks });
      }
    }
  }

  return {
    title: raw.episode,
    animeId: details.slug,
    poster: details.poster,
    releasedOn: details.released,
    servers: serverList,
    downloads: downloadLinks,
    defaultStreamingUrl: raw.streaming?.main_url?.url || "",
    prevEpisode: raw.navigation?.previous_episode?.slug || null,
    nextEpisode: raw.navigation?.next_episode?.slug || null,
  };
};

export const getDonghuaOngoing = async (page: number | string = 1) => {
  const data = await fetchDonghuaApi(`/ongoing/${page}`);
  const list = data.ongoing_donghua || data.data || [];

  return list.map((item: any) => ({
    title: item.title,
    poster: item.poster,
    status: item.status,
    animeId: item.slug,
    href: `/detail?url=${item.slug}&source=donghua`
  }));
};

export const getDonghuaCompleted = async (page: number | string = 1) => {
  const data = await fetchDonghuaApi(`/completed/${page}`);
  const list = data.completed_donghua || data.data || [];

  return list.map((item: any) => ({
    title: item.title,
    poster: item.poster,
    status: item.status,
    animeId: item.slug,
    href: `/detail?url=${item.slug}&source=donghua`
  }));
};

export const getDonghuaSchedule = async () => {
  const data = await fetchDonghuaApi("/schedule");
  const list = Array.isArray(data) ? data : (data.schedule || data.data || []);

  const dayMap: Record<string, string> = {
    Sunday: "Minggu",
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu"
  };

  return list.map((day: any) => ({
    day: dayMap[day.day] || day.day,
    animeList: (day.donghua_list || []).map((item: any) => ({
      title: item.title,
      poster: item.poster,
      estimation: item.release_time || "",
      animeId: item.slug,
      href: `/detail?url=${item.slug}&source=donghua`
    }))
  }));
};

export const getDonghuaGenres = async () => {
  const data = await fetchDonghuaApi("/genres");
  const list = data.data || [];

  return list.map((item: any) => ({
    title: item.name,
    genreId: item.slug
  }));
};

export const getDonghuaByGenre = async (slug: string, page: number | string = 1) => {
  const data = await fetchDonghuaApi(`/genres/${slug}/${page}`);
  const list = data.donghua_list || data.data || [];

  return list.map((item: any) => ({
    title: item.title,
    poster: item.poster,
    status: item.status,
    animeId: item.slug,
    href: `/detail?url=${item.slug}&source=donghua`
  }));
};

export const getDonghuaAzList = async (letter: string, page: number | string = 1) => {
  const data = await fetchDonghuaApi(`/az-list/${letter}/${page}`);
  const list = data.donghua_list || data.data || [];

  return list.map((item: any) => ({
    title: item.title,
    poster: item.poster,
    status: item.status,
    animeId: item.slug,
    href: `/detail?url=${item.slug}&source=donghua`
  }));
};
