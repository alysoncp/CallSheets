"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DISCLAIMER_VERSION } from "@/lib/constants";

type User = {
  id: string;
  disclaimerAcceptedAt: string | null;
  disclaimerVersion: string | null;
  [key: string]: unknown;
};

export function DisclaimerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => {
        // Unauthenticated: redirect to sign-in; do not show disclaimer
        if (res.status === 401) {
          router.replace("/signin");
          return null;
        }
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data: User | null) => {
        if (data == null) return;
        setUser(data);
        const accepted = data.disclaimerAcceptedAt != null;
        const versionMatch = data.disclaimerVersion === DISCLAIMER_VERSION;
        setNeedsAcceptance(!accepted || !versionMatch);
      })
      .catch(() => {
        // On API failure, redirect to sign-in rather than showing the
        // disclaimer again (which causes the double-disclaimer bug).
        router.replace("/signin");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleAccept = async () => {
    if (!agreed) {
      setError("You must agree to the disclaimer to continue.");
      return;
    }
    setError(null);
    setAccepting(true);
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptDisclaimer: true }),
      });
      if (!res.ok) throw new Error("Failed to accept");
      setNeedsAcceptance(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!needsAcceptance) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Disclaimer required</CardTitle>
          <CardDescription>
            Please read and accept the following to continue using CallSheets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/disclaimer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Read Full Disclaimer
            </Link>
          </p>
          <div className="flex items-start gap-3">
            <Checkbox
              id="disclaimer-accept"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            <Label
              htmlFor="disclaimer-accept"
              className="text-sm font-normal cursor-pointer leading-snug text-muted-foreground"
            >
              I acknowledge that this app provides record-keeping and organizational tools only, does not provide tax, accounting, legal, or financial advice, and that I am responsible for verifying all information and consulting a qualified Canadian tax or accounting professional before filing taxes or making financial decisions.
            </Label>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full"
          >
            {accepting ? "Accepting..." : "I Accept"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
