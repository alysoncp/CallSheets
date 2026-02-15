import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Handles email confirmation when Supabase email template points to /auth/confirm
 * (e.g. {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }})
 * Redirects to main callback for consistency.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/dashboard";

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL("/signin?error=Missing+confirmation+token", request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (!error) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  console.error("Auth confirm (OTP verify) error:", error.message);
  return NextResponse.redirect(
    new URL(`/signin?error=${encodeURIComponent(error.message)}`, request.url)
  );
}
