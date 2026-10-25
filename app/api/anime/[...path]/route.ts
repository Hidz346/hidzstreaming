import { NextRequest, NextResponse } from "next/server";
import { resolveLocalAnime } from "@/lib/anime-local";
import { fetchSankaJson, resolveSankaMirror } from "@/lib/sanka-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOCAL_DEADLINE = 20000;

const withDeadline = <T,>(task: Promise<T>, ms: number) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Scraper timed out")), ms);
    task.then(resolve, reject).finally(() => clearTimeout(timer));
  });

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

  // Scraper bawaan dicoba lebih dulu; API lama hanya jadi cadangan.
  if (!isMirror) {
    try {
      const local = await withDeadline(
        resolveLocalAnime(path, req.nextUrl.searchParams),
        LOCAL_DEADLINE
      );

      if (local) {
        return NextResponse.json(local.body, {
          headers: {
            "Cache-Control": `public, s-maxage=${local.cacheSeconds}, stale-while-revalidate=${local.cacheSeconds * 2}`,
          },
        });
      }
    } catch (error) {
      console.warn("Anime scraper failed, using fallback API:", {
        path: joinedPath,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    if (isMirror) {
      const mirror = await resolveSankaMirror(req.nextUrl.searchParams.get("content")!);
      return NextResponse.json(mirror, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const data = await fetchSankaJson(`/anime/${joinedPath}${query}`);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const upstreamStatus =
      error instanceof Error
        ? (error as Error & { status?: number }).status
        : undefined;

    console.error("Anime proxy error:", {
      path: joinedPath,
      upstreamStatus,
      message: error instanceof Error ? error.message : String(error),
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
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
