"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ReceiptRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  expenseDate?: string | null;
}

interface ReceiptsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipts: ReceiptRecord[];
}

export function ReceiptsExportDialog({
  open,
  onOpenChange,
  receipts,
}: ReceiptsExportDialogProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  // Initialize with all receipts selected
  useEffect(() => {
    if (open && receipts.length > 0) {
      setSelectedIds(new Set(receipts.map((r) => r.id)));
    }
  }, [open, receipts]);

  const handleToggleAll = () => {
    if (selectedIds.size === receipts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(receipts.map((r) => r.id)));
    }
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleExport = async (exportAll: boolean) => {
    setExporting(true);
    try {
      const idsToExport = exportAll
        ? undefined
        : Array.from(selectedIds);

      const response = await fetch("/api/receipts/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptIds: idsToExport,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipts-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Receipts to PDF</DialogTitle>
          <DialogDescription>
            Select which receipts to include in the PDF export
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedIds.size === receipts.length && receipts.length > 0}
              onChange={handleToggleAll}
            />
            <Label htmlFor="select-all" className="cursor-pointer font-medium">
              Select All ({receipts.length} receipts)
            </Label>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-accent"
              >
                <Checkbox
                  id={`receipt-${receipt.id}`}
                  checked={selectedIds.has(receipt.id)}
                  onChange={() => handleToggle(receipt.id)}
                />
                <Label
                  htmlFor={`receipt-${receipt.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="text-sm">
                    <div className="font-medium">Receipt {receipt.id.slice(0, 8)}</div>
                    <div className="text-muted-foreground">
                      {format(
                        receipt.expenseDate
                          ? typeof receipt.expenseDate === "string"
                            ? parseISO(receipt.expenseDate)
                            : (receipt.expenseDate as Date)
                          : typeof receipt.uploadedAt === "string"
                            ? parseISO(receipt.uploadedAt)
                            : receipt.uploadedAt,
                        "MMM dd, yyyy"
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={exporting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleExport(false)}
            disabled={exporting || selectedIds.size === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              `Export Selected (${selectedIds.size})`
            )}
          </Button>
          <Button
            onClick={() => handleExport(true)}
            disabled={exporting || receipts.length === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export All"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
