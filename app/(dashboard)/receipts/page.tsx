import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReceiptsGrid } from "@/components/receipts/receipts-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <Button asChild>
          <label htmlFor="receipt-upload" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Upload Receipt
          </label>
        </Button>
        <input
          id="receipt-upload"
          type="file"
          accept="image/*"
          className="hidden"
        />
      </div>
      <ReceiptsGrid initialData={receiptRecords} />
    </div>
  );
}
