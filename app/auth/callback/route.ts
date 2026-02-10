import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles redirect from Supabase after email confirmation (and other OAuth/code flows).
 * Exchanges the auth code for a session and redirects to /auth/confirmed.
 * Using this as emailRedirectTo lets confirmation links work on any origin (e.g. Vercel preview URLs).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/confirmed";

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/confirmed?error=Missing+auth+code", request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const message = encodeURIComponent(error.message);
    return NextResponse.redirect(
      new URL(`/auth/confirmed?error=${message}`, request.url)
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
