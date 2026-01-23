import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaystubsGrid } from "@/components/paystubs/paystubs-grid";
import { db } from "@/lib/db";
import { paystubs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Paystubs</h1>
      <PaystubsGrid initialData={paystubRecords} />
    </div>
  );
}
