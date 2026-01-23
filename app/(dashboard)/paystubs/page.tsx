import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { paystubs } from "@/lib/db/schema";
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
    .select()
    .from(paystubs)
    .where(eq(paystubs.userId, user.id))
    .orderBy(desc(paystubs.uploadedAt));

  return <PaystubsPageClient initialPaystubs={paystubRecords} />;
}
