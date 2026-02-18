"use client";

import { useState, useMemo } from "react";
import { ReceiptsGrid } from "@/components/receipts/receipts-grid";
import { ReceiptsExportDialog } from "@/components/receipts/receipts-export-dialog";
import { ExpenseEntryDialog } from "@/components/expenses/expense-entry-dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedExpenseId?: string | null;
  linkedIncomeId?: string | null;
  expenseDate?: string | null;
}

interface ReceiptsPageClientProps {
  initialReceipts: ReceiptRecord[];
}

export function ReceiptsPageClient({ initialReceipts }: ReceiptsPageClientProps) {
  const { taxYear } = useTaxYear();
  const [receipts, setReceipts] = useState(initialReceipts);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      try {
        const dateRaw = r.expenseDate ?? r.uploadedAt;
        if (!dateRaw) return false;
        const d = typeof dateRaw === "string" ? new Date(dateRaw) : new Date(dateRaw);
        return d.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [receipts, taxYear]);

  const refreshReceipts = async () => {
    const response = await fetch("/api/receipts", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setReceipts(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Receipts</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
            disabled={filteredReceipts.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>
      <ReceiptsGrid
        initialData={filteredReceipts}
        onReceiptsUpdated={refreshReceipts}
      />
      <ReceiptsExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        receipts={filteredReceipts}
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
