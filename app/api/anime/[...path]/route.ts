import { NextRequest, NextResponse } from "next/server";
import { fetchSankaJson } from "@/lib/sanka-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const searchParams = req.nextUrl.searchParams.toString();
  const joinedPath = path.map(encodeURIComponent).join("/");
  const query = searchParams ? `?${searchParams}` : "";

  try {
    const data = await fetchSankaJson(`/anime/${joinedPath}${query}`);
    return NextResponse.json(data);
  } catch (error) {
    const status =
      error instanceof Error
        ? (error as Error & { status?: number }).status
        : undefined;

    console.error("Anime proxy error:", {
      path: joinedPath,
      status,
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to fetch from anime API",
        status: status || 502,
      },
      { status: 502 }
    );
  }
}
