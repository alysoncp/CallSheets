"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Car,
  TrendingUp,
  Calculator,
  PieChart,
  Building2,
  Settings,
  User,
  HelpCircle,
  Info,
  SlidersHorizontal,
  X,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { SubscriptionTier } from "@/lib/utils/subscription";
import { useTaxYear } from "@/lib/contexts/tax-year-context";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";

const ASSETS_FEATURE_DISABLED_FLAG = "__feature_assets_disabled__";

const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Income", href: "/income", icon: DollarSign },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Vehicles", href: "/vehicles", icon: Car },
  { name: "Vehicle Mileage", href: "/vehicle-mileage", icon: TrendingUp },
  { name: "GST/HST", href: "/gst-hst", icon: Calculator, requiresGst: true },
  { name: "Tax Calculator", href: "/tax-calculator", icon: Calculator },
  { name: "Assets", href: "/assets", icon: Building2, requiresPersonalOrCorporate: true },
  { name: "Optimization", href: "/optimization", icon: PieChart, requiresCorporate: true },
  { name: "Profile", href: "/profile", icon: Settings },
  { name: "Settings", href: "/settings", icon: SlidersHorizontal },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "About", href: "/about", icon: Info },
];

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export function Sidebar({ isMobileMenuOpen = false, onCloseMobileMenu }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [themeMounted, setThemeMounted] = useState(false);

  const handleLinkClick = () => {
    onCloseMobileMenu?.();
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  useEffect(() => {
    setThemeMounted(true);
  }, []);
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);
  const { taxYear, setTaxYear } = useTaxYear();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    subscriptionTier?: SubscriptionTier;
    hasGstNumber?: boolean;
    trackVehicleExpenses?: boolean;
    trackAssets?: boolean;
  } | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchUserProfile = () => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          const name = data.firstName || data.lastName 
            ? `${data.firstName || ""} ${data.lastName || ""}`.trim()
            : null;
          const newUserName = name || data.email?.split("@")[0] || null;
          setUserName(newUserName);
          setUserEmail(data.email || null);
          const enabledCategories = Array.isArray(data.enabledExpenseCategories)
            ? (data.enabledExpenseCategories as string[])
            : [];
          const trackVehicleExpenses = enabledCategories.length === 0
            ? true
            : EXPENSE_CATEGORIES.VEHICLE.some((cat) => enabledCategories.includes(cat));
          const trackAssets = !enabledCategories.includes(ASSETS_FEATURE_DISABLED_FLAG);
          setUserProfile({
            subscriptionTier: data.subscriptionTier || "basic",
            hasGstNumber: data.hasGstNumber === true,
            trackVehicleExpenses,
            trackAssets,
          });
        }
      })
      .catch(() => {
        // Silently fail - user info is optional
      });
  };

  const checkProfileCompletion = () => {
    fetch("/api/user/profile/completion")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setIsProfileComplete(data.isComplete);
        }
      })
      .catch(() => {
        // Silently fail
      });
  };

  const fetchAvailableYears = async () => {
    try {
      const [incomeResponse, expenseResponse, receiptsResponse, paystubsResponse] = await Promise.all([
        fetch("/api/income", { cache: "no-store" }),
        fetch("/api/expenses", { cache: "no-store" }),
        fetch("/api/receipts", { cache: "no-store" }),
        fetch("/api/paystubs", { cache: "no-store" }),
      ]);

      const incomeData = incomeResponse.ok ? await incomeResponse.json() : [];
      const expenseData = expenseResponse.ok ? await expenseResponse.json() : [];
      const receiptsData = receiptsResponse.ok ? await receiptsResponse.json() : [];
      const paystubsData = paystubsResponse.ok ? await paystubsResponse.json() : [];

      const years = new Set<number>();
      const currentYear = new Date().getFullYear();
      years.add(currentYear);
      years.add(currentYear - 1); // Always include previous year

      // Extract years from income records
      incomeData.forEach((record: any) => {
        try {
          const recordDate = new Date(record.date);
          const year = recordDate.getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        } catch {
          // Skip invalid dates
        }
      });

      // Extract years from expense records
      expenseData.forEach((record: any) => {
        try {
          const recordDate = typeof record.date === 'string' 
            ? new Date(record.date) 
            : new Date(record.date);
          const year = recordDate.getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        } catch {
          // Skip invalid dates
        }
      });

      // Extract years from receipts (expenseDate or uploadedAt)
      receiptsData.forEach((record: any) => {
        try {
          const dateRaw = record.expenseDate ?? record.uploadedAt;
          if (!dateRaw) return;
          const recordDate = typeof dateRaw === 'string' ? new Date(dateRaw) : new Date(dateRaw);
          const year = recordDate.getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        } catch {
          // Skip invalid dates
        }
      });

      // Extract years from paystubs (stubDate or uploadedAt)
      paystubsData.forEach((record: any) => {
        try {
          const dateRaw = record.stubDate ?? record.uploadedAt;
          if (!dateRaw) return;
          const recordDate = typeof dateRaw === 'string' ? new Date(dateRaw) : new Date(dateRaw);
          const year = recordDate.getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        } catch {
          // Skip invalid dates
        }
      });

      const sortedYears = Array.from(years).sort((a, b) => b - a); // Sort descending
      setAvailableYears(sortedYears);
    } catch (error) {
      // If fetch fails, show at least current and previous year
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear, currentYear - 1]);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    checkProfileCompletion();
    fetchAvailableYears();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      setTimeout(() => {
        fetchUserProfile();
        checkProfileCompletion();
      }, 300);
    };
    
    // Listen for data updates (income/expense added/deleted)
    const handleDataUpdate = () => {
      fetchAvailableYears();
    };
    
    // Custom events
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('incomeUpdated', handleDataUpdate);
    window.addEventListener('expenseUpdated', handleDataUpdate);
    
    // Polling fallback (check every second if profile was updated)
    const pollInterval = setInterval(() => {
      const lastUpdate = localStorage.getItem('profileLastUpdate');
      if (lastUpdate) {
        const updateTime = parseInt(lastUpdate, 10);
        const now = Date.now();
        if (now - updateTime < 2000) {
          handleProfileUpdate();
          localStorage.removeItem('profileLastUpdate');
        }
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('incomeUpdated', handleDataUpdate);
      window.removeEventListener('expenseUpdated', handleDataUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  // Filter navigation based on user profile
  const navigation = useMemo(() => {
    return allNavigation.filter((item) => {
      if (item.href === "/assets" && userProfile?.trackAssets === false) {
        return false;
      }
      if (
        (item.href === "/vehicles" || item.href === "/vehicle-mileage") &&
        userProfile?.trackVehicleExpenses === false
      ) {
        return false;
      }
      // Show Optimization only if user has corporate subscription
      if (item.requiresCorporate) {
        return userProfile?.subscriptionTier === "corporate";
      }
      // Show Assets only if user has personal or corporate subscription
      if (item.requiresPersonalOrCorporate) {
        return userProfile?.subscriptionTier === "personal" || userProfile?.subscriptionTier === "corporate";
      }
      // Show GST/HST only if user has GST number
      if (item.requiresGst) {
        return userProfile?.hasGstNumber === true;
      }
      // Show all other items
      return true;
    });
  }, [userProfile]);

  // Hide entire sidebar if profile is incomplete
  if (!isProfileComplete) {
    return null;
  }

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
          >
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              CallSheets
            </span>
          </Link>
          {themeMounted && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 shrink-0 lg:flex"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <button
          type="button"
          onClick={onCloseMobileMenu}
          className="lg:hidden rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="border-b bg-primary/5 px-4 py-3">
        <div className="space-y-2">
          <Label htmlFor="tax-year" className="text-sm font-semibold text-foreground">
            Tax Year
          </Label>
          <Select
            id="tax-year"
            value={taxYear.toString()}
            onChange={(e) => {
              const newYear = parseInt(e.target.value, 10);
              if (!isNaN(newYear) && newYear !== taxYear) {
                setTaxYear(newYear);
              }
            }}
            className="h-10 w-full text-base font-semibold bg-background border-2 border-primary/30 focus-visible:border-primary"
          >
            {availableYears.length > 0 ? (
              availableYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))
            ) : (
              <option value={new Date().getFullYear().toString()}>
                {new Date().getFullYear()}
              </option>
            )}
          </Select>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t p-4 space-y-4">
        {userName && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2">
            <User className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 shrink-0 lg:flex"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onCloseMobileMenu?.()}
          onKeyDown={(e) => e.key === "Escape" && onCloseMobileMenu?.()}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
        />
      )}
      {/* Sidebar: hidden overlay on mobile (hamburger only), visible on desktop - never affects signin (different layout) */}
      <aside
        className={cn(
          "flex h-full w-64 flex-col border-r bg-background transition-transform duration-200 ease-in-out",
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto lg:shrink-0 lg:pointer-events-auto",
          isMobileMenuOpen
            ? "translate-x-0 shadow-xl pointer-events-auto"
            : "-translate-x-full pointer-events-none lg:translate-x-0 lg:shadow-none"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
