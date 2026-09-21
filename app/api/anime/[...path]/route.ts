import { NextRequest, NextResponse } from "next/server";
import { fetchSankaJson, resolveSankaMirror } from "@/lib/sanka-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
    if (path[1] === "mirror" && req.nextUrl.searchParams.get("content")) {
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
