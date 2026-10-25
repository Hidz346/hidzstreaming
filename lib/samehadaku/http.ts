import axios from "axios";
import https from "https";

export const BASE_URL = (
  process.env.SAMEHADAKU_BASE_URL || "https://v2.samehadaku.how"
).replace(/\/+$/, "");

const REQUEST_TIMEOUT = 8000;
const MAX_ATTEMPTS = 2;
const CACHE_LIMIT = 300;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.104 Mobile Safari/537.36",
];

export class SamehadakuError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "SamehadakuError";
    this.status = status;
  }
}

type RequestOptions = {
  referer?: string;
  form?: Record<string, string>;
  ajax?: boolean;
  timeout?: number;
  attempts?: number;
};

const strictAgent = new https.Agent({ keepAlive: true });
// Beberapa mirror memakai sertifikat kedaluwarsa, jadi dipakai hanya sebagai percobaan ulang.
const lenientAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isCertError = (error: unknown) =>
  /CERT|SELF_SIGNED|UNABLE_TO_VERIFY|ERR_TLS/i.test(
    String((error as { code?: string })?.code ?? "")
  );

const pickUserAgent = () =>
  USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

export const absoluteUrl = (href: string) => {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith("//")) return `https:${href}`;
  return `${BASE_URL}${href.startsWith("/") ? "" : "/"}${href}`;
};

export async function requestText(
  target: string,
  options: RequestOptions = {}
): Promise<string> {
  const url = absoluteUrl(target);
  const maxAttempts = options.attempts ?? MAX_ATTEMPTS;
  let lenient = false;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await axios.request<string>({
        url,
        method: options.form ? "POST" : "GET",
        data: options.form ? new URLSearchParams(options.form).toString() : undefined,
        headers: {
          "User-Agent": pickUserAgent(),
          Accept: options.ajax
            ? "*/*"
            : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          Referer: options.referer || `${BASE_URL}/`,
          ...(options.ajax
            ? { "X-Requested-With": "XMLHttpRequest", Origin: BASE_URL }
            : {}),
          ...(options.form
            ? { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
            : {}),
        },
        timeout: options.timeout ?? REQUEST_TIMEOUT,
        httpsAgent: lenient ? lenientAgent : strictAgent,
        responseType: "text",
        transformResponse: [(body) => body],
        maxRedirects: 5,
        validateStatus: () => true,
      });

      if (response.status === 404 || response.status === 410) {
        throw new SamehadakuError("Halaman tidak ditemukan", 404);
      }

      if (response.status >= 400) {
        throw new SamehadakuError(
          `HTTP ${response.status} dari ${new URL(url).host}`,
          response.status
        );
      }

      return typeof response.data === "string"
        ? response.data
        : String(response.data ?? "");
    } catch (error) {
      if (error instanceof SamehadakuError && error.status === 404) throw error;

      if (!lenient && isCertError(error)) {
        lenient = true;
        attempt -= 1;
        continue;
      }

      lastError = error;
      if (attempt < maxAttempts) await sleep(300 * attempt);
    }
  }

  if (lastError instanceof SamehadakuError) throw lastError;

  throw new SamehadakuError(
    lastError instanceof Error ? lastError.message : "Gagal menghubungi sumber anime"
  );
}

const store = new Map<string, { expires: number; value: unknown }>();
const pending = new Map<string, Promise<unknown>>();

/** Cache sederhana di memori instance, sekaligus menggabungkan request yang sama. */
export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;

  const running = pending.get(key);
  if (running) return running as Promise<T>;

  const task = load()
    .then((value) => {
      if (store.size >= CACHE_LIMIT) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { expires: Date.now() + ttlMs, value });
      return value;
    })
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, task);
  return task;
}
