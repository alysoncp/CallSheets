import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technical Difficulties | CallSheets",
  description: "CallSheets is temporarily unavailable. Please try again shortly.",
};

export default function OutagePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-xl border bg-card p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Oops, technical difficulties</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            We are having trouble connecting right now. Please try again in a few minutes.
          </p>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          If you were uploading a receipt or paystub, your last action may not have been saved.
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
