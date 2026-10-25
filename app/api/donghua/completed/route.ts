import { NextRequest, NextResponse } from "next/server";
import { getDonghuaCompleted } from "@/lib/donghua-api";

export async function GET(req: NextRequest) {
  const page = new URL(req.url).searchParams.get("page") || "1";

  try {
    const data = await getDonghuaCompleted(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Donghua completed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch completed donghua" },
      { status: 502 }
    );
  }
}
