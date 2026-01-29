import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { paystubs, income } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PaystubsPageClient } from "@/components/paystubs/paystubs-page-client";

export default async function PaystubsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

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

  return <PaystubsPageClient initialPaystubs={paystubRecords} />;
}
