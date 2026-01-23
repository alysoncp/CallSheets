import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { ReceiptsGrid } from "@/components/receipts/receipts-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { expenses, receipts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ExpensesPageClient } from "@/components/expenses/expenses-page-client";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const expenseRecords = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, user.id))
    .orderBy(desc(expenses.date));

  const receiptRecords = await db
    .select()
    .from(receipts)
    .where(eq(receipts.userId, user.id))
    .orderBy(desc(receipts.uploadedAt));

  return (
    <ExpensesPageClient
      expenseRecords={expenseRecords}
      receiptRecords={receiptRecords}
    />
  );
}
