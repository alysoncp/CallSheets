"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/forms/expense-form";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { compressImageIfNeeded } from "@/lib/utils/client-image-compression";

type EntryMethod = "upload" | "camera" | "manual" | null;

interface ExpenseEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<any> & { id?: string };
}

export function ExpenseEntryDialog({
  open,
  onOpenChange,
  initialData,
}: ExpenseEntryDialogProps) {
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<{ id: string; imageUrl: string } | null>(null);
  const [enableOcr, setEnableOcr] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const filePickerOpenRef = useRef(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const uploadInProgressRef = useRef(false);
  const pickerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;

    const clearPickerOpen = () => {
      setTimeout(() => {
        if (!uploading) {
          filePickerOpenRef.current = false;
          setPickerOpen(false);
        }
      }, 300);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearPickerOpen();
      }
    };

    window.addEventListener("focus", clearPickerOpen);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", clearPickerOpen);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pickerOpen, uploading]);

  // Reset state when dialog opens for a new entry (or when closing)
  useEffect(() => {
    if (open && !initialData?.id) {
      setEntryMethod(null);
      setOcrData(null);
      setUploadedReceipt(null);
      setEnableOcr(true);
      setPickerOpen(false);
    }
  }, [open, initialData?.id]);

  const handleFileSelect = async (file: File) => {
    if (uploadInProgressRef.current) return;
    uploadInProgressRef.current = true;
    setUploading(true);
    const processedFile = await compressImageIfNeeded(file);

    try {
      const formData = new FormData();
      formData.append("file", processedFile);
      formData.append("enableOcr", enableOcr ? "true" : "false");

      const response = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // Store receipt data (including imageUrl)
        if (data.id && data.imageUrl) {
          setUploadedReceipt({ id: data.id, imageUrl: data.imageUrl });
        }
        
        if (enableOcr && data.ocrResult) {
          setOcrData(data.ocrResult);
        } else {
          setOcrData(null);
        }

        // Proceed to form (with or without OCR data)
        setEntryMethod("manual");
      } else {
        await response.text();
        throw new Error("Failed to upload receipt");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("Failed to upload receipt. Please try again.");
    } finally {
      uploadInProgressRef.current = false;
      setUploading(false);
    }
  };

  const handleCameraCapture = () => {
    if (pickerOpen || uploading) return;
    filePickerOpenRef.current = true;
    setPickerOpen(true);

    if (pickerTimeoutRef.current) {
      clearTimeout(pickerTimeoutRef.current);
      pickerTimeoutRef.current = null;
    }

    pickerTimeoutRef.current = setTimeout(() => {
      filePickerOpenRef.current = false;
      setPickerOpen(false);
      pickerTimeoutRef.current = null;
    }, 15000);

    cameraInputRef.current?.click();
  };

  const handleReset = () => {
    setUploading(false);
    setEntryMethod(null);
    setOcrData(null);
    setUploadedReceipt(null);
    setEnableOcr(true);
    setPickerOpen(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      handleReset();
    }
    onOpenChange(open);
  };

  // If editing existing expense, show form directly
  if (initialData?.id) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details below.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            initialData={initialData}
            onSuccess={() => handleClose(false)}
            ocrData={null}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // If entry method selected and not manual, show upload/camera interface
  if (entryMethod === "upload" || entryMethod === "camera") {
    const preventCloseWhilePickerOrUploading = (e: Event) => {
      if (filePickerOpenRef.current || uploading) {
        e.preventDefault();
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-md"
          onInteractOutside={preventCloseWhilePickerOrUploading}
          onPointerDownOutside={preventCloseWhilePickerOrUploading}
        >
          <DialogHeader>
            <DialogTitle>
              {entryMethod === "upload" ? "Upload Receipt" : "Take Picture"}
            </DialogTitle>
            <DialogDescription>
              {entryMethod === "upload"
                ? "Select a receipt image to upload"
                : "Capture a photo of your receipt"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="enable-ocr">Auto Fill from Receipt</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically fill expense details from your receipt
                </p>
              </div>
              <Switch
                id="enable-ocr"
                checked={enableOcr}
                onCheckedChange={setEnableOcr}
              />
            </div>

            {entryMethod === "upload" && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Receipt Image</Label>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                    e.currentTarget.value = "";
                  }}
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="default"
                  className="w-full"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Browse / Select Photo
                </Button>
              </div>
            )}
            {entryMethod === "camera" && (
              <div className="space-y-4">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => {
                    filePickerOpenRef.current = false;
                    setPickerOpen(false);
                    if (pickerTimeoutRef.current) {
                      clearTimeout(pickerTimeoutRef.current);
                      pickerTimeoutRef.current = null;
                    }
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                    e.currentTarget.value = "";
                  }}
                  disabled={uploading}
                />
                <Button
                  onClick={handleCameraCapture}
                  disabled={uploading || pickerOpen}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : pickerOpen ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening camera...
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
                  Uploading and processing receipt...
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Back
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If manual entry or OCR data ready, show form
  if (entryMethod === "manual" || ocrData) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              {ocrData
                ? "Review and complete the expense details (pre-filled from receipt)"
                : "Enter the expense details below."}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            key={initialData?.id ?? uploadedReceipt?.id ?? "new"}
            initialData={ocrData ? { 
              ...ocrData, 
              // Use the actual receipt image URL if available, otherwise empty string
              receiptImageUrl: uploadedReceipt?.imageUrl || "",
              // Ensure required fields have defaults if OCR didn't provide them
              title: ocrData.title || ocrData.vendor || "Receipt",
              category: ocrData.category || "",
              expenseType: ocrData.expenseType || "self_employment",
            } : uploadedReceipt ? { receiptImageUrl: uploadedReceipt.imageUrl } : undefined}
            onSuccess={() => handleClose(false)}
            ocrData={ocrData}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Initial state: show entry method selection
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Choose how you want to add this expense
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => setEntryMethod("upload")}
          >
            <Upload className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Upload Receipt</div>
              <div className="text-sm text-muted-foreground">
                Upload an image of your receipt
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => setEntryMethod("camera")}
          >
            <Camera className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Take Picture</div>
              <div className="text-sm text-muted-foreground">
                Capture a photo of your receipt
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => setEntryMethod("manual")}
          >
            <FileText className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Manual Entry</div>
              <div className="text-sm text-muted-foreground">
                Enter expense details manually
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
