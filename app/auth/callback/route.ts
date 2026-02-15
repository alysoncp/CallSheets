import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next") : "/dashboard";

  const supabase = await createClient();

  if (code) {
    // PKCE flow: Supabase redirects here with a code after email verification
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("Auth callback (code exchange) error:", error.message);
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  if (token_hash && type) {
    // Direct link flow: email link points to app with token_hash and type
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("Auth callback (OTP verify) error:", error.message);
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/signin?error=Missing+auth+parameters", request.url)
  );
}
