import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IncomeList } from "@/components/income/income-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getIncomeData(userId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/income`, {
    cache: "no-store",
    headers: {
      Cookie: `sb-access-token=${userId}`, // This is a simplified approach
    },
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function IncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // For now, we'll fetch directly from the database
  // In a real app, you'd use the API route with proper auth
  const { db } = await import("@/lib/db");
  const { income } = await import("@/lib/db/schema");
  const { eq, desc } = await import("drizzle-orm");

  const incomeRecords = await db
    .select()
    .from(income)
    .where(eq(income.userId, user.id))
    .orderBy(desc(income.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Income</h1>
        <Button asChild>
          <Link href="/income/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Link>
        </Button>
      </div>
      <IncomeList initialData={incomeRecords} />
    </div>
  );
}
