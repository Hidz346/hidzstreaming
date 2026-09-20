import { NextResponse } from "next/server";
import { fetchSankaJson, getSankaBaseUrl } from "@/lib/sanka-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = await Promise.allSettled([
    fetchSankaJson("/anime/home"),
    fetchSankaJson("/comic/homepage"),
    fetchSankaJson("/anime/donghua/home/1"),
    fetchSankaJson("/novel/home"),
  ]);

  const names = ["anime", "comic", "donghua", "novel"];
  const services = Object.fromEntries(
    checks.map((result, index) => [
      names[index], result.status === "fulfilled"
        ? { ok: true }
        : { ok: false, error: result.reason instanceof Error ? result.reason.message : "upstream error" },
    ])
  );

  const healthy = Object.values(services).every((service: any) => service.ok);

  return NextResponse.json(
    {
      ok: healthy,
      provider: getSankaBaseUrl(),
      services,
      checkedAt: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}

