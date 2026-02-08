import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { paystubs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { VeryfiClient, type VeryfiPaystubResult } from "@/lib/veryfi/client";
import { parsePaystubOcr } from "@/lib/utils/paystub-ocr-parser";

export async function POST(request: NextRequest) {
  console.log("=== PAYSTUB UPLOAD ROUTE CALLED ===");
  console.log("Timestamp:", new Date().toISOString());
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

    // Upload to Supabase Storage
    const bucketName = "paystubs";
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

    console.log("=== BEFORE OCR PROCESSING BLOCK ===");
    console.log("New paystub created:", newPaystub?.id);
    console.log("Public URL:", publicUrl);
    
    // Try to process OCR automatically (non-blocking) - only if enabled
    let ocrResult = null;
    if (enableOcr) {
      try {
        console.log("=== STARTING OCR PROCESSING ===");
        console.log("OCR is enabled, processing...");
        // Check user's subscription tier and OCR limits
        const [userProfile] = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id))
          .limit(1);

        console.log("User profile found:", !!userProfile);
        
        if (userProfile) {
          const ocrLimits: Record<string, number> = {
            basic: 10,
            personal: 100,
            corporate: Infinity,
          };

          const limit = ocrLimits[userProfile.subscriptionTier || "basic"];
          const canProcessOCR = !userProfile.ocrRequestsThisMonth || userProfile.ocrRequestsThisMonth < limit;

          console.log("=== PAYSTUB OCR PROCESSING ===");
          console.log("Can process OCR:", canProcessOCR);
          console.log("Subscription tier:", userProfile.subscriptionTier);
          console.log("OCR requests this month:", userProfile.ocrRequestsThisMonth);
          console.log("Limit:", limit);

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

            console.log("=== VERYFI CREDENTIALS CHECK ===");
            console.log("Has Veryfi credentials:", hasVeryfiCredentials);
            console.log("Has CLIENT_ID:", !!process.env.VERYFI_CLIENT_ID);
            console.log("Has CLIENT_SECRET:", !!process.env.VERYFI_CLIENT_SECRET);
            console.log("Has USERNAME:", !!process.env.VERYFI_USERNAME);
            console.log("Has API_KEY:", !!process.env.VERYFI_API_KEY);
            console.log("Public URL for OCR:", publicUrl);

            if (hasVeryfiCredentials) {
              try {
                console.log("=== CALLING VERYFI API ===");
                console.log("Image URL:", publicUrl);
                const veryfiClient = new VeryfiClient();
                console.log("VeryfiClient created, calling processPaystub...");
                const veryfiResult = await veryfiClient.processPaystub(publicUrl);
                
                console.log("=== VERYFI RESULT RECEIVED ===");
                console.log("Veryfi result:", JSON.stringify(veryfiResult, null, 2));
                console.log("OCR text available:", !!veryfiResult.ocr_text);
                console.log("OCR text length:", veryfiResult.ocr_text?.length || 0);

                // Transform to income form format, using OCR text parser if available
                ocrResult = transformVeryfiToIncome(
                  veryfiResult,
                  veryfiResult.ocr_text,
                  veryfiResult.raw_data
                );
                
                console.log("=== OCR RESULT TRANSFORMED ===");
                console.log("Transformed OCR result:", JSON.stringify(ocrResult, null, 2));
              } catch (veryfiError) {
                console.error("=== VERYFI OCR ERROR ===");
                console.error("Error:", veryfiError);
                console.error("Error message:", veryfiError instanceof Error ? veryfiError.message : String(veryfiError));
                console.error("Error stack:", veryfiError instanceof Error ? veryfiError.stack : undefined);
                // Fall through to placeholder if Veryfi fails
              }
            } else {
              console.log("=== VERYFI CREDENTIALS MISSING ===");
              console.log("Skipping Veryfi OCR, will use placeholder");
            }

            // If OCR failed or Veryfi not configured, use placeholder
            if (!ocrResult) {
              console.log("=== USING PLACEHOLDER OCR DATA ===");
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
              
              console.log("Placeholder OCR result:", JSON.stringify(ocrResult, null, 2));
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
            } else {
              // OCR limit reached
              console.log("=== OCR LIMIT REACHED ===");
              console.log("OCR requests this month:", userProfile.ocrRequestsThisMonth);
              console.log("Limit:", limit);
            }
          }
        }
      } catch (ocrError) {
        // OCR is optional, don't fail the upload if it fails
        console.error("=== OCR PROCESSING ERROR ===");
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
    } else {
      console.log("=== OCR DISABLED ===");
      console.log("Skipping OCR processing as requested by user");
    }

    console.log("=== AFTER OCR PROCESSING BLOCK ===");
    console.log("OCR result:", ocrResult);
    console.log("OCR result type:", typeof ocrResult);
    
    // Return paystub with OCR result if available
    const responseData = { ...newPaystub, ocrResult };
    
    console.log("=== RETURNING RESPONSE ===");
    console.log("Has OCR result:", !!ocrResult);
    console.log("OCR result:", JSON.stringify(ocrResult, null, 2));
    console.log("Response data keys:", Object.keys(responseData));

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/paystubs/upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
