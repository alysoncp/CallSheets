"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { storageImageToProxyUrl, isPdfUrl } from "@/lib/utils/storage-image-url";
import { FileText } from "lucide-react";

interface PaystubRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedIncomeId?: string | null;
  stubDate?: string | null;
}

interface PaystubsPreviewProps {
  initialData: PaystubRecord[];
  onDelete?: (id: string) => void;
}

export function PaystubsPreview({ initialData, onDelete }: PaystubsPreviewProps) {
  const previewPaystubs = initialData.slice(0, 3);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this paystub?")) {
      return;
    }

    try {
      const response = await fetch(`/api/paystubs/${id}`, {
        method: "DELETE",
      });

      if (response.ok && onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error("Error deleting paystub:", error);
    }
  };

  if (initialData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Recent Paystubs</CardTitle>
          <Link href="/paystubs">
            <Button variant="outline" size="sm">
              View Full Gallery
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {previewPaystubs.map((paystub, index) => (
            <div
              key={paystub.id}
              className={`relative group ${index === 2 ? "hidden md:block" : ""}`}
            >
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {isPdfUrl(paystub.imageUrl) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-1" />
                    <span className="text-xs font-medium">PDF</span>
                  </div>
                ) : (
                  <Image
                    src={storageImageToProxyUrl(paystub.imageUrl) ?? paystub.imageUrl}
                    alt="Paystub"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {format(
                    paystub.stubDate
                      ? typeof paystub.stubDate === "string"
                        ? parseISO(paystub.stubDate)
                        : (paystub.stubDate as Date)
                      : typeof paystub.uploadedAt === "string"
                        ? parseISO(paystub.uploadedAt)
                        : paystub.uploadedAt,
                    "MMM dd, yyyy"
                  )}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(paystub.id)}
                  className="mt-1 h-8"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        {initialData.length > 3 && (
          <div className="mt-4 text-center">
            <Link href="/paystubs">
              <Button variant="outline">
                View All {initialData.length} Paystubs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
