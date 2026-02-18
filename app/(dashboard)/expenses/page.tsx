import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
    .select({
      id: receipts.id,
      userId: receipts.userId,
      imageUrl: receipts.imageUrl,
      uploadedAt: receipts.uploadedAt,
      linkedExpenseId: receipts.linkedExpenseId,
      linkedIncomeId: receipts.linkedIncomeId,
      notes: receipts.notes,
      ocrJobId: receipts.ocrJobId,
      ocrStatus: receipts.ocrStatus,
      ocrResult: receipts.ocrResult,
      ocrProcessedAt: receipts.ocrProcessedAt,
      expenseDate: expenses.date,
    })
    .from(receipts)
    .leftJoin(expenses, eq(receipts.linkedExpenseId, expenses.id))
    .where(eq(receipts.userId, user.id))
    .orderBy(desc(expenses.date), desc(receipts.uploadedAt));

  return (
    <ExpensesPageClient
      expenseRecords={expenseRecords}
      receiptRecords={receiptRecords}
    />
  );
}
