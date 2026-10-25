import { NextRequest, NextResponse } from "next/server";
import { resolveLocalAnime } from "@/lib/anime-local";
import { fetchSankaJson, resolveSankaMirror } from "@/lib/sanka-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Dua tahap dijalankan berurutan, jadi jumlahnya harus tetap di bawah maxDuration.
const UPSTREAM_DEADLINE = 20000;
const LOCAL_DEADLINE = 20000;

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

const withDeadline = <T,>(task: Promise<T>, ms: number, label: string) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    task.then(resolve, reject).finally(() => clearTimeout(timer));
  });

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const searchParams = req.nextUrl.searchParams.toString();
  const joinedPath = path.map(encodeURIComponent).join("/");
  const query = searchParams ? `?${searchParams}` : "";

  if (!joinedPath) {
    return NextResponse.json(
      { error: "Anime API path is required" },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  const isMirror = path[1] === "mirror" && req.nextUrl.searchParams.get("content");

  // API utama dicoba lebih dulu; scraper bawaan hanya jadi cadangan.
  let upstreamError: unknown;

  try {
    if (isMirror) {
      const mirror = await resolveSankaMirror(req.nextUrl.searchParams.get("content")!);
      return NextResponse.json(mirror, { headers: NO_STORE });
    }

    const data = await withDeadline(
      fetchSankaJson(`/anime/${joinedPath}${query}`),
      UPSTREAM_DEADLINE,
      "Anime API"
    );

    return NextResponse.json(data, { headers: NO_STORE });
  } catch (error) {
    upstreamError = error;
  }

  // Mirror hanya dikenal oleh API utama, jadi tidak ada cadangan untuknya.
  if (!isMirror) {
    console.warn("Anime API failed, using built-in scraper:", {
      path: joinedPath,
      message: messageOf(upstreamError),
    });

    try {
      const local = await withDeadline(
        resolveLocalAnime(path, req.nextUrl.searchParams),
        LOCAL_DEADLINE,
        "Scraper"
      );

      if (local) {
        return NextResponse.json(local.body, {
          headers: {
            "Cache-Control": `public, s-maxage=${local.cacheSeconds}, stale-while-revalidate=${local.cacheSeconds * 2}`,
          },
        });
      }
    } catch (error) {
      console.warn("Built-in scraper failed:", {
        path: joinedPath,
        message: messageOf(error),
      });
    }
  }

  const upstreamStatus =
    upstreamError instanceof Error
      ? (upstreamError as Error & { status?: number }).status
      : undefined;

  console.error("Anime proxy error:", {
    path: joinedPath,
    upstreamStatus,
    message: messageOf(upstreamError),
  });

  return NextResponse.json(
    {
      error: "Anime upstream unavailable",
      code: "ANIME_UPSTREAM_UNAVAILABLE",
      status: upstreamStatus || 502,
      path: joinedPath,
    },
    {
      status: 502,
      headers: NO_STORE,
    }
  );
}
