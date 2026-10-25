// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { fetchSankaJson } from "@/lib/sanka-api";

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const resolvedParams = await params;
    const apiPath = resolvedParams.path.join("/");
    const { search } = new URL(request.url);
    const fullPath = `/comic/${apiPath}${search}`;
    
    const data = await fetchSankaJson(fullPath);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Comic API Proxy Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch from Comic API" },
      { status: 502 }
    );
  }
}
