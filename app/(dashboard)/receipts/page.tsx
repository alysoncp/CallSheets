import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { receipts, expenses } from "@/lib/db/schema";
import { eq, desc, isNotNull, and } from "drizzle-orm";
import { ReceiptsPageClient } from "@/components/receipts/receipts-page-client";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

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
    .innerJoin(expenses, eq(receipts.linkedExpenseId, expenses.id))
    .where(
      and(
        eq(receipts.userId, user.id),
        isNotNull(receipts.linkedExpenseId)
      )
    )
    .orderBy(desc(expenses.date));

  return <ReceiptsPageClient initialReceipts={receiptRecords} />;
}
