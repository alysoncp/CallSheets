import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get receipt to delete file from storage
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, params.id), eq(receipts.userId, user.id)))
      .limit(1);

    if (!receipt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from storage
    const filePath = receipt.imageUrl.split("/receipts/")[1];
    if (filePath) {
      await supabase.storage.from("receipts").remove([filePath]);
    }

    // Delete from database
    await db
      .delete(receipts)
      .where(and(eq(receipts.id, params.id), eq(receipts.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/receipts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
