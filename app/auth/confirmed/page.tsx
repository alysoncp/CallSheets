"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

function AuthConfirmedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Confirmation failed</CardTitle>
            </div>
            <CardDescription>
              We couldn&apos;t confirm your email. The link may have expired or already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {decodeURIComponent(error)}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You can try signing in — if you already confirmed your email, you should be able to log in. Otherwise, please sign up again to receive a new confirmation link.
            </p>
            <Button asChild className="w-full">
              <Link href="/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <CardTitle>Email confirmed</CardTitle>
          </div>
          <CardDescription>
            Your email has been verified. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/signin">Sign In to Continue</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Confirming your email.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-10 rounded-md bg-muted animate-pulse" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <AuthConfirmedContent />
    </Suspense>
  );
}
