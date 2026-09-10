// app/api/services/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || `HTTP ${res.status}` };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    if (searchParams.get("all")) params.set("all", "1");

    const url = `${API_URL}/api/services?${params}`;
    console.log("[services] API_URL env:", API_URL);
    console.log("[services] calling:", url);

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    console.log("[services] upstream status:", res.status);
    const data = await safeJson(res);
    console.log(
      "[services] upstream body (first 300 chars):",
      JSON.stringify(data).slice(0, 300),
    );

    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[services] fetch threw:", e);
    return NextResponse.json(
      { error: "Failed to fetch services." },
      { status: 500 },
    );
  }
}
