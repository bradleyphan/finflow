import { NextRequest, NextResponse } from "next/server";
import { getRedis, householdKey } from "@/lib/server/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidCode(code: string | null): code is string {
  return !!code && /^[a-zA-Z0-9-]{4,40}$/.test(code);
}

// GET /api/household?code=xxx  → { data: DashboardData | null }
export async function GET(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  try {
    const data = await redis.get(householdKey(code));
    return NextResponse.json({ data: data ?? null });
  } catch {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
}

// PUT /api/household  body: { code, data }  → { ok: true }
export async function PUT(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  let body: { code?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const code = body.code ?? null;
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  if (body.data == null || typeof body.data !== "object") {
    return NextResponse.json({ error: "invalid_data" }, { status: 400 });
  }

  // Guard against oversized payloads
  const serialized = JSON.stringify(body.data);
  if (serialized.length > 200_000) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  try {
    await redis.set(householdKey(code), body.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "write_failed" }, { status: 500 });
  }
}
