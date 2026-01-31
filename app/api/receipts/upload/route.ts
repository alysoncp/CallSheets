import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { receipts, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VeryfiClient, type VeryfiReceiptResult } from "@/lib/veryfi/client";
import { parseReceiptOcr } from "@/lib/utils/receipt-ocr-parser";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const bucketName = "receipts";
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    let { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    // If bucket doesn't exist, try to create it and retry upload
    if (uploadError && (uploadError.message === "Bucket not found" || uploadError.message === "Not Found" || uploadError.message?.includes("row-level security"))) {
      // Use admin client for bucket creation (requires service role key)
      const adminClient = createAdminClient();
      const { data: bucketData, error: bucketError } = await adminClient.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/*"],
        fileSizeLimit: 52428800, // 50MB
      });

      if (!bucketError) {
        // Retry upload after bucket creation
        const retryResult = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });
        uploadData = retryResult.data;
        uploadError = retryResult.error;
      }
    }

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    // Create receipt record
    const [newReceipt] = await db
      .insert(receipts)
      .values({
        userId: user.id,
        imageUrl: publicUrl,
        notes: notes || null,
        ocrStatus: "pending",
      })
      .returning();

    // Try to process OCR automatically (non-blocking)
    let ocrResult = null;
    try {
      // Check user's subscription tier and OCR limits
      const [userProfile] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (userProfile) {
        const ocrLimits: Record<string, number> = {
          basic: 10,
          personal: 100,
          corporate: Infinity,
        };

        const limit = ocrLimits[userProfile.subscriptionTier || "basic"];
        const canProcessOCR = !userProfile.ocrRequestsThisMonth || userProfile.ocrRequestsThisMonth < limit;

        if (canProcessOCR) {
          // Update receipt status to processing
          await db
            .update(receipts)
            .set({ ocrStatus: "processing" })
            .where(eq(receipts.id, newReceipt.id));

          // Helper function to transform Veryfi result to expense form format
          const transformVeryfiToExpense = (veryfiResult: VeryfiReceiptResult, ocrText?: string, rawVeryfiData?: any) => {
            // Log the raw Veryfi response
            console.log("Veryfi OCR raw response:", JSON.stringify(veryfiResult, null, 2));
            console.log("OCR text available:", !!ocrText);
            
            // Use OCR parser to extract data from ocr_text if structured data is missing
            const parsedData = parseReceiptOcr(ocrText, rawVeryfiData || veryfiResult);
            
            // Format date as YYYY-MM-DD for the form
            const receiptDate = parsedData.date || veryfiResult.date 
              ? new Date(parsedData.date || veryfiResult.date).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];
            
            // Map line items to description
            const description = veryfiResult.line_items
              ?.map((item) => item.description || (item as { text?: string }).text || "")
              .filter(Boolean)
              .join(', ') || "";
            
            return {
              title: parsedData.vendor || veryfiResult.vendor?.name || "Receipt",
              vendor: parsedData.vendor || veryfiResult.vendor?.name || "",
              amount: parsedData.total || veryfiResult.total || 0,
              gstAmount: parsedData.gst || veryfiResult.tax || 0,
              date: receiptDate,
              description: description,
            };
          };

          // Check if Veryfi is configured and call it
          const hasVeryfiCredentials = 
            process.env.VERYFI_CLIENT_ID && 
            process.env.VERYFI_CLIENT_SECRET && 
            process.env.VERYFI_USERNAME && 
            process.env.VERYFI_API_KEY;

          if (hasVeryfiCredentials) {
            try {
              const veryfiClient = new VeryfiClient();
              const veryfiResult = await veryfiClient.processReceipt(publicUrl);
              
              // Log the full Veryfi response
              console.log("Veryfi OCR result received:", JSON.stringify(veryfiResult, null, 2));
              
              // Transform to expense form format, using OCR text fallback if needed
              ocrResult = transformVeryfiToExpense(
                veryfiResult, 
                veryfiResult.ocr_text, 
                veryfiResult.raw_data
              );
              
              // Log the transformed result
              console.log("OCR result transformed for form:", JSON.stringify(ocrResult, null, 2));
            } catch (veryfiError) {
              console.error("Veryfi OCR error:", veryfiError);
              // Fall through to placeholder if Veryfi fails
            }
          }

          // If OCR failed or Veryfi not configured, use placeholder
          if (!ocrResult) {
            const veryfiPlaceholder = {
              vendor: { name: "Receipt" },
              total: 0,
              tax: 0,
              date: new Date().toISOString(),
              line_items: [],
              currency_code: "CAD",
            };
            
            ocrResult = transformVeryfiToExpense(veryfiPlaceholder);
          }

          // Update receipt with OCR result
          await db
            .update(receipts)
            .set({
              ocrStatus: "completed",
              ocrResult: ocrResult as any,
              ocrProcessedAt: new Date(),
            })
            .where(eq(receipts.id, newReceipt.id));

          // Increment OCR request count
          await db
            .update(users)
            .set({
              ocrRequestsThisMonth: (userProfile.ocrRequestsThisMonth || 0) + 1,
            })
            .where(eq(users.id, user.id));
        } else {
          // OCR limit reached
        }
      }
    } catch (ocrError) {
      // OCR is optional, don't fail the upload if it fails
      console.error("OCR processing failed (non-blocking):", ocrError);
      // Reset status to pending if OCR failed
      await db
        .update(receipts)
        .set({ ocrStatus: "pending" })
        .where(eq(receipts.id, newReceipt.id))
        .catch(() => {});
    }

    // Return receipt with OCR result if available
    return NextResponse.json({ ...newReceipt, ocrResult }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/receipts/upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
