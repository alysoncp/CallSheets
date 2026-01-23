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
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import type { SubscriptionTier } from "@/lib/utils/subscription";

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
  { name: "Help", href: "/help", icon: HelpCircle },
  { name: "About", href: "/about", icon: Info },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    subscriptionTier?: SubscriptionTier;
    hasGstNumber?: boolean;
  } | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true);

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

  useEffect(() => {
    fetchUserProfile();
    checkProfileCompletion();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      setTimeout(() => {
        fetchUserProfile();
        checkProfileCompletion();
      }, 300);
    };
    
    // Custom event
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
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
              onClick={() => {
                // #region agent log
                if (item.href === '/help') {
                  fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/layout/sidebar.tsx:151',message:'Help link clicked',data:{href:item.href,pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                }
                // #endregion
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      {userName && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
