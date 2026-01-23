"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeSchema, type IncomeFormData } from "@/lib/validations/income";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { INCOME_TYPES } from "@/lib/validations/expense-categories";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IncomeFormProps {
  initialData?: Partial<IncomeFormData> & { id?: string };
  onSuccess?: () => void;
  ocrData?: any;
}

export function IncomeForm({ initialData, onSuccess, ocrData }: IncomeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merge OCR data with initial data
  const mergedData = ocrData ? { ...initialData, ...ocrData } : initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: mergedData,
  });

  const onSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    setError(null);

    try {
      const url = initialData?.id
        ? `/api/income/${initialData.id}`
        : "/api/income";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save income");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/income");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                required
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                required
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="incomeType">Income Type *</Label>
              <Select id="incomeType" {...register("incomeType")} required>
                <option value="">Select type</option>
                {INCOME_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </Select>
              {errors.incomeType && (
                <p className="text-sm text-destructive">{errors.incomeType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossPay">Gross Pay</Label>
              <Input
                id="grossPay"
                type="number"
                step="0.01"
                {...register("grossPay")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionName">Production Name</Label>
              <Input
                id="productionName"
                {...register("productionName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employerName">Employer Name</Label>
              <Input
                id="employerName"
                {...register("employerName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstHstCollected">GST/HST Collected</Label>
              <Input
                id="gstHstCollected"
                type="number"
                step="0.01"
                {...register("gstHstCollected")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : initialData?.id ? "Update" : "Create"}
            </Button>
            {onSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
  );
}
