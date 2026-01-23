import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ReceiptsPageClient } from "@/components/receipts/receipts-page-client";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const receiptRecords = await db
    .select()
    .from(receipts)
    .where(eq(receipts.userId, user.id))
    .orderBy(desc(receipts.uploadedAt));

  return <ReceiptsPageClient initialReceipts={receiptRecords} />;
}
