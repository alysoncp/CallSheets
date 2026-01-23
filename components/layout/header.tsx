"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { taxYear, setTaxYear } = useTaxYear();
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
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Financial Management</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <h2 className="text-sm font-bold">CallSheets</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="tax-year" className="text-xs text-muted-foreground">
              Tax Year:
            </Label>
            <Input
              id="tax-year"
              type="number"
              value={taxYear}
              onChange={(e) => setTaxYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="h-7 w-20 text-sm"
              min="2020"
              max="2030"
            />
          </div>
        </div>
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
