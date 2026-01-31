"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormData } from "@/lib/validations/vehicle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CCA_CLASSES } from "@/lib/validations/expense-categories";

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData> & { id?: string };
}

export function VehicleForm({ initialData }: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as Resolver<VehicleFormData>,
    defaultValues: initialData,
  });

  const claimsCca = watch("claimsCca");

  // Clear conditional fields when claimsCca is unchecked
  const handleClaimsCcaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      setValue("purchasePrice", undefined);
      setValue("ccaClass", undefined);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Clear conditional fields if claimsCca is false
      const submitData = { ...data };
      if (!submitData.claimsCca) {
        submitData.purchasePrice = undefined;
        submitData.ccaClass = undefined;
      }

      const url = initialData?.id
        ? `/api/vehicles/${initialData.id}`
        : "/api/vehicles";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save vehicle");
      }

      router.push("/vehicles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData?.id ? "Edit Vehicle" : "Add Vehicle"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                {...register("make")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                {...register("model")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                {...register("year")}
              />
            </div>

            <div className="space-y-2 flex items-center">
              <input
                id="isPrimary"
                type="checkbox"
                {...register("isPrimary")}
                className="mr-2"
              />
              <Label htmlFor="isPrimary">Is Primary Vehicle</Label>
            </div>

            <div className="space-y-2 flex items-center">
              <input
                id="usedExclusivelyForBusiness"
                type="checkbox"
                {...register("usedExclusivelyForBusiness")}
                className="mr-2"
              />
              <Label htmlFor="usedExclusivelyForBusiness">
                Used Exclusively for Business
              </Label>
            </div>

            <div className="space-y-2 flex items-center">
              <input
                id="claimsCca"
                type="checkbox"
                {...register("claimsCca", {
                  onChange: handleClaimsCcaChange,
                })}
                className="mr-2"
              />
              <Label htmlFor="claimsCca">Claims CCA</Label>
            </div>

            {claimsCca && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase price or CCA balance</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    {...register("purchasePrice")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ccaClass">CCA Class</Label>
                  <Select id="ccaClass" {...register("ccaClass")}>
                    <option value="">Select CCA class</option>
                    {CCA_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : initialData?.id ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
