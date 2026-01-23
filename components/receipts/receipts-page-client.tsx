"use client";

import { useState } from "react";
import { ReceiptsGrid } from "@/components/receipts/receipts-grid";
import { ReceiptsExportDialog } from "@/components/receipts/receipts-export-dialog";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedExpenseId?: string | null;
  linkedIncomeId?: string | null;
}

interface ReceiptsPageClientProps {
  initialReceipts: ReceiptRecord[];
}

export function ReceiptsPageClient({ initialReceipts }: ReceiptsPageClientProps) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const refreshReceipts = async () => {
    const response = await fetch("/api/receipts", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setReceipts(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
            disabled={receipts.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          <DialogTrigger asChild>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <ReceiptsGrid
        initialData={receipts}
        onReceiptsUpdated={refreshReceipts}
      />
      <ReceiptsExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        receipts={receipts}
      />
      <ExpenseEntryDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            refreshReceipts();
          }
        }}
      />
    </div>
  );
}
