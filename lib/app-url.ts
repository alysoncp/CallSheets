/**
 * Returns the canonical app base URL for the current environment.
 * Use this for auth redirects (e.g. emailRedirectTo) so the same stable URL
 * is used per environment instead of request origin (which can vary on previews).
 *
 * Strategy:
 * - Production (Vercel): NEXT_PUBLIC_APP_URL (set to your real prod domain)
 * - Preview: VERCEL_BRANCH_URL (stable per branch) or VERCEL_URL; no protocol in vars, so we add https://
 * - Local: NEXT_PUBLIC_APP_URL or http://localhost:3000
 *
 * Server-only (uses process.env). For use in Server Components and route handlers.
 */
export function getAppBaseUrl(): string {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL;
  const vercelUrl = process.env.VERCEL_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Production: use explicit prod domain
  if (vercelEnv === "production" && appUrl) {
    return appUrl.replace(/\/$/, "");
  }

  // Preview: stable per-branch URL, then fallback to deployment URL (no protocol in Vercel vars)
  if (vercelEnv === "preview") {
    const host = vercelBranchUrl || vercelUrl;
    if (host) {
      return `https://${host}`;
    }
  }

  // Local / dev or unset: NEXT_PUBLIC_APP_URL or localhost
  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
