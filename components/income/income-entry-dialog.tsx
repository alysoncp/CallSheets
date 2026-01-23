"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IncomeForm } from "@/components/forms/income-form";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EntryMethod = "upload" | "camera" | "manual" | null;

interface IncomeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<any> & { id?: string };
}

export function IncomeEntryDialog({
  open,
  onOpenChange,
  initialData,
}: IncomeEntryDialogProps) {
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [uploading, setUploading] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/paystubs/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // If OCR is available, process it
        if (data.ocrResult) {
          setOcrData(data.ocrResult);
        }
        // Proceed to form with OCR data
        setEntryMethod("manual");
      } else {
        throw new Error("Failed to upload paystub");
      }
    } catch (error) {
      console.error("Error uploading paystub:", error);
      alert("Failed to upload paystub. Please try again.");
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
    setEntryMethod(null);
    setOcrData(null);
    setUploadedFile(null);
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
              {entryMethod === "upload" ? "Upload Paystub" : "Take Picture"}
            </DialogTitle>
            <DialogDescription>
              {entryMethod === "upload"
                ? "Select a paystub image to upload"
                : "Capture a photo of your paystub"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {entryMethod === "upload" && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Paystub Image</Label>
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
                  Uploading and processing paystub...
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
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>
              {ocrData
                ? "Review and complete the income details (pre-filled from paystub)"
                : "Enter the income details below."}
            </DialogDescription>
          </DialogHeader>
          <IncomeForm
            initialData={ocrData ? { ...ocrData, paystubImageUrl: uploadedFile?.name } : undefined}
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
          <DialogTitle>Add Income</DialogTitle>
          <DialogDescription>
            Choose how you want to add this income record
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
              <div className="font-medium">Upload Paystub</div>
              <div className="text-sm text-muted-foreground">
                Upload an image of your paystub
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
                Capture a photo of your paystub
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
                Enter income details manually
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
