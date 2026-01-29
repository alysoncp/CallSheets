import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IncomeList } from "@/components/income/income-list";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { PaystubsGrid } from "@/components/paystubs/paystubs-grid";
import { db } from "@/lib/db";
import { income, paystubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { IncomePageClient } from "@/components/income/income-page-client";

export default async function IncomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const incomeRecords = await db
    .select()
    .from(income)
    .where(eq(income.userId, user.id))
    .orderBy(desc(income.date));

  const paystubRecords = await db
    .select({
      id: paystubs.id,
      userId: paystubs.userId,
      imageUrl: paystubs.imageUrl,
      uploadedAt: paystubs.uploadedAt,
      linkedIncomeId: paystubs.linkedIncomeId,
      notes: paystubs.notes,
      ocrStatus: paystubs.ocrStatus,
      ocrJobId: paystubs.ocrJobId,
      ocrResult: paystubs.ocrResult,
      ocrProcessedAt: paystubs.ocrProcessedAt,
      stubDate: income.date,
    })
    .from(paystubs)
    .leftJoin(income, eq(paystubs.linkedIncomeId, income.id))
    .where(eq(paystubs.userId, user.id))
    .orderBy(desc(income.date), desc(paystubs.uploadedAt));

  return (
    <IncomePageClient
      incomeRecords={incomeRecords}
      paystubRecords={paystubRecords}
    />
  );
}
