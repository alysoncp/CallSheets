"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { taxYear } = useTaxYear();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 sm:px-5 md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="lg:hidden h-9 w-9 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="truncate text-base font-semibold sm:text-lg">CrewBooks</h1>
        <span className="lg:hidden shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {taxYear}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <h2 className="hidden text-sm font-bold sm:block">CrewBooks</h2>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
}
