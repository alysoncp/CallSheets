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
import { ExpenseForm } from "@/components/forms/expense-form";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<{ id: string; imageUrl: string } | null>(null);

  // Reset state when dialog opens for a new entry (or when closing)
  useEffect(() => {
    if (open && !initialData?.id) {
      setEntryMethod(null);
      setOcrData(null);
      setUploadedFile(null);
      setUploadedReceipt(null);
    }
  }, [open, initialData?.id]);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    const processedFile = await compressImageIfNeeded(file);
    setUploadedFile(processedFile);

    try {
      const formData = new FormData();
      formData.append("file", processedFile);

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
        
        // If OCR is available, process it
        if (data.ocrResult) {
          setOcrData(data.ocrResult);
        } else {
          // No OCR result
        }

        // Proceed to form (with or without OCR data)
        setEntryMethod("manual");
      } else {
        const errorText = await response.text();
        throw new Error("Failed to upload receipt");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("Failed to upload receipt. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = async () => {
    // For now, use file input with capture attribute
    // In a real app, you'd use the camera API
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
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
    setUploading(false);
    setEntryMethod(null);
    setOcrData(null);
    setUploadedFile(null);
    setUploadedReceipt(null);
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
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
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
            {entryMethod === "upload" && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Receipt Image</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
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
