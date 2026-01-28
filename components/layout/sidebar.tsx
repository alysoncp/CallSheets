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
  CreditCard,
  User,
  HelpCircle,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { SubscriptionTier } from "@/lib/utils/subscription";
import { useTaxYear } from "@/lib/contexts/tax-year-context";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Income", href: "/income", icon: DollarSign },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Vehicles", href: "/vehicles", icon: Car },
  { name: "Vehicle Mileage", href: "/vehicle-mileage", icon: TrendingUp },
  { name: "GST/HST", href: "/gst-hst", icon: Calculator, requiresGst: true },
  { name: "Tax Calculator", href: "/tax-calculator", icon: Calculator },
  { name: "Assets", href: "/assets", icon: Building2, requiresPersonalOrCorporate: true },
  { name: "Leases", href: "/leases", icon: CreditCard, requiresPersonalOrCorporate: true },
  { name: "Optimization", href: "/optimization", icon: PieChart, requiresCorporate: true },
  { name: "Profile", href: "/profile", icon: Settings },
  { name: "Settings", href: "/settings", icon: SlidersHorizontal },
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "About", href: "/about", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const { taxYear, setTaxYear } = useTaxYear();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    subscriptionTier?: SubscriptionTier;
    hasGstNumber?: boolean;
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
          setUserProfile({
            subscriptionTier: data.subscriptionTier || "basic",
            hasGstNumber: data.hasGstNumber === true,
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
      const [incomeResponse, expenseResponse] = await Promise.all([
        fetch("/api/income", { cache: "no-store" }),
        fetch("/api/expenses", { cache: "no-store" }),
      ]);

      const incomeData = incomeResponse.ok ? await incomeResponse.json() : [];
      const expenseData = expenseResponse.ok ? await expenseResponse.json() : [];

      const years = new Set<number>();
      const currentYear = new Date().getFullYear();
      years.add(currentYear); // Always include current year

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

      const sortedYears = Array.from(years).sort((a, b) => b - a); // Sort descending
      setAvailableYears(sortedYears);
    } catch (error) {
      // If fetch fails, just show current year
      setAvailableYears([new Date().getFullYear()]);
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
      // Show Optimization only if user has corporate subscription
      if (item.requiresCorporate) {
        return userProfile?.subscriptionTier === "corporate";
      }
      // Show Assets and Leases only if user has personal or corporate subscription
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

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="font-bold text-xl">
          CallSheets
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
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
      </nav>
      <div className="border-t p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax-year" className="text-xs text-muted-foreground">
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
            className="h-9 w-full text-sm"
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
        {userName && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
