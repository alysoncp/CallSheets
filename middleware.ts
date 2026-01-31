import { NextResponse, type NextRequest } from "next/server";

/**
 * Minimal middleware - passthrough only.
 * Auth is handled in server components (AuthGuard, root page) to avoid
 * Edge runtime __dirname errors from @supabase/ssr dependencies.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
