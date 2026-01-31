import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Create a response we can attach cookies to
  let response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // IMPORTANT: do NOT mutate request.cookies in middleware
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    const isPublic =
      path === "/" ||
      path.startsWith("/signin") ||
      path.startsWith("/signup") ||
      path.startsWith("/pricing");

    if (!user && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";

      // Preserve any cookies set during getUser()
      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, c);
      });
      return redirectResponse;
    }

    if (user && path === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";

      const redirectResponse = NextResponse.redirect(url);
      response.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, c);
      });
      return redirectResponse;
    }

    return response;
  } catch (e) {
      console.error("MIDDLEWARE ERROR", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
