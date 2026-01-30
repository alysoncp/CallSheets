import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { receipts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user's subscription tier and OCR limits
    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check OCR limits based on subscription tier
    const ocrLimits: Record<string, number> = {
      basic: 10,
      personal: 100,
      corporate: Infinity,
    };

    const limit = ocrLimits[userProfile.subscriptionTier || "basic"];
    if (userProfile.ocrRequestsThisMonth && userProfile.ocrRequestsThisMonth >= limit) {
      return NextResponse.json(
        { error: "OCR request limit reached for this month" },
        { status: 429 }
      );
    }

    // Get receipt
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, id), eq(receipts.userId, user.id)))
      .limit(1);

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // Update receipt status to processing
    await db
      .update(receipts)
      .set({ ocrStatus: "processing" })
      .where(eq(receipts.id, id));

    // TODO: Call Veryfi API here
    // const veryfiClient = new VeryfiClient();
    // const ocrResult = await veryfiClient.processReceipt(receipt.imageUrl);

    // For now, return a placeholder
    const ocrResult = {
      vendor: { name: "Example Vendor" },
      total: 0,
      tax: 0,
      date: new Date().toISOString(),
      line_items: [],
    };

    // Update receipt with OCR result
    await db
      .update(receipts)
      .set({
        ocrStatus: "completed",
        ocrResult: ocrResult as any,
        ocrProcessedAt: new Date(),
      })
      .where(eq(receipts.id, id));

    // Increment OCR request count
    await db
      .update(users)
      .set({
        ocrRequestsThisMonth: (userProfile.ocrRequestsThisMonth || 0) + 1,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, result: ocrResult });
  } catch (error) {
    console.error("Error in POST /api/receipts/[id]/ocr:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
