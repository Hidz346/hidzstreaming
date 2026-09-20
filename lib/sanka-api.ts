const PRIMARY_BASE_URL = process.env.SANKA_API_URL || 'https://www.sankavollerei.web.id';
const LEGACY_BASE_URL = 'https://www.sankavollerei.com';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const buildUrl = (base: string, path: string) => `${base.replace(/\/$/, '')}${normalizePath(path)}`;

const shouldTryLegacy = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '');
  return /HTTP (408|425|429|500|502|503|504)|fetch failed|timed out|network/i.test(message);
};

async function requestJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'HidzStreaming/1.0',
    },
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.json();
}

export async function fetchSankaJson(path: string) {
  const primaryUrl = buildUrl(PRIMARY_BASE_URL, path);

  try {
    return await requestJson(primaryUrl);
  } catch (primaryError) {
    if (PRIMARY_BASE_URL === LEGACY_BASE_URL || !shouldTryLegacy(primaryError)) {
      throw primaryError;
    }

    return requestJson(buildUrl(LEGACY_BASE_URL, path));
  }
}

export function getSankaBaseUrl() {
  return PRIMARY_BASE_URL.replace(/\/$/, '');
}
