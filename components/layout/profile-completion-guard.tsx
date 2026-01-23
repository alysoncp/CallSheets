"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProfileCompletionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");
  const isSetupMode = searchParams.get("setup") === "true";

  useEffect(() => {
    // Allow access to profile page even if incomplete
    if (isProfilePage) {
      return;
    }

    // Check profile completion status
    fetch("/api/user/profile/completion")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isComplete && !isProfilePage) {
          router.push("/profile?setup=true");
        }
      })
      .catch(() => {
        // Silently fail - let the page render
      });
  }, [pathname, isProfilePage, router]);

  return <>{children}</>;
}
