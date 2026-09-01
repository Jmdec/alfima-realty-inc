import { NextResponse } from "next/server";
import { getSiteAnalytics } from "@/lib/google-analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSiteAnalytics(7);
    return NextResponse.json(data);
  } catch (err) {
    console.error("GA analytics fetch failed:", err);
    return NextResponse.json(
      {
        totals: null,
        countries: [],
        pages: [],
        referrers: [],
        devices: [],
        browsers: [],
      },
      { status: 200 },
    );
  }
}
