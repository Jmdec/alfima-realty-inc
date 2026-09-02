import { NextRequest, NextResponse } from "next/server";

const LARAVEL_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Force this route to be fully dynamic — never statically optimized,
// never served from Next's Route Handler cache/ISR. Without this, GET
// requests here can be cached by Next even though searchParams change
// between calls, which was causing repeat searches (e.g. "DMCI" after
// "SUNTRUST") to silently return a stale, previously-cached response.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function proxyToLaravel(request: NextRequest, method: string) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => params.append(key, value));

    const token = request.cookies.get("auth_token")?.value;
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let body: BodyInit | undefined;

    if (method !== "GET") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        body = await request.text();
        headers["Content-Type"] = "application/json";
      }
    }

    const url = `${LARAVEL_API}/api/developers-properties${params.toString() ? `?${params}` : ""}`;

    console.log(`[proxy] ${method} → ${url}`);

    // cache: "no-store" — explicitly bypass Next's fetch cache on the
    // OUTBOUND call to Laravel too. This is the actual fix: Next patches
    // global fetch() inside Route Handlers and can cache GET calls by
    // default independently of the route-level `dynamic` export above.
    // Belt-and-suspenders: both the route and this fetch must opt out.
    const response = await fetch(url, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    console.log(`[proxy] response status: ${response.status}`);

    const responseContentType = response.headers.get("content-type") || "";
    if (responseContentType.includes("application/json")) {
      const data = await response.json();
      console.log(`[proxy] response body:`, JSON.stringify(data));
      return NextResponse.json(data, {
        status: response.status,
        headers: {
          // Also tell any intermediate cache (browser, Vercel edge, CDN)
          // not to reuse this response for a different query string.
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const text = await response.text();
    console.log(`[proxy] response text:`, text); // <-- this shows Laravel's raw error
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": responseContentType,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(`[proxy] CAUGHT ERROR:`, error); // <-- this shows if fetch itself failed
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return proxyToLaravel(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyToLaravel(request, "POST");
}
