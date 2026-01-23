"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface PaystubRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedIncomeId?: string | null;
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
        <div className="flex items-center justify-between">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {previewPaystubs.map((paystub) => (
            <div key={paystub.id} className="relative group">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={paystub.imageUrl}
                  alt="Paystub"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">
                  {format(
                    typeof paystub.uploadedAt === "string"
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
