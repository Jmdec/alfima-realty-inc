import { NextRequest, NextResponse } from "next/server";

// This route hands the httpOnly `auth_token` cookie's value to client-side
// code that needs to send it as a raw Bearer token (e.g. direct-to-Laravel
// fetches that bypass the Next.js proxy). document.cookie can NEVER read
// auth_token directly because it's httpOnly by design — this server route
// is the only legitimate way client JS gets it.
//
// Force fully dynamic + no caching: this returns a secret, so it must never
// be cached by the browser, a CDN, or Next's route cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { token: null },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }

  return NextResponse.json(
    { token },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
