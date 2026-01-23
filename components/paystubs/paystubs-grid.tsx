"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";

interface PaystubRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedIncomeId?: string | null;
}

interface PaystubsGridProps {
  initialData: PaystubRecord[];
}

export function PaystubsGrid({ initialData }: PaystubsGridProps) {
  const [paystubs, setPaystubs] = useState(initialData);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/paystubs/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newPaystub = await response.json();
        setPaystubs([newPaystub, ...paystubs]);
      }
    } catch (error) {
      console.error("Error uploading paystub:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this paystub?")) {
      return;
    }

    try {
      const response = await fetch(`/api/paystubs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPaystubs(paystubs.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting paystub:", error);
    }
  };

  if (paystubs.length === 0) {
    return (
      <Card>
        <CardContent className="py-20 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No paystubs uploaded yet.</p>
          <label htmlFor="paystub-upload">
            <Button asChild>
              <span>Upload Your First Paystub</span>
            </Button>
          </label>
          <input
            id="paystub-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="paystub-upload">
          <Button disabled={uploading} asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Paystub"}
            </span>
          </Button>
        </label>
        <input
          id="paystub-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paystubs.map((paystub) => (
          <Card key={paystub.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <Image
                src={paystub.imageUrl}
                alt="Paystub"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {format(
                  typeof paystub.uploadedAt === "string"
                    ? parseISO(paystub.uploadedAt)
                    : paystub.uploadedAt,
                  "MMM dd, yyyy"
                )}
              </p>
              {paystub.ocrStatus && (
                <p className="text-xs text-muted-foreground mb-2">
                  OCR: {paystub.ocrStatus}
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(paystub.id)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
