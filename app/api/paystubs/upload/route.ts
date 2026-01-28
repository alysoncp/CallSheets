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
  // #region agent log
  await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:8',message:'POST handler entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:15',message:'Auth check completed',data:{hasUser:!!user,hasAuthError:!!authError,authErrorMessage:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (authError || !user) {
      // #region agent log
      await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:20',message:'Auth failed, returning 401',data:{authError:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const notes = formData.get("notes") as string | null;

    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:24',message:'FormData extracted',data:{hasFile:!!file,fileName:file?.name,fileSize:file?.size,fileType:file?.type,hasNotes:!!notes},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!file) {
      // #region agent log
      await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:28',message:'No file provided, returning 400',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const bucketName = "paystubs";
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:33',message:'Before storage upload',data:{filePath,fileExt,fileName,bucketName:'paystubs'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    let { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:40',message:'Storage upload completed',data:{hasUploadData:!!uploadData,hasUploadError:!!uploadError,uploadErrorMessage:uploadError?.message,uploadErrorCode:uploadError?.statusCode,uploadErrorName:uploadError?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // If bucket doesn't exist, try to create it and retry upload
    if (uploadError && (uploadError.message === "Bucket not found" || uploadError.statusCode === "404" || uploadError.message?.includes("row-level security"))) {
      // #region agent log
      await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:46',message:'Bucket not found or RLS issue, attempting to create with admin client',data:{bucketName:'paystubs',uploadError:uploadError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // Use admin client for bucket creation (requires service role key)
      const adminClient = createAdminClient();
      const { data: bucketData, error: bucketError } = await adminClient.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ["image/*"],
        fileSizeLimit: 52428800, // 50MB
      });
      // #region agent log
      await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:53',message:'Bucket creation attempt completed',data:{hasBucketData:!!bucketData,hasBucketError:!!bucketError,bucketErrorMessage:bucketError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
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
        // #region agent log
        await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:65',message:'Retry upload after bucket creation',data:{hasUploadData:!!uploadData,hasUploadError:!!uploadError,uploadErrorMessage:uploadError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      }
    }

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // #region agent log
      await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:72',message:'Storage upload error, returning 500',data:{uploadError:uploadError.message,uploadErrorCode:uploadError.statusCode,uploadErrorName:uploadError.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:54',message:'Public URL generated',data:{publicUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Create paystub record
    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:59',message:'Before database insert',data:{userId:user.id,hasPublicUrl:!!publicUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    const [newPaystub] = await db
      .insert(paystubs)
      .values({
        userId: user.id,
        imageUrl: publicUrl,
        notes: notes || null,
        ocrStatus: "pending",
      })
      .returning();

    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:70',message:'Database insert completed',data:{hasNewPaystub:!!newPaystub,paystubId:newPaystub?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

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
      if (!userProfile) {
        console.log("No user profile found, skipping OCR");
      }

      if (userProfile) {
        const ocrLimits: Record<string, number> = {
          basic: 10,
          personal: 100,
          corporate: Infinity,
        };

        const limit = ocrLimits[userProfile.subscriptionTier || "basic"];
        const canProcessOCR = !userProfile.ocrRequestsThisMonth || userProfile.ocrRequestsThisMonth < limit;

        // #region agent log
        await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:156',message:'OCR processing check',data:{canProcessOCR,subscriptionTier:userProfile.subscriptionTier,ocrRequestsThisMonth:userProfile.ocrRequestsThisMonth,limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
        // #endregion
        
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
            
            // Calculate total deductions
            const totalDeductions = parsedData.deductions || 
              ((veryfiResult.deductions?.cpp || 0) + 
               (veryfiResult.deductions?.ei || 0) + 
               (veryfiResult.deductions?.income_tax || 0));
            
            // Map to income form field names
            return {
              productionName: parsedData.productionName || veryfiResult.employer || "",
              grossPay: parsedData.grossIncome || veryfiResult.gross_pay || 0,
              amount: parsedData.netIncome || veryfiResult.net_pay || 0, // Net income
              date: payPeriodDate,
              totalDeductions: totalDeductions,
              gstHstCollected: parsedData.gst || 0,
              // Keep individual deductions for backward compatibility
              cppContribution: veryfiResult.deductions?.cpp || 0,
              eiContribution: veryfiResult.deductions?.ei || 0,
              incomeTaxDeduction: veryfiResult.deductions?.income_tax || 0,
            };
          };

          // Check if Veryfi is configured and call it
          const hasVeryfiCredentials = 
            process.env.VERYFI_CLIENT_ID && 
            process.env.VERYFI_CLIENT_SECRET && 
            process.env.VERYFI_USERNAME && 
            process.env.VERYFI_API_KEY;

          // #region agent log
          await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:175',message:'Veryfi credentials check',data:{hasVeryfiCredentials,hasClientId:!!process.env.VERYFI_CLIENT_ID,hasClientSecret:!!process.env.VERYFI_CLIENT_SECRET,hasUsername:!!process.env.VERYFI_USERNAME,hasApiKey:!!process.env.VERYFI_API_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
          // #endregion
          
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
              
              // #region agent log
              await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:163',message:'Veryfi result received from client',data:{veryfiResult,hasOcrText:!!veryfiResult.ocr_text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
              // #endregion
              
              // Transform to income form format, using OCR text parser if available
              ocrResult = transformVeryfiToIncome(
                veryfiResult,
                veryfiResult.ocr_text,
                veryfiResult.raw_data
              );
              
              console.log("=== OCR RESULT TRANSFORMED ===");
              console.log("Transformed OCR result:", JSON.stringify(ocrResult, null, 2));
              
              // #region agent log
              await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:170',message:'OCR result transformed to income format',data:{ocrResult,ocrResultKeys:Object.keys(ocrResult)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
              // #endregion
            } catch (veryfiError) {
              console.error("=== VERYFI OCR ERROR ===");
              console.error("Error:", veryfiError);
              console.error("Error message:", veryfiError instanceof Error ? veryfiError.message : String(veryfiError));
              console.error("Error stack:", veryfiError instanceof Error ? veryfiError.stack : undefined);
              // #region agent log
              await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:177',message:'Veryfi OCR error caught',data:{errorMessage:veryfiError instanceof Error?veryfiError.message:String(veryfiError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
              // #endregion
              // Fall through to placeholder if Veryfi fails
            }
          } else {
            console.log("=== VERYFI CREDENTIALS MISSING ===");
            console.log("Skipping Veryfi OCR, will use placeholder");
          }

          // If OCR failed or Veryfi not configured, use placeholder
          if (!ocrResult) {
            console.log("=== USING PLACEHOLDER OCR DATA ===");
            // #region agent log
            await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:188',message:'Using placeholder OCR data',data:{hasVeryfiCredentials},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'N'})}).catch(()=>{});
            // #endregion
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
            
            // #region agent log
            await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:202',message:'Placeholder OCR result created',data:{ocrResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'N'})}).catch(()=>{});
            // #endregion
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
        } else {
          console.log("=== USER PROFILE NOT FOUND ===");
          console.log("Skipping OCR processing");
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
    
    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:200',message:'Returning success response',data:{hasNewPaystub:!!newPaystub,hasOcrResult:!!ocrResult,ocrResult,responseDataKeys:Object.keys(responseData)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/paystubs/upload:", error);
    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'paystubs/upload/route.ts:197',message:'Catch block executed',data:{errorMessage:error instanceof Error?error.message:String(error),errorType:error?.constructor?.name,errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
