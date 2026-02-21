"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function ProfileCompletionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");

  useEffect(() => {
    // Allow access to profile page even if incomplete
    if (isProfilePage) {
      setIsAllowed(true);
      setIsChecking(false);
      return;
    }

    // Check profile completion status
    fetch("/api/user/profile/completion")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isComplete && !isProfilePage) {
          setIsAllowed(false);
          router.replace("/profile?setup=true");
          return;
        }
        setIsAllowed(true);
      })
      .catch(() => {
        // If completion check fails, do not block app usage.
        setIsAllowed(true);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, [pathname, isProfilePage, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Checking account setup...</p>
      </div>
    );
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
