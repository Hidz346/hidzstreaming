import { NextResponse } from 'next/server';
import { fetchSankaJson } from "@/lib/sanka-api";



export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const urlPath = resolvedParams.path.join('/');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const data = await fetchSankaJson(`/novel/${urlPath}${queryString ? `?${queryString}` : ""}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Novel Proxy Error]`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch from external novel API' },
      { status: 502 }
    );
  }
}

