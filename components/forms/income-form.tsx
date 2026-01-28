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
import { useState, useEffect } from "react";
import type { IncomeType } from "@/lib/validations/expense-categories";

interface IncomeFormProps {
  initialData?: Partial<IncomeFormData> & { id?: string };
  onSuccess?: () => void;
  ocrData?: any;
  incomeType?: IncomeType;
  userUbcpStatus?: string;
}

export function IncomeForm({ initialData, onSuccess, ocrData, incomeType, userUbcpStatus }: IncomeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merge OCR data with initial data, and set income type if provided
  // Also calculate totalDeductions from individual fields if needed
  const processedOcrData = ocrData ? {
    ...ocrData,
    totalDeductions: ocrData.totalDeductions || 
      ((ocrData.cppContribution || 0) + 
       (ocrData.eiContribution || 0) + 
       (ocrData.incomeTaxDeduction || 0)),
  } : undefined;

  const mergedData = incomeType 
    ? { ...initialData, ...processedOcrData, incomeType }
    : processedOcrData 
      ? { ...initialData, ...processedOcrData }
      : initialData;

  const isUnionProduction = incomeType === "union_production" || mergedData?.incomeType === "union_production";
  const isFullMember = userUbcpStatus === "full_member";
  const showOptionalFields = isUnionProduction && isFullMember;
  const showDuesOnly = isUnionProduction && !isFullMember && userUbcpStatus !== "none";
  const productionLabel = isUnionProduction ? "Production Name" : "Production / Employer";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: mergedData,
  });

  // Watch for gross income and deductions to calculate net income
  const grossIncome = watch("grossPay") || 0;
  const totalDeductions = watch("totalDeductions") || 0;
  const currentAmount = watch("amount");
  const netIncome = Math.max(0, Number(grossIncome) - Number(totalDeductions));

  // Update amount field when net income changes (only if user hasn't manually entered it)
  useEffect(() => {
    if (netIncome > 0 && (!currentAmount || currentAmount === 0)) {
      setValue("amount", netIncome);
    }
  }, [netIncome, currentAmount, setValue]);

  const onSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Calculate net income if not already set
      const finalData = {
        ...data,
        amount: data.amount || Math.max(0, (data.grossPay || 0) - (data.totalDeductions || 0)),
      };

      const url = initialData?.id
        ? `/api/income/${initialData.id}`
        : "/api/income";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
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
            {/* 1. Income Type (read-only if provided) */}
            {incomeType ? (
              <div className="space-y-2">
                <Label htmlFor="incomeType">Income Type</Label>
                <Input
                  id="incomeType"
                  value={incomeType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  disabled
                  readOnly
                />
                <input type="hidden" {...register("incomeType")} value={incomeType} />
              </div>
            ) : (
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
            )}

            {/* 2. Date */}
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

            {/* 3. Production Name (or "Production / Employer" for non-union) */}
            <div className="space-y-2">
              <Label htmlFor="productionName">{productionLabel} *</Label>
              <Input
                id="productionName"
                {...register("productionName")}
                required
              />
              {errors.productionName && (
                <p className="text-sm text-destructive">{errors.productionName.message}</p>
              )}
            </div>

            {/* 4. Net Income (calculated, read-only) */}
            <div className="space-y-2">
              <Label htmlFor="amount">Net Income *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={netIncome.toFixed(2)}
                readOnly
                className="bg-muted"
              />
              <input type="hidden" {...register("amount")} value={netIncome} />
              <p className="text-xs text-muted-foreground">
                Calculated: Gross Income - Deductions
              </p>
            </div>

            {/* 5. Gross Income */}
            <div className="space-y-2">
              <Label htmlFor="grossPay">Gross Income *</Label>
              <Input
                id="grossPay"
                type="number"
                step="0.01"
                {...register("grossPay")}
                required
              />
              {errors.grossPay && (
                <p className="text-sm text-destructive">{errors.grossPay.message}</p>
              )}
            </div>

            {/* 6. Deductions (single field) */}
            <div className="space-y-2">
              <Label htmlFor="totalDeductions">Deductions *</Label>
              <Input
                id="totalDeductions"
                type="number"
                step="0.01"
                {...register("totalDeductions")}
                required
              />
              <p className="text-xs text-muted-foreground">
                Total of CPP + EI + Income Tax
              </p>
              {errors.totalDeductions && (
                <p className="text-sm text-destructive">{errors.totalDeductions.message}</p>
              )}
            </div>

            {/* 7. GST */}
            <div className="space-y-2">
              <Label htmlFor="gstHstCollected">GST *</Label>
              <Input
                id="gstHstCollected"
                type="number"
                step="0.01"
                {...register("gstHstCollected")}
                required
              />
              {errors.gstHstCollected && (
                <p className="text-sm text-destructive">{errors.gstHstCollected.message}</p>
              )}
            </div>

            {/* Optional fields - only for Union Production */}
            {showOptionalFields && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="retirement">Retirement *</Label>
                  <Input
                    id="retirement"
                    type="number"
                    step="0.01"
                    {...register("retirement")}
                    required
                  />
                  {errors.retirement && (
                    <p className="text-sm text-destructive">{errors.retirement.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance *</Label>
                  <Input
                    id="insurance"
                    type="number"
                    step="0.01"
                    {...register("insurance")}
                    required
                  />
                  {errors.insurance && (
                    <p className="text-sm text-destructive">{errors.insurance.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pension">Pension *</Label>
                  <Input
                    id="pension"
                    type="number"
                    step="0.01"
                    {...register("pension")}
                    required
                  />
                  {errors.pension && (
                    <p className="text-sm text-destructive">{errors.pension.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dues">Dues *</Label>
                  <Input
                    id="dues"
                    type="number"
                    step="0.01"
                    {...register("dues")}
                    required
                  />
                  {errors.dues && (
                    <p className="text-sm text-destructive">{errors.dues.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Dues only - for Union Production but not Full Member */}
            {showDuesOnly && (
              <div className="space-y-2">
                <Label htmlFor="dues">Dues</Label>
                <Input
                  id="dues"
                  type="number"
                  step="0.01"
                  {...register("dues")}
                />
              </div>
            )}
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
