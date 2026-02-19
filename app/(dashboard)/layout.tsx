import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { ProfileCompletionGuard } from "@/components/layout/profile-completion-guard";
import { TaxYearProvider } from "@/lib/contexts/tax-year-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TaxYearProvider>
        <Suspense fallback={null}>
          <ProfileCompletionGuard>
            <DashboardShell>{children}</DashboardShell>
          </ProfileCompletionGuard>
        </Suspense>
      </TaxYearProvider>
    </AuthGuard>
  );
}
