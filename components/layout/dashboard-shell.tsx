"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <OnboardingTour />
      <Sidebar
        isMobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <div className="lg:hidden">
          <Header onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-0 sm:px-5 sm:pb-5 sm:pt-0 md:px-6 md:pb-6 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
