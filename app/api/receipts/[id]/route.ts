import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { receipts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
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

    // Handle params as Promise (Next.js 15+) or object
    const resolvedParams = params instanceof Promise ? await params : params;
    const receiptId = resolvedParams.id;

    // Get receipt to delete file from storage
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, user.id)))
      .limit(1);

    if (!receipt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from storage - extract file path from URL
    // URL format: http://127.0.0.1:54321/storage/v1/object/public/receipts/userId/filename.jpg
    // or: https://project.supabase.co/storage/v1/object/public/receipts/userId/filename.jpg
    let filePath: string | null = null;
    const receiptsIndex = receipt.imageUrl.indexOf("/receipts/");
    if (receiptsIndex !== -1) {
      filePath = receipt.imageUrl.substring(receiptsIndex + "/receipts/".length);
    }

    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("receipts")
        .remove([filePath]);
      
      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    await db
      .delete(receipts)
      .where(and(eq(receipts.id, receiptId), eq(receipts.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/receipts/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
