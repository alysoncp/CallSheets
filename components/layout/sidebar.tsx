"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  FileText,
  Car,
  TrendingUp,
  Calculator,
  PieChart,
  Building2,
  Settings,
  HelpCircle,
  CreditCard,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Income", href: "/income", icon: DollarSign },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Receipts", href: "/receipts", icon: FileText },
  { name: "Paystubs", href: "/paystubs", icon: FileText },
  { name: "Vehicles", href: "/vehicles", icon: Car },
  { name: "Vehicle Mileage", href: "/vehicle-mileage", icon: TrendingUp },
  { name: "Assets", href: "/assets", icon: Building2 },
  { name: "Leases", href: "/leases", icon: CreditCard },
  { name: "Tax Calculator", href: "/tax-calculator", icon: Calculator },
  { name: "Optimization", href: "/optimization", icon: PieChart },
  { name: "GST/HST", href: "/gst-hst", icon: Calculator },
  { name: "Profile", href: "/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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
    </div>
  );
}
