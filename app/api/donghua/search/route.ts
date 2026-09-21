import { NextRequest, NextResponse } from "next/server";
import { searchDonghua } from "@/lib/donghua-api";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const data = await searchDonghua(q);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Donghua search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donghua search" },
      { status: 502 }
    );
  }
}
