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
  paystubId?: string;
}

export function IncomeForm({ initialData, onSuccess, ocrData, incomeType, userUbcpStatus, paystubId }: IncomeFormProps) {
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
  const showOnlyDues = isUnionProduction && userUbcpStatus !== "full_member"; // Non-full members: only Dues
  const showOptionalFields = isUnionProduction; // Full members: Retirement, Insurance, Pension, Dues
  const productionLabel = isUnionProduction ? "Production Name" : "Production / Employer";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      ...mergedData,
      paystubIssuer: (mergedData as any)?.paystubIssuer ?? "EP",
      reimbursements: (mergedData as any)?.reimbursements ?? 0,
    },
  });

  const paystubIssuer = watch("paystubIssuer") ?? "EP";
  const isEP = paystubIssuer === "EP";
  const isCC = paystubIssuer === "CC";

  // Non-union: net income = gross - deductions
  const grossPayVal = watch("grossPay") || 0;
  const totalDeductionsVal = watch("totalDeductions") || 0;
  const amountVal = watch("amount");
  const netIncomeNonUnion = Math.max(0, Number(grossPayVal) - Number(totalDeductionsVal));

  useEffect(() => {
    if (!isUnionProduction && netIncomeNonUnion > 0 && (!amountVal || amountVal === 0)) {
      setValue("amount", netIncomeNonUnion);
    }
  }, [isUnionProduction, netIncomeNonUnion, amountVal, setValue]);

  const onSubmit = async (data: IncomeFormData) => {
    setLoading(true);
    setError(null);

    try {
      let finalData: IncomeFormData = { ...data };
      if (isUnionProduction) {
        const grossPayEntry = Number(data.grossPay) || 0;
        const gstEntry = Number(data.gstHstCollected) || 0;
        const netPayEntry = Number(data.amount) || 0;
        const reimbEntry = Number(data.reimbursements) || 0;
        if (data.paystubIssuer === "EP") {
          finalData.grossPay = Math.max(0, grossPayEntry - gstEntry);
          finalData.amount = netPayEntry;
        } else if (data.paystubIssuer === "CC") {
          finalData.grossPay = grossPayEntry + reimbEntry;
          finalData.amount = netPayEntry;
        }
      } else {
        finalData.amount = data.amount || Math.max(0, (data.grossPay || 0) - (data.totalDeductions || 0));
      }

      const url = initialData?.id
        ? `/api/income/${initialData.id}`
        : "/api/income";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...finalData,
          paystubId: paystubId, // Include paystub ID to link it
        }),
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

            {/* Union Production: Paystub issuer (EP / CC) */}
            {isUnionProduction && (
              <div className="space-y-2">
                <Label htmlFor="paystubIssuer">Paystub issuer *</Label>
                <select
                  id="paystubIssuer"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("paystubIssuer")}
                >
                  <option value="EP">EP (Entertainment Partners)</option>
                  <option value="CC">CC (Cast and Crew)</option>
                </select>
              </div>
            )}

            {/* Non-union: Gross, Deductions, Net (calculated), GST */}
            {!isUnionProduction && (
              <>
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
                <div className="space-y-2">
                  <Label htmlFor="totalDeductions">Deductions *</Label>
                  <Input
                    id="totalDeductions"
                    type="number"
                    step="0.01"
                    {...register("totalDeductions")}
                    required
                  />
                  {errors.totalDeductions && (
                    <p className="text-sm text-destructive">{errors.totalDeductions.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Net Income *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={netIncomeNonUnion.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                  <input type="hidden" {...register("amount")} value={netIncomeNonUnion} />
                  <p className="text-xs text-muted-foreground">
                    Calculated: Gross Income - Deductions
                  </p>
                </div>
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
              </>
            )}

            {/* Union EP: Gross Pay, GST, Total Deductions, Net Pay */}
            {isUnionProduction && isEP && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="grossPay">Gross Pay *</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="totalDeductions">Total Deductions *</Label>
                  <Input
                    id="totalDeductions"
                    type="number"
                    step="0.01"
                    {...register("totalDeductions")}
                    required
                  />
                  {errors.totalDeductions && (
                    <p className="text-sm text-destructive">{errors.totalDeductions.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Net Pay *</Label>
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
              </>
            )}

            {/* Union CC: Gross Pay, GST, Deductions, Reimbursements, Net Pay */}
            {isUnionProduction && isCC && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="grossPay">Gross Pay *</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="totalDeductions">Deductions *</Label>
                  <Input
                    id="totalDeductions"
                    type="number"
                    step="0.01"
                    {...register("totalDeductions")}
                    required
                  />
                  {errors.totalDeductions && (
                    <p className="text-sm text-destructive">{errors.totalDeductions.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reimbursements">Reimbursements</Label>
                  <Input
                    id="reimbursements"
                    type="number"
                    step="0.01"
                    {...register("reimbursements")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Net Pay *</Label>
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
              </>
            )}

            {/* Optional fields - Union Production: only Dues for non-full members; all four for full members */}
            {showOnlyDues && (
              <div className="space-y-2">
                <Label htmlFor="dues">Dues</Label>
                <Input
                  id="dues"
                  type="number"
                  step="0.01"
                  {...register("dues")}
                />
                {errors.dues && (
                  <p className="text-sm text-destructive">{errors.dues.message}</p>
                )}
              </div>
            )}
            {showOptionalFields && !showOnlyDues && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="retirement">Retirement</Label>
                  <Input
                    id="retirement"
                    type="number"
                    step="0.01"
                    {...register("retirement")}
                  />
                  {errors.retirement && (
                    <p className="text-sm text-destructive">{errors.retirement.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance</Label>
                  <Input
                    id="insurance"
                    type="number"
                    step="0.01"
                    {...register("insurance")}
                  />
                  {errors.insurance && (
                    <p className="text-sm text-destructive">{errors.insurance.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pension">Pension</Label>
                  <Input
                    id="pension"
                    type="number"
                    step="0.01"
                    {...register("pension")}
                  />
                  {errors.pension && (
                    <p className="text-sm text-destructive">{errors.pension.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dues">Dues</Label>
                  <Input
                    id="dues"
                    type="number"
                    step="0.01"
                    {...register("dues")}
                  />
                  {errors.dues && (
                    <p className="text-sm text-destructive">{errors.dues.message}</p>
                  )}
                </div>
              </>
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
