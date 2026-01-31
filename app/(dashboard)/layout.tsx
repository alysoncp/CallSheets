import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
            <div className="flex h-screen">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6">
                  {children}
                </main>
              </div>
            </div>
          </ProfileCompletionGuard>
        </Suspense>
      </TaxYearProvider>
    </AuthGuard>
  );
}
