import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs } from "@/lib/db/schema";
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

    // Get paystub to delete file from storage
    const [paystub] = await db
      .select()
      .from(paystubs)
      .where(and(eq(paystubs.id, params.id), eq(paystubs.userId, user.id)))
      .limit(1);

    if (!paystub) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from storage
    const filePath = paystub.imageUrl.split("/paystubs/")[1];
    if (filePath) {
      await supabase.storage.from("paystubs").remove([filePath]);
    }

    // Delete from database
    await db
      .delete(paystubs)
      .where(and(eq(paystubs.id, params.id), eq(paystubs.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/paystubs/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
