"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-xl border bg-card p-6 sm:p-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Oops, technical difficulties</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Something went wrong while loading this page.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try Again
          </button>
          <Link
            href="/outage"
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Outage Page
          </Link>
        </div>
      </div>
    </main>
  );
}
