const DEFAULT_BASE_URL = "https://www.sankavollerei.web.id";

const FALLBACK_BASE_URLS = [
  process.env.SANKA_API_FALLBACK_URL,
  DEFAULT_BASE_URL,
  "https://sankavollerei.web.id",
  "https://www.sankavollerei.com",
]
  .filter(Boolean)
  .map((url) => url!.replace(/\/$/, ""));

const PRIMARY_BASE_URL = (
  process.env.SANKA_API_URL || DEFAULT_BASE_URL
).replace(/\/$/, "");

const REQUEST_TIMEOUT = 15000;
const MAX_ATTEMPTS_PER_BASE = 2;

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

const buildUrl = (base: string, path: string) =>
  `${base.replace(/\/$/, "")}${normalizePath(path)}`;

const isRetryableStatus = (status: number) =>
  status === 408 ||
  status === 425 ||
  status === 429 ||
  status >= 500;

const isInvalidPayload = (data: unknown) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

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
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  let data: unknown;

  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`Invalid JSON response from ${url}`);
  }

  if (isInvalidPayload(data)) {
    throw new Error(`Invalid API response from ${url}`);
  }

  return data;
}

const shouldRetry = (error: unknown) => {
  const status =
    error instanceof Error
      ? (error as Error & { status?: number }).status
      : undefined;

  if (typeof status === "number") {
    return isRetryableStatus(status);
  }

  const message = error instanceof Error ? error.message : String(error || "");

  return /fetch failed|timed out|timeout|network|invalid api response|invalid json/i.test(
    message
  );
};

export async function fetchSankaJson(path: string) {
  const bases = Array.from(new Set([PRIMARY_BASE_URL, ...FALLBACK_BASE_URLS]));
  let lastError: unknown;

  for (const base of bases) {
    const url = buildUrl(base, path);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_BASE; attempt += 1) {
      try {
        return await requestJson(url);
      } catch (error) {
        lastError = error;

        if (!shouldRetry(error) || attempt === MAX_ATTEMPTS_PER_BASE) {
          break;
        }

        await wait(400 * attempt);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Sanka API request failed");
}

export function getSankaBaseUrl() {
  return PRIMARY_BASE_URL;
}
