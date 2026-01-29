"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IncomeForm } from "@/components/forms/income-form";
import { IncomeTypeDialog } from "@/components/income/income-type-dialog";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { IncomeType } from "@/lib/validations/expense-categories";

type EntryMethod = "upload" | "camera" | "manual" | null;
type DialogStep = "type" | "method" | "upload" | "form";

interface IncomeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<any> & { id?: string };
  onPaystubUploaded?: () => void;
}

export function IncomeEntryDialog({
  open,
  onOpenChange,
  initialData,
  onPaystubUploaded,
}: IncomeEntryDialogProps) {
  const [step, setStep] = useState<DialogStep>("type");
  const [selectedIncomeType, setSelectedIncomeType] = useState<IncomeType | null>(null);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPaystub, setUploadedPaystub] = useState<{ id: string; imageUrl: string } | null>(null);
  const [enableOcr, setEnableOcr] = useState(true);
  const [userProfile, setUserProfile] = useState<{ ubcpActraStatus?: string } | null>(null);

  // Reset state when dialog opens for a new entry
  useEffect(() => {
    if (open && !initialData?.id) {
      // Reset all state when opening for a new entry
      setStep("type");
      setSelectedIncomeType(null);
      setEntryMethod(null);
      setOcrData(null);
      setUploadedFile(null);
      setUploadedPaystub(null);
      setEnableOcr(true);
      
      // Fetch user profile to get UBCP status
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setUserProfile({
              ubcpActraStatus: data.ubcpActraStatus || "none",
            });
          }
        })
        .catch(() => {
          // Silently fail
        });
    }
  }, [open, initialData]);

  const handleIncomeTypeSelect = (incomeType: IncomeType) => {
    setSelectedIncomeType(incomeType);
    setStep("method");
    // Reset OCR toggle based on income type
    setEnableOcr(incomeType === "union_production");
  };

  const handleEntryMethodSelect = (method: EntryMethod) => {
    setEntryMethod(method);
    if (method === "manual") {
      setStep("form");
    } else {
      setStep("upload");
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("enableOcr", enableOcr ? "true" : "false");

      const response = await fetch("/api/paystubs/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store paystub data (including imageUrl)
        if (data.id && data.imageUrl) {
          setUploadedPaystub({ id: data.id, imageUrl: data.imageUrl });
          // Notify parent that paystub was uploaded
          if (onPaystubUploaded) {
            onPaystubUploaded();
          }
        }
        
        // If OCR is enabled and available, process it; otherwise clear ocrData
        if (enableOcr && data.ocrResult) {
          setOcrData(data.ocrResult);
        } else {
          setOcrData(null); // Clear OCR data if disabled
        }
        
        // Proceed to form
        setStep("form");
      } else {
        let message = "Failed to upload paystub";
        const text = await response.text().catch(() => "");
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data.error) {
              message = data.details ? `${data.error}: ${data.details}` : data.error;
            } else {
              message = text;
            }
          } catch {
            message = text;
          }
        } else if (response.statusText) {
          message = response.statusText;
        }
        throw new Error(message);
      }
    } catch (error) {
      console.error("Error uploading paystub:", error);
      alert(error instanceof Error ? error.message : "Failed to upload paystub. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    setStep("type");
    setSelectedIncomeType(null);
    setEntryMethod(null);
    setOcrData(null);
    setUploadedFile(null);
    setUploadedPaystub(null);
    setEnableOcr(true);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  // If editing existing income, show form directly
  if (initialData?.id) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
            <DialogDescription>
              Update the income details below.
            </DialogDescription>
          </DialogHeader>
          <IncomeForm
            initialData={initialData}
            onSuccess={() => handleClose(false)}
            ocrData={null}
            incomeType={initialData.incomeType}
            userUbcpStatus={userProfile?.ubcpActraStatus}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Step 1: Income Type Selection
  if (step === "type") {
    return (
      <IncomeTypeDialog
        open={open}
        onOpenChange={handleClose}
        onSelect={handleIncomeTypeSelect}
      />
    );
  }

  // Step 2: Entry Method Selection
  if (step === "method") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>
              Choose how you want to add this income record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleEntryMethodSelect("upload")}
            >
              <Upload className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Upload Paystub</div>
                <div className="text-sm text-muted-foreground">
                  Upload an image or PDF of your paystub
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleEntryMethodSelect("camera")}
            >
              <Camera className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Take Picture</div>
                <div className="text-sm text-muted-foreground">
                  Capture a photo of your paystub
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleEntryMethodSelect("manual")}
            >
              <FileText className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manual Entry</div>
                <div className="text-sm text-muted-foreground">
                  Enter income details manually
                </div>
              </div>
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 3: Upload/Camera Interface
  if (step === "upload") {
    const isUnionProduction = selectedIncomeType === "union_production";
    
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {entryMethod === "upload" ? "Upload Paystub" : "Take Picture"}
            </DialogTitle>
            <DialogDescription>
              {entryMethod === "upload"
                ? "Select a paystub image or PDF to upload"
                : "Capture a photo of your paystub"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* OCR Toggle - only for Union Production */}
            {isUnionProduction && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-ocr">Enable OCR Processing</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically extract data from paystub
                  </p>
                </div>
                <Switch
                  id="enable-ocr"
                  checked={enableOcr}
                  onCheckedChange={setEnableOcr}
                />
              </div>
            )}

            {entryMethod === "upload" && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Paystub</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                  disabled={uploading}
                />
              </div>
            )}
            {entryMethod === "camera" && (
              <div className="space-y-4">
                <Button
                  onClick={handleCameraCapture}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Photo
                    </>
                  )}
                </Button>
              </div>
            )}
            {uploading && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Uploading and processing paystub...
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 4: Income Form
  if (step === "form") {
    const isUnionProduction = selectedIncomeType === "union_production";
    const isFullMember = userProfile?.ubcpActraStatus === "full_member";
    
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>
              {ocrData
                ? "Review and complete the income details (pre-filled from paystub)"
                : "Enter the income details below."}
            </DialogDescription>
          </DialogHeader>
          <IncomeForm
            initialData={ocrData ? {
              ...ocrData,
              paystubImageUrl: uploadedPaystub?.imageUrl || "",
            } : uploadedPaystub ? {
              paystubImageUrl: uploadedPaystub.imageUrl,
            } : undefined}
            onSuccess={() => handleClose(false)}
            ocrData={ocrData}
            incomeType={selectedIncomeType || undefined}
            userUbcpStatus={userProfile?.ubcpActraStatus}
            paystubId={uploadedPaystub?.id}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
