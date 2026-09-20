import { NextRequest, NextResponse } from "next/server";
import { fetchSankaJson } from "@/lib/sanka-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const searchParams = req.nextUrl.searchParams.toString();
    const resolvedParams = await params;
    const joinedPath = (resolvedParams.path || []).map(encodeURIComponent).join("/");
    const query = searchParams ? `?${searchParams}` : "";
    const data = await fetchSankaJson(`/anime/${joinedPath}${query}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Anime proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch from anime API" }, { status: 502 });
  }
}
