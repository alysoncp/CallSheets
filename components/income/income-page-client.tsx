"use client";

import { useState } from "react";
import { IncomeList } from "@/components/income/income-list";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { PaystubsPreview } from "@/components/paystubs/paystubs-preview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface IncomePageClientProps {
  incomeRecords: any[];
  paystubRecords: any[];
}

export function IncomePageClient({
  incomeRecords,
  paystubRecords,
}: IncomePageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [paystubs, setPaystubs] = useState(paystubRecords);

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
        <h1 className="text-3xl font-bold">Income</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Income
        </Button>
      </div>
      <PaystubsPreview initialData={paystubs} onDelete={refreshPaystubs} />
      <IncomeList
        initialData={incomeRecords}
        onEdit={(income) => {
          setEditingIncome(income);
          setDialogOpen(true);
        }}
      />
      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingIncome(null);
          }
        }}
        initialData={editingIncome || undefined}
      />
    </div>
  );
}
