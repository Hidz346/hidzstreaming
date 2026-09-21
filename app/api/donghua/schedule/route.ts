import { NextResponse } from "next/server";
import { getDonghuaSchedule } from "@/lib/donghua-api";

export async function GET() {
  try {
    const data = await getDonghuaSchedule();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Donghua schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch donghua schedule" },
      { status: 502 }
    );
  }
}
