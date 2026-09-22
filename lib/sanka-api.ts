const DEFAULT_BASE_URL = "https://sankavollerei.web.id";
const COMMUNITY_BASE_URL = "https://api.otakudesu.natee.my.id";

const REQUEST_TIMEOUT = 8000;
const MAX_ATTEMPTS_PER_BASE = 2;

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");

const configuredBases = [
  process.env.SANKA_API_URL,
  process.env.SANKA_API_FALLBACK_URL,
  DEFAULT_BASE_URL,
  "https://www.sankavollerei.web.id",
]
  .filter((url): url is string => Boolean(url))
  .map(normalizeBaseUrl);

const BASE_URLS = Array.from(new Set(configuredBases));
const PRIMARY_BASE_URL = normalizeBaseUrl(
  process.env.SANKA_API_URL || DEFAULT_BASE_URL
);

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const buildUrl = (base: string, path: string) =>
  `${normalizeBaseUrl(base)}${normalizePath(path)}`;

const isRetryableStatus = (status: number) =>
  status === 408 ||
  status === 425 ||
  status === 429 ||
  status >= 500;

const isInvalidPayload = (data: unknown) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;

  const value = data as Record<string, unknown>;

  if (
    value.error &&
    !value.data &&
    !value.result &&
    !value.anime_detail &&
    !value.streaming
  ) {
    return true;
  }

  return value.status === false && !value.data && !value.result;
};

const getRequestHeaders = () => ({
  Accept: "application/json",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36",
});

async function requestJson(url: string) {
  const response = await fetch(url, {
    headers: getRequestHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  const body = await response.text();

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} from ${url}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("json")) {
    throw new Error(`Invalid API response from ${url}`);
  }

  try {
    const data = JSON.parse(body);
    if (isInvalidPayload(data)) {
      throw new Error(`Invalid API response from ${url}`);
    }
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid API response")) {
      throw error;
    }
    throw new Error(`Invalid JSON response from ${url}`);
  }
};

const shouldRetry = (error: unknown) => {
  const status =
    error instanceof Error
      ? (error as Error & { status?: number }).status
      : undefined;

  if (typeof status === "number") return isRetryableStatus(status);

  const message = error instanceof Error ? error.message : String(error || "");

  return /fetch failed|timed out|timeout|network|invalid api response|invalid json/i.test(
    message
  );
};

const toDefaultOtakudesuPath = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split("/").filter(Boolean);

  if (parts[0] !== "anime" || parts[1] !== "otakudesu") return null;

  const endpoint = parts[2];
  const rest = parts.slice(3);

  switch (endpoint) {
    case "home":
      return "/anime/home";
    case "search":
      return rest[0] ? "/anime/search/" + rest[0] : null;
    case "detail":
      return rest[0] ? "/anime/detail/" + rest[0] : null;
    case "episode":
      return rest[0] ? "/anime/episode/" + rest[0] : null;
    case "genres":
      return "/anime/genres";
    case "genre":
      return rest[0] ? "/anime/genre/" + rest[0] : null;
    case "schedule":
      return "/anime/schedule";
    default:
      return null;
  }
};

const getOtakudesuDetailPath = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split("/").filter(Boolean);

  if (
    parts.length < 4 ||
    parts[0] !== "anime" ||
    parts[1] !== "otakudesu" ||
    parts[2] !== "detail" ||
    !parts[3]
  ) {
    return null;
  }

  return { slug: decodeURIComponent(parts[3]) };
};

const extractAnimeCandidates = (response: any): any[] => {
  const values = [
    response?.data,
    response?.data?.data,
    response?.data?.animeList,
    response?.animeList,
    response?.search_results,
    response?.result,
    response,
  ];

  for (const value of values) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      for (const key of ["animeList", "search_results", "results", "data"]) {
        if (Array.isArray(value[key])) return value[key];
      }
    }
  }

  return [];
};

const getCandidateIdentifier = (item: any) => {
  const value =
    item?.slug ||
    item?.endpoint ||
    item?.anime_slug ||
    item?.animeId ||
    item?.id ||
    item?.href ||
    item?.url;

  if (!value || typeof value !== "string") return "";

  try {
    const parsed = new URL(value, "https://local.invalid");
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return value.split("/").filter(Boolean).pop() || value;
  }
};

const toCommunityPath = (path: string) => {
  const normalized = normalizePath(path);
  const parts = normalized.split("/").filter(Boolean);

  if (parts[0] !== "anime") return null;

  const source =
    parts.length >= 3 && ["otakudesu"].includes(parts[1])
      ? parts[1]
      : null;

  const offset = source ? 2 : 1;
  const endpoint = parts[offset];
  if (!endpoint) return null;

  const rest = parts.slice(offset + 1);

  switch (endpoint) {
    case "home":
      return "/api/v1/anime/home";
    case "ongoing":
      return `/api/v1/anime/ongoing/${rest[0] || "1"}`;
    case "completed":
    case "complete":
      return `/api/v1/anime/complete/${rest[0] || "1"}`;
    case "search":
      return rest[0]
        ? `/api/v1/anime/search/${rest[0]}`
        : "/api/v1/anime/search";
    case "detail":
      return rest[0] ? `/api/v1/anime/detail/${rest[0]}` : null;
    case "episode":
      return rest[0] ? `/api/v1/anime/episode/${rest[0]}` : null;
    case "genres":
      return "/api/v1/anime/genres";
    case "genre":
      return rest[0] ? `/api/v1/anime/genre/${rest[0]}` : null;
    case "schedule":
      return "/api/v1/anime/schedule";
    default:
      return null;
  }
};

async function requestWithRetry(url: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_BASE; attempt += 1) {
    try {
      return await requestJson(url);
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || attempt === MAX_ATTEMPTS_PER_BASE) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Anime API request failed");
}

export async function fetchSankaJson(path: string) {
  let lastError: unknown;

  for (const base of BASE_URLS) {
    try {
      return await requestWithRetry(buildUrl(base, path));
    } catch (error) {
      lastError = error;
    }
  }

  const defaultOtakudesuPath = toDefaultOtakudesuPath(path);

  if (defaultOtakudesuPath) {
    try {
      return await requestWithRetry(buildUrl(PRIMARY_BASE_URL, defaultOtakudesuPath));
    } catch (error) {
      lastError = error;
    }
  }

  const communityPath = toCommunityPath(path);

  if (communityPath) {
    try {
      return await requestWithRetry(buildUrl(COMMUNITY_BASE_URL, communityPath));
    } catch (error) {
      lastError = error;
    }
  }

  const detailPath = getOtakudesuDetailPath(path);

  if (detailPath) {
    try {
      const searchQuery = detailPath.slug.replace(/[-_]+/g, " ");
      const searchData = await requestWithRetry(
        buildUrl(PRIMARY_BASE_URL, "/anime/search/" + encodeURIComponent(searchQuery))
      );
      const candidates = extractAnimeCandidates(searchData);

      for (const candidate of candidates.slice(0, 5)) {
        const identifier = getCandidateIdentifier(candidate);
        if (!identifier) continue;

        try {
          return await requestWithRetry(
            buildUrl(PRIMARY_BASE_URL, "/anime/otakudesu/detail/" + encodeURIComponent(identifier))
          );
        } catch {
          // Try the next current identifier.
        }
      }
    } catch (error) {
      lastError = error;
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : String(lastError || "Anime API request failed");

  const error = new Error(message);
  (error as Error & { code?: string; attemptedBases?: string[] }).code =
    "ANIME_API_UNAVAILABLE";
  (error as Error & { code?: string; attemptedBases?: string[] }).attemptedBases = [
    ...BASE_URLS,
    ...(communityPath ? [COMMUNITY_BASE_URL] : []),
  ];

  throw error;
}

export function getSankaBaseUrl() {
  return PRIMARY_BASE_URL;
}

export async function resolveSankaMirror(content: string) {
  const token = String(content || "").trim();
  if (!/^[A-Za-z0-9+/=]{8,512}$/.test(token)) {
    throw new Error("Invalid mirror token");
  }

  const url = `${COMMUNITY_BASE_URL}/api/v1/anime/mirror?content=${encodeURIComponent(token)}`;
  const response = await requestWithRetry(url);
  const payload = response?.data ?? response;

  if (payload?.url && typeof payload.url === "string") {
    return {
      url: payload.url,
      embeddable: payload.embeddable !== false,
    };
  }

  throw new Error("Mirror URL unavailable");
}
