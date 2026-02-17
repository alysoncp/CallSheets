"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <Sidebar
        isMobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
