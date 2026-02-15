"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") || "/dashboard";

    const supabase = createClient();

    async function handleAuth() {
      if (code) {
        // PKCE flow: exchange the auth code for a session (must run
        // client-side so the browser client can read its own code_verifier cookie)
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(next);
          return;
        }
        console.error("Code exchange error:", error.message);
        setError(error.message);
        router.replace(`/signin?error=${encodeURIComponent(error.message)}`);
        return;
      }

      if (token_hash && type) {
        // Direct token verification (e.g. custom email template with token_hash)
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });
        if (!error) {
          router.replace(next);
          return;
        }
        console.error("OTP verify error:", error.message);
        setError(error.message);
        router.replace(`/signin?error=${encodeURIComponent(error.message)}`);
        return;
      }

      // No valid auth parameters
      router.replace("/signin?error=Missing+auth+parameters");
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">
        {error ? `Authentication error: ${error}` : "Confirming your email..."}
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
