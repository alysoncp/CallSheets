"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MileageLogForm } from "@/components/forms/mileage-log-form";

interface MileageLogEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Partial<any> & { id?: string };
}

export function MileageLogEntryDialog({
  open,
  onOpenChange,
  initialData,
}: MileageLogEntryDialogProps) {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? "Edit Mileage Log" : "Add Mileage Log"}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id
              ? "Update the mileage log details below."
              : "Enter the mileage log details below."}
          </DialogDescription>
        </DialogHeader>
        <MileageLogForm
          initialData={initialData}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
