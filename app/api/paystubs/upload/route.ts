import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VeryfiClient, type VeryfiPaystubResult } from "@/lib/veryfi/client";
import { parsePaystubOcr } from "@/lib/utils/paystub-ocr-parser";

export const runtime = "nodejs";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const ALLOWED_PAYSTUB_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

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
    const enableOcrValue = formData.get("enableOcr");
    const enableOcr = typeof enableOcrValue === "string" && enableOcrValue === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }
    if (!file.type || !ALLOWED_PAYSTUB_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Paystubs must be an image or PDF." },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const bucketName = "paystubs";
    const fileExt = file.name.split(".").pop() || (file.type === "application/pdf" ? "pdf" : "jpg");
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
        public: false,
        allowedMimeTypes: ["image/*", "application/pdf"],
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
        { error: "Failed to upload file", details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    // Create paystub record
    const [newPaystub] = await db
      .insert(paystubs)
      .values({
        userId: user.id,
        imageUrl: publicUrl,
        notes: notes || null,
        ocrStatus: "pending",
      })
      .returning();

    // Try to process OCR automatically (non-blocking) - only if enabled
    let ocrResult = null;
    if (enableOcr) {
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
            // Update paystub status to processing
            await db
              .update(paystubs)
              .set({ ocrStatus: "processing" })
              .where(eq(paystubs.id, newPaystub.id));

            // Helper function to transform Veryfi result to income form format
            const transformVeryfiToIncome = (veryfiResult: VeryfiPaystubResult, ocrText?: string, rawVeryfiData?: any) => {
              // Use OCR parser to extract data from ocr_text if structured data is missing
              const parsedData = parsePaystubOcr(ocrText, rawVeryfiData || veryfiResult);
              
              // Format pay period date as YYYY-MM-DD for the form
              const payPeriodDate = parsedData.date || veryfiResult.pay_period 
                ? new Date(parsedData.date || veryfiResult.pay_period).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
              
              // Calculate total deductions (for EP) or use deductions (for CC)
              const totalDeductions = parsedData.deductions ?? 
                ((veryfiResult.deductions?.cpp || 0) + 
                 (veryfiResult.deductions?.ei || 0) + 
                 (veryfiResult.deductions?.income_tax || 0));
              
              // Form entry values: EP uses grossPayRaw for Gross Pay; CC uses grossPayRaw + reimbursements
              const grossPayForForm = parsedData.grossPayRaw ?? parsedData.grossIncome ?? veryfiResult.gross_pay ?? 0;
              const reimbursementsForForm = parsedData.reimbursements ?? 0;
              
              return {
                paystubIssuer: parsedData.issuerType ?? undefined,
                productionName: parsedData.productionName || veryfiResult.employer || "",
                grossPay: grossPayForForm,
                amount: parsedData.netIncome ?? veryfiResult.net_pay ?? 0,
                date: payPeriodDate,
                totalDeductions,
                reimbursements: reimbursementsForForm,
                gstHstCollected: parsedData.gst ?? 0,
                cppContribution: veryfiResult.deductions?.cpp ?? 0,
                eiContribution: veryfiResult.deductions?.ei ?? 0,
                incomeTaxDeduction: veryfiResult.deductions?.income_tax ?? 0,
                dues: parsedData.dues ?? 0,
                retirement: parsedData.retirement ?? 0,
                pension: parsedData.pension ?? 0,
                insurance: parsedData.insurance ?? 0,
              };
            };

            // Check if Veryfi is configured and call it
            const hasVeryfiCredentials = 
              process.env.VERYFI_CLIENT_ID && 
              process.env.VERYFI_CLIENT_SECRET && 
              process.env.VERYFI_USERNAME && 
              process.env.VERYFI_API_KEY;

            // Only create signed URL when we will call Veryfi (avoids createAdminClient() when service role key is missing)
            let imageUrlForOcr = publicUrl;
            if (hasVeryfiCredentials) {
              try {
                const adminClient = createAdminClient();
                const { data: signedData } = await adminClient.storage
                  .from(bucketName)
                  .createSignedUrl(filePath, 300); // 5 min expiry
                if (signedData?.signedUrl) imageUrlForOcr = signedData.signedUrl;
              } catch (signedUrlError) {
                console.warn("Signed URL failed, using public URL for Veryfi:", signedUrlError);
              }
            }

            if (hasVeryfiCredentials) {
              try {
                const veryfiClient = new VeryfiClient();
                const veryfiResult = await veryfiClient.processPaystub(imageUrlForOcr);

                // Transform to income form format, using OCR text parser if available
                ocrResult = transformVeryfiToIncome(
                  veryfiResult,
                  veryfiResult.ocr_text,
                  veryfiResult.raw_data
                );
                
              } catch (veryfiError) {
                console.error("Error:", veryfiError);
                console.error("Error message:", veryfiError instanceof Error ? veryfiError.message : String(veryfiError));
                console.error("Error stack:", veryfiError instanceof Error ? veryfiError.stack : undefined);
                // Fall through to placeholder if Veryfi fails
              }
            }

            // If OCR failed or Veryfi not configured, use placeholder
            if (!ocrResult) {
              const veryfiPlaceholder: VeryfiPaystubResult = {
                employer: "",
                employee_name: "",
                gross_pay: 0,
                net_pay: 0,
                deductions: {
                  cpp: 0,
                  ei: 0,
                  income_tax: 0,
                },
                pay_period: new Date().toISOString(),
                ocr_text: undefined,
                raw_data: undefined,
              };
              
              ocrResult = transformVeryfiToIncome(veryfiPlaceholder, undefined, undefined);
            }

            // Update paystub with OCR result (only if OCR was processed)
            if (ocrResult) {
              await db
                .update(paystubs)
                .set({
                  ocrStatus: "completed",
                  ocrResult: ocrResult as any,
                  ocrProcessedAt: new Date(),
                })
                .where(eq(paystubs.id, newPaystub.id));

              // Increment OCR request count
              await db
                .update(users)
                .set({
                  ocrRequestsThisMonth: (userProfile.ocrRequestsThisMonth || 0) + 1,
                })
                .where(eq(users.id, user.id));
            }
          }
        }
      } catch (ocrError) {
        // OCR is optional, don't fail the upload if it fails
        console.error("Error:", ocrError);
        console.error("Error message:", ocrError instanceof Error ? ocrError.message : String(ocrError));
        console.error("Error stack:", ocrError instanceof Error ? ocrError.stack : undefined);
        // Reset status to pending if OCR failed
        await db
          .update(paystubs)
          .set({ ocrStatus: "pending" })
          .where(eq(paystubs.id, newPaystub.id))
          .catch(() => {});
      }
    }
    
    // Return paystub with OCR result if available
    const responseData = { ...newPaystub, ocrResult };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/paystubs/upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
