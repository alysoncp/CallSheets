import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isProfileComplete } from "@/lib/utils/profile-completion";

async function getRedirectPath(userId: string, requestedNext: string) {
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!isProfileComplete(profile) && !requestedNext.startsWith("/profile")) {
    return "/profile?setup=true";
  }

  return requestedNext;
}

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
  const next: string = nextParam?.startsWith("/") ? nextParam ?? "/dashboard" : "/dashboard";

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const redirectPath = user ? await getRedirectPath(user.id, next) : next;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  console.error("Auth confirm (OTP verify) error:", error.message);
  return NextResponse.redirect(
    new URL(`/signin?error=${encodeURIComponent(error.message)}`, request.url)
  );
}
