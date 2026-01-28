"use client";

import { useState, useMemo, useEffect } from "react";
import { IncomeList } from "@/components/income/income-list";
import { IncomeEntryDialog } from "@/components/income/income-entry-dialog";
import { PaystubsPreview } from "@/components/paystubs/paystubs-preview";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTaxYear } from "@/lib/contexts/tax-year-context";

interface IncomePageClientProps {
  incomeRecords: any[];
  paystubRecords: any[];
}

export function IncomePageClient({
  incomeRecords,
  paystubRecords,
}: IncomePageClientProps) {
  const { taxYear } = useTaxYear();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [paystubs, setPaystubs] = useState(paystubRecords);
  const [incomeList, setIncomeList] = useState(incomeRecords);

  // Filter income records by selected year from context
  const filteredIncomeList = useMemo(() => {
    return incomeList.filter((record) => {
      try {
        const recordDate = new Date(record.date);
        return recordDate.getFullYear() === taxYear;
      } catch {
        return false;
      }
    });
  }, [incomeList, taxYear]);

  const refreshPaystubs = async () => {
    const response = await fetch("/api/paystubs", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setPaystubs(data);
    }
  };

  const refreshIncome = async () => {
    const response = await fetch("/api/income", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setIncomeList(data);
      // Dispatch event to update sidebar year list
      window.dispatchEvent(new Event('incomeUpdated'));
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
        initialData={filteredIncomeList}
        paystubRecords={paystubs}
        onEdit={(income) => {
          setEditingIncome(income);
          setDialogOpen(true);
        }}
        onRefresh={refreshIncome}
      />
      <IncomeEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingIncome(null);
            refreshIncome(); // Refresh income list when dialog closes
          }
        }}
        initialData={editingIncome || undefined}
        onPaystubUploaded={refreshPaystubs}
      />
    </div>
  );
}
