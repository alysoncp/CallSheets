"use client";

import { useState } from "react";
import { PaystubsGrid } from "@/components/paystubs/paystubs-grid";
import { PaystubsExportDialog } from "@/components/paystubs/paystubs-export-dialog";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";

interface PaystubRecord {
  id: string;
  imageUrl: string;
  uploadedAt: string | Date;
  notes?: string | null;
  ocrStatus?: string | null;
  linkedIncomeId?: string | null;
  stubDate?: string | null;
}

interface PaystubsPageClientProps {
  initialPaystubs: PaystubRecord[];
}

export function PaystubsPageClient({ initialPaystubs }: PaystubsPageClientProps) {
  const [paystubs, setPaystubs] = useState(initialPaystubs);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const refreshPaystubs = async () => {
    const response = await fetch("/api/paystubs", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setPaystubs(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Paystubs</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
            disabled={paystubs.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
      </div>
      <PaystubsGrid
        initialData={paystubs}
        onPaystubsUpdated={refreshPaystubs}
      />
      <PaystubsExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        paystubs={paystubs}
      />
      <IncomeEntryDialog
        open={uploadDialogOpen}
        onOpenChange={(open) => {
          setUploadDialogOpen(open);
          if (!open) {
            refreshPaystubs();
          }
        }}
        onPaystubUploaded={refreshPaystubs}
      />
    </div>
  );
}
