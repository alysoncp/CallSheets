"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { DocumentImageViewDialog } from "@/components/ui/document-image-view-dialog";
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

interface PaystubsGridProps {
  initialData: PaystubRecord[];
  onPaystubsUpdated?: () => void;
}

export function PaystubsGrid({ initialData, onPaystubsUpdated }: PaystubsGridProps) {
  const [paystubs, setPaystubs] = useState(initialData);

  // Sync with parent when initialData changes (e.g. after adding a new paystub)
  useEffect(() => {
    setPaystubs(initialData);
  }, [initialData]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewingPaystub, setViewingPaystub] = useState<PaystubRecord | null>(null);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [incomeEditDialogOpen, setIncomeEditDialogOpen] = useState(false);

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open && onPaystubsUpdated) {
      fetch("/api/paystubs", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => setPaystubs(data))
        .catch(console.error);
    }
  };

  const handleEditIncome = async (incomeId: string) => {
    try {
      const response = await fetch("/api/income", { cache: "no-store" });
      if (response.ok) {
        const incomes = await response.json();
        const entry = incomes.find((i: any) => i.id === incomeId);
        if (entry) {
          setEditingIncome(entry);
          setViewingPaystub(null);
          setIncomeEditDialogOpen(true);
        } else {
          alert("Income entry not found");
        }
      }
    } catch (error) {
      console.error("Error fetching income:", error);
      alert("Failed to load income for editing");
    }
  };

  const handleDelete = async (id: string, deleteEntry: boolean) => {
    const url = deleteEntry
      ? `/api/paystubs/${id}?deleteEntry=true`
      : `/api/paystubs/${id}`;
    const response = await fetch(url, { method: "DELETE" });
    if (response.ok) {
      setPaystubs((prev) => prev.filter((p) => p.id !== id));
      if (onPaystubsUpdated) onPaystubsUpdated();
    } else {
      console.error("Error deleting paystub");
    }
  };

  const displayDate = (paystub: PaystubRecord) => {
    if (paystub.stubDate) {
      return format(
        typeof paystub.stubDate === "string"
          ? parseISO(paystub.stubDate)
          : (paystub.stubDate as Date),
        "MMM dd, yyyy"
      );
    }
    return format(
      typeof paystub.uploadedAt === "string"
        ? parseISO(paystub.uploadedAt)
        : paystub.uploadedAt,
      "MMM dd, yyyy"
    );
  };

  if (paystubs.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="py-20 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No paystubs uploaded yet.</p>
            <Button onClick={() => setDialogOpen(true)}>
              Add Your First Income
            </Button>
          </CardContent>
        </Card>
        <IncomeEntryDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onPaystubUploaded={() => {
            fetch("/api/paystubs", { cache: "no-store" })
              .then((res) => res.json())
              .then((data) => setPaystubs(data))
              .catch(console.error);
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paystubs.map((paystub) => (
          <Card key={paystub.id} className="overflow-hidden">
            <button
              type="button"
              className="relative block w-full aspect-video bg-muted cursor-pointer border-0 p-0 text-left overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => setViewingPaystub(paystub)}
            >
              {isPdfUrl(paystub.imageUrl) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground pointer-events-none">
                  <FileText className="h-12 w-12 mb-1" />
                  <span className="text-xs font-medium">PDF</span>
                </div>
              ) : (
                <Image
                  src={storageImageToProxyUrl(paystub.imageUrl) ?? paystub.imageUrl}
                  alt="Paystub"
                  fill
                  className="object-cover pointer-events-none"
                  unoptimized
                  onError={(e) => {
                    console.error("Error loading paystub image:", paystub.imageUrl);
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </button>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {displayDate(paystub)}
              </p>
              {paystub.ocrStatus && (
                <p className="text-xs text-muted-foreground mb-2">
                  OCR: {paystub.ocrStatus}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onPaystubUploaded={() => {
          fetch("/api/paystubs", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => setPaystubs(data))
            .catch(console.error);
        }}
      />
      {viewingPaystub && (
        <DocumentImageViewDialog
          open={!!viewingPaystub}
          onOpenChange={(open) => {
            if (!open) setViewingPaystub(null);
          }}
          imageUrl={
            storageImageToProxyUrl(viewingPaystub.imageUrl) ??
            viewingPaystub.imageUrl
          }
          title="Paystub"
          documentType="paystub"
          documentId={viewingPaystub.id}
          viewHref="/income"
          hasLinkedEntry={!!viewingPaystub.linkedIncomeId}
          onEdit={() => {
            if (viewingPaystub.linkedIncomeId) {
              handleEditIncome(viewingPaystub.linkedIncomeId);
            }
          }}
          onDelete={handleDelete}
        />
      )}
      <IncomeEntryDialog
        open={incomeEditDialogOpen}
        onOpenChange={(open) => {
          setIncomeEditDialogOpen(open);
          if (!open) {
            setEditingIncome(null);
            if (onPaystubsUpdated) onPaystubsUpdated();
          }
        }}
        initialData={editingIncome}
      />
    </>
  );
}
