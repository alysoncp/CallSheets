"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { INCOME_TYPES } from "@/lib/validations/expense-categories";
import type { IncomeType } from "@/lib/validations/expense-categories";

interface IncomeTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (incomeType: IncomeType) => void;
}

const incomeTypeLabels: Record<IncomeType, string> = {
  union_production: "Union Production",
  non_union_production: "Non-Union Production",
  royalty_residual: "Royalty/Residual",
  cash: "Cash",
};

export function IncomeTypeDialog({
  open,
  onOpenChange,
  onSelect,
}: IncomeTypeDialogProps) {
  const handleSelect = (incomeType: IncomeType) => {
    onSelect(incomeType);
    // Don't close the dialog here - let the parent component handle the state transition
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Income Type</DialogTitle>
          <DialogDescription>
            Choose the type of income you want to add
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {INCOME_TYPES.map((incomeType) => (
            <Button
              key={incomeType}
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => handleSelect(incomeType)}
            >
              <div className="text-left">
                <div className="font-medium">{incomeTypeLabels[incomeType]}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
