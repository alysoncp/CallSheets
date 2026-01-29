import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs, income } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleteEntry = request.nextUrl.searchParams.get("deleteEntry") === "true";
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
      .where(and(eq(paystubs.id, id), eq(paystubs.userId, user.id)))
      .limit(1);

    if (!paystub) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If deleteEntry=true, delete the linked income first
    if (deleteEntry && paystub.linkedIncomeId) {
      await db
        .delete(income)
        .where(
          and(
            eq(income.id, paystub.linkedIncomeId),
            eq(income.userId, user.id)
          )
        );
    }

    // Delete from storage
    // Extract file path from URL: http://127.0.0.1:54321/storage/v1/object/public/paystubs/{user_id}/{filename}
    // We need just {user_id}/{filename}
    const urlParts = paystub.imageUrl.split("/paystubs/");
    const filePath = urlParts.length > 1 ? urlParts[1] : null;
    if (filePath) {
      console.log("Deleting paystub file from storage:", filePath);
      const { error: storageError } = await supabase.storage.from("paystubs").remove([filePath]);
      if (storageError) {
        console.error("Error deleting from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
    } else {
      console.warn("Could not extract file path from imageUrl:", paystub.imageUrl);
    }

    // Delete from database
    await db
      .delete(paystubs)
      .where(and(eq(paystubs.id, id), eq(paystubs.userId, user.id)));

    console.log("Paystub deleted successfully:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/paystubs/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
