import { load } from "cheerio";
import type { Cheerio } from "cheerio";

export type Pagination = {
  current: number;
  total: number | null;
  hasNext: boolean;
};

export type AnimeCard = {
  title: string;
  animeId: string;
  slug: string;
  poster: string;
  type?: string;
  status?: string;
  score?: string;
  episode?: string;
  synopsis?: string;
  genres?: string[];
};

export type EpisodeLink = {
  title: string;
  episodeId: string;
  slug: string;
  number: number | null;
  date?: string;
};

export type DownloadGroup = {
  resolution: string;
  mirrors: { name: string; url: string }[];
};

export type StreamSource = {
  name: string;
  url: string;
  type: "iframe" | "direct";
  quality?: string;
};

export type PlayerOption = {
  post: string;
  nume: string;
  type: string;
  label: string;
};

export type GenreLink = { title: string; slug: string };

export type ScheduleEntry = {
  title: string;
  animeId: string;
  slug: string;
  poster: string;
  type?: string;
  score?: string;
  genre?: string;
  time?: string;
};

const SAFE_SLUG = /^[a-z0-9][a-z0-9_-]*$/i;

const clean = (value?: string | null) => (value ?? "").replace(/\s+/g, " ").trim();

const textOf = (selection: Cheerio<any>) => clean(selection.text());

export const isSafeSlug = (value: string) => SAFE_SLUG.test(value);

/** Segmen terakhir dari sebuah URL, dipakai sebagai slug anime maupun episode. */
export const slugFromUrl = (href?: string | null) => {
  if (!href) return "";
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "");
  const last = path.split("/").pop() ?? "";

  try {
    return decodeURIComponent(last).toLowerCase();
  } catch {
    return last.toLowerCase();
  }
};

export const animeSlugFromEpisode = (episodeSlug: string) =>
  episodeSlug.replace(/-episode-\d+.*$/i, "");

export const isEpisodeSlug = (slug: string) => /-episode-\d+/i.test(slug);

export const episodeNumberOf = (value: string) => {
  const match = value.match(/-episode-(\d+)/i) || value.match(/episode\s+(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
};

const stripEpisodeSuffix = (title: string) =>
  clean(title.replace(/\s+episode\s+\d+.*$/i, ""));

const imageOf = (scope: Cheerio<any>) => {
  const img = scope.find("img").first();
  const candidates = [img.attr("data-src"), img.attr("data-lazy-src"), img.attr("src")];
  return candidates.find((value) => value && !value.startsWith("data:")) ?? "";
};

const normalizeStatus = (value?: string) => {
  if (!value) return undefined;
  if (/airing|ongoing|berjalan/i.test(value) && !/finish/i.test(value)) return "Ongoing";
  if (/finish|complete|tamat|selesai/i.test(value)) return "Completed";
  return value;
};

const parsePagination = (
  $: ReturnType<typeof load>,
  itemCount: number
): Pagination => {
  const numbers: number[] = [];
  let hasNextLink = false;

  $(".pagination a, .hpage a").each((_, el) => {
    const link = $(el);
    const label = clean(link.text());
    if (/^\d+$/.test(label)) numbers.push(parseInt(label, 10));
    if (/^(next|berikut|»)/i.test(label) || link.attr("rel") === "next") hasNextLink = true;
  });

  const currentLabel = clean($(".pagination .current, .hpage .current").first().text());
  const current = /^\d+$/.test(currentLabel) ? parseInt(currentLabel, 10) : 1;
  const total = numbers.length ? Math.max(current, ...numbers) : null;
  const hasMarkup = $(".pagination, .hpage").length > 0;

  return {
    current,
    total,
    hasNext: hasMarkup ? hasNextLink || (total !== null && current < total) : itemCount >= 10,
  };
};

/** Kartu episode terbaru di beranda. Tautannya mengarah ke episode, jadi diubah ke slug anime. */
export function parseEpisodeCards(html: string): AnimeCard[] {
  const $ = load(html);
  const seen = new Set<string>();
  const items: AnimeCard[] = [];

  $(".post-show ul li").each((_, el) => {
    const card = $(el);
    const link = card.find("a").first().attr("href");
    const rawTitle =
      textOf(card.find(".title h2")) ||
      textOf(card.find(".dtla h2 a")) ||
      textOf(card.find(".tt"));

    if (!link || !rawTitle) return;

    const episodeSlug = slugFromUrl(link);
    const animeId = animeSlugFromEpisode(episodeSlug);
    if (!animeId || seen.has(animeId)) return;
    seen.add(animeId);

    const label = textOf(card.find(".epx")) || textOf(card.find(".dtla span author").first());
    const number = episodeNumberOf(episodeSlug) ?? (label.match(/\d+/) ? parseInt(label.match(/\d+/)![0], 10) : null);

    items.push({
      title: stripEpisodeSuffix(rawTitle) || rawTitle,
      animeId,
      slug: animeId,
      poster: imageOf(card),
      type: textOf(card.find(".type").first()) || undefined,
      status: "Ongoing",
      episode: number !== null ? `Episode ${number}` : undefined,
    });
  });

  return items;
}

/** Daftar anime hasil katalog, pencarian, dan halaman genre. */
export function parseCatalog(html: string): { items: AnimeCard[]; pagination: Pagination } {
  const $ = load(html);
  const items: AnimeCard[] = [];

  $(".relat .animpost").each((_, el) => {
    const card = $(el);
    const link = card.find("a").first().attr("href");
    const title = textOf(card.find(".title h2").first());
    const slug = slugFromUrl(link);

    if (!link || !title || !slug) return;

    const genres = card
      .find(".stooltip .genres .mta a")
      .map((__, a) => clean($(a).text()))
      .get();

    items.push({
      title,
      animeId: slug,
      slug,
      poster: imageOf(card),
      type: textOf(card.find(".type").first()) || undefined,
      status: normalizeStatus(textOf(card.find(".type").eq(1)) || textOf(card.find(".status"))),
      score: textOf(card.find(".score")) || undefined,
      synopsis: textOf(card.find(".stooltip .ttls")) || undefined,
      genres: genres.length ? genres : undefined,
    });
  });

  return { items, pagination: parsePagination($, items.length) };
}

const parseEpisodeList = ($: ReturnType<typeof load>): EpisodeLink[] => {
  const seen = new Set<string>();
  const episodes: EpisodeLink[] = [];

  $(".lstepsiode.listeps ul li").each((_, el) => {
    const row = $(el);
    const anchor = row.find(".lchx a").first();
    const href = anchor.attr("href");
    const rawTitle = clean(anchor.text());
    const slug = slugFromUrl(href);

    if (!href || !rawTitle || !slug || seen.has(slug)) return;
    seen.add(slug);

    const number = episodeNumberOf(slug) ?? episodeNumberOf(rawTitle);

    episodes.push({
      title: number !== null ? `Episode ${number}` : rawTitle,
      episodeId: slug,
      slug,
      number,
      date: textOf(row.find(".date")) || undefined,
    });
  });

  // Episode terbaru di urutan pertama, sesuai yang diharapkan halaman detail dan watch.
  return episodes.sort((a, b) => (b.number ?? -1) - (a.number ?? -1));
};

const INFO_ALIASES: Record<string, string[]> = {
  japanese: ["japanese", "judul_jepang", "synonyms", "english"],
  status: ["status"],
  type: ["type", "tipe"],
  duration: ["duration", "durasi"],
  season: ["season", "musim"],
  studio: ["studio"],
  episodes: ["total_episode", "total_episodes", "episode", "episodes"],
  released: ["released", "rilis", "aired", "tayang"],
};

const pickInfo = (info: Record<string, string>, field: keyof typeof INFO_ALIASES) => {
  for (const key of INFO_ALIASES[field]) {
    if (info[key]) return info[key];
  }
  return undefined;
};

export type AnimeDetail = {
  title: string;
  poster: string;
  score?: string;
  synopsis: string;
  genres: GenreLink[];
  japanese?: string;
  status?: string;
  type?: string;
  duration?: string;
  season?: string;
  studio?: string;
  episodes?: string;
  released?: string;
  episodeList: EpisodeLink[];
  recommended: AnimeCard[];
};

export function parseDetail(html: string): AnimeDetail {
  const $ = load(html);

  const info: Record<string, string> = {};
  $(".infox .spe span").each((_, el) => {
    const row = $(el);
    const label = clean(row.find("b").first().text());
    const full = clean(row.text());

    let key = label;
    let value = label ? clean(full.slice(full.indexOf(label) + label.length)) : "";

    if (!label) {
      const parts = full.split(/\s+/);
      if (parts.length < 2) return;
      key = parts[0];
      value = parts.slice(1).join(" ");
    }

    key = key.replace(/:$/, "").trim().toLowerCase().replace(/\s+/g, "_");
    value = value.replace(/^:\s*/, "");
    if (key && value) info[key] = value;
  });

  const genres: GenreLink[] = [];
  $(".genre-info a").each((_, el) => {
    const link = $(el);
    const title = clean(link.text());
    if (!title) return;
    genres.push({ title, slug: slugFromUrl(link.attr("href")) || title.toLowerCase().replace(/\s+/g, "-") });
  });

  const recommended: AnimeCard[] = [];
  $(".rand-animesu ul li").each((_, el) => {
    const row = $(el);
    const href = row.find(".series").attr("href") || row.find("a").first().attr("href");
    const title = textOf(row.find(".judul"));
    const slug = slugFromUrl(href);
    if (!title || !slug) return;

    recommended.push({
      title,
      animeId: slug,
      slug,
      poster: imageOf(row),
      score: textOf(row.find(".rating")) || undefined,
      episode: textOf(row.find(".episode")) || undefined,
    });
  });

  return {
    title: textOf($("h1.entry-title").first()),
    poster: imageOf($(".thumb").first()),
    score:
      textOf($('.rtg .archiveanime-rating span[itemprop="ratingValue"]').first()) ||
      textOf($('[itemprop="ratingValue"]').first()) ||
      undefined,
    synopsis: $(".entry-content-single p")
      .map((_, p) => clean($(p).text()))
      .get()
      .filter(Boolean)
      .join("\n"),
    genres,
    japanese: pickInfo(info, "japanese"),
    status: normalizeStatus(pickInfo(info, "status")),
    type: pickInfo(info, "type"),
    duration: pickInfo(info, "duration"),
    season: pickInfo(info, "season"),
    studio: pickInfo(info, "studio"),
    episodes: pickInfo(info, "episodes"),
    released: pickInfo(info, "released"),
    episodeList: parseEpisodeList($),
    recommended: recommended.slice(0, 10),
  };
}

export type EpisodePage = {
  title: string;
  poster: string;
  downloads: DownloadGroup[];
  defaultPlayer: string | null;
  playerOptions: PlayerOption[];
  episodeList: EpisodeLink[];
  prev: string | null;
  next: string | null;
};

export function parseEpisodePage(html: string): EpisodePage {
  const $ = load(html);

  const downloads: DownloadGroup[] = [];
  $(".download-eps ul li").each((_, el) => {
    const row = $(el);
    const resolution = textOf(row.find("strong"));
    const mirrors: DownloadGroup["mirrors"] = [];

    row.find("span a").each((__, a) => {
      const link = $(a);
      const url = link.attr("href");
      if (url && /^https?:\/\//i.test(url)) mirrors.push({ name: clean(link.text()), url });
    });

    if (resolution && mirrors.length) downloads.push({ resolution, mirrors });
  });

  const playerOptions: PlayerOption[] = [];
  $(".east_player_option").each((_, el) => {
    const option = $(el);
    const post = option.attr("data-post");
    const nume = option.attr("data-nume");
    const type = option.attr("data-type");
    if (post && nume && type) {
      playerOptions.push({ post, nume, type, label: textOf(option) || `Server ${nume}` });
    }
  });

  const frame = $("#pembed iframe, #player_embed iframe, .player-embed iframe").first();
  const defaultPlayer = frame.attr("src") || frame.attr("data-src") || null;

  return {
    title: textOf($("h1.entry-title").first()),
    poster: imageOf($(".infoanime .thumb, .thumb-batch").first()),
    downloads,
    defaultPlayer,
    playerOptions,
    episodeList: parseEpisodeList($),
    prev: $(".naveps .nvs:first-child a").attr("href") || null,
    next: $(".naveps .nvs:last-child a").attr("href") || null,
  };
}

/** Mengambil src iframe (atau video) dari jawaban admin-ajax pemilih server. */
export function parseEmbed(html: string): string | null {
  const $ = load(html);
  const frame = $("iframe").first();
  const src = frame.attr("src") || frame.attr("data-src") || $("video source").first().attr("src");
  return src ? src.trim() : null;
}

/** Mengubah tautan unduhan yang bisa diputar langsung menjadi sumber streaming. */
export function buildStreams(downloads: DownloadGroup[]): StreamSource[] {
  const streams: StreamSource[] = [];
  const seen = new Set<string>();

  const add = (stream: StreamSource) => {
    if (seen.has(stream.url)) return;
    seen.add(stream.url);
    streams.push(stream);
  };

  for (const group of downloads) {
    for (const mirror of group.mirrors) {
      const label = clean(`${mirror.name} ${group.resolution}`);
      const pixeldrain = mirror.url.match(/pixeldrain\.com\/u\/([\w-]+)/i);
      const vidhide = mirror.url.match(/vidhidepre\.com\/file\/([\w-]+)/i);

      if (pixeldrain) {
        add({
          name: label,
          url: `https://pixeldrain.com/api/file/${pixeldrain[1]}`,
          type: "direct",
          quality: group.resolution,
        });
      } else if (vidhide) {
        add({
          name: label,
          url: `https://vidhidepre.com/embed/${vidhide[1]}`,
          type: "iframe",
          quality: group.resolution,
        });
      } else if (/acefile\.co/i.test(mirror.url) && /720p/i.test(group.resolution)) {
        const filename = (mirror.url.split("/").pop() ?? "")
          .replace(/_/g, "-")
          .replace(/\.mp4$/i, "");

        if (filename) {
          add({
            name: "Premium 720p",
            url: `https://api.wibufile.com/embed/${filename}`,
            type: "iframe",
            quality: "720p",
          });
        }
      } else if (/blogger\.com/i.test(mirror.url)) {
        add({ name: "Blogger", url: mirror.url, type: "iframe" });
      }
    }
  }

  return streams;
}

const NUMERIC_LABEL = /^\d+$/;

/** Mengumpulkan semua tautan /genre/<slug>/ yang muncul di sebuah halaman. */
export function parseGenreLinks(html: string): GenreLink[] {
  const $ = load(html);
  const found = new Map<string, string>();

  $('a[href*="/genre/"]').each((_, el) => {
    const link = $(el);
    const href = (link.attr("href") ?? "").split(/[?#]/)[0].replace(/\/+$/, "");
    const slug = href.match(/\/genre\/([a-z0-9_-]+)$/i)?.[1]?.toLowerCase();
    const title = clean(link.text()).replace(/\s*\(\d+\)$/, "");

    if (!slug || !title || title.length > 30 || NUMERIC_LABEL.test(title)) return;
    if (!found.has(slug)) found.set(slug, title);
  });

  return Array.from(found, ([slug, title]) => ({ slug, title }));
}

/** Cadangan jadwal bila endpoint wp-json tidak tersedia. */
export function parseScheduleHtml(html: string): ScheduleEntry[] {
  const $ = load(html);
  const entries: ScheduleEntry[] = [];

  $(".result-schedule .animepost").each((_, el) => {
    const card = $(el);
    const slug = slugFromUrl(card.find("a").first().attr("href"));
    const title = textOf(card.find(".data .title"));
    if (!slug || !title) return;

    entries.push({
      title,
      animeId: slug,
      slug,
      poster: imageOf(card.find(".content-thumb").first()),
      type: textOf(card.find(".content-thumb .type")) || undefined,
      score: textOf(card.find(".score")) || undefined,
      genre: textOf(card.find(".data .type")) || undefined,
      time: textOf(card.find(".data_tw .ltseps")) || undefined,
    });
  });

  return entries;
}
