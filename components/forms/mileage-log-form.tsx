"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { mileageLogSchema, type MileageLogFormData } from "@/lib/validations/mileage-log";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Vehicle {
  id: string;
  name: string;
}

interface MileageLogFormProps {
  initialData?: Partial<MileageLogFormData> & { id?: string };
  onSuccess?: () => void;
}

export function MileageLogForm({ initialData, onSuccess }: MileageLogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mileageLoggingStyle, setMileageLoggingStyle] = useState<"odometer" | "trip_distance">("trip_distance");

  // Fetch vehicles and user profile
  useEffect(() => {
    // Fetch vehicles
    fetch("/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setVehicles(data);
        }
      })
      .catch(() => {
        // Silently fail
      });

    // Fetch user profile for mileage logging style
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && data.mileageLoggingStyle) {
          setMileageLoggingStyle(data.mileageLoggingStyle);
        }
      })
      .catch(() => {
        // Silently fail - default to trip_distance
      });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MileageLogFormData>({
    resolver: zodResolver(mileageLogSchema) as Resolver<MileageLogFormData>,
    defaultValues: {
      ...initialData,
      isBusinessUse: initialData?.isBusinessUse ?? true,
    },
  });

  // Clear the other field when one is set
  const handleValueChange = (field: "odometerReading" | "tripDistance", value: string) => {
    if (field === "odometerReading") {
      setValue("tripDistance", undefined);
    } else {
      setValue("odometerReading", undefined);
    }
  };

  const onSubmit = async (data: MileageLogFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure only the appropriate field is set based on logging style
      const submitData = { ...data };
      if (mileageLoggingStyle === "odometer") {
        submitData.tripDistance = undefined;
      } else {
        submitData.odometerReading = undefined;
      }

      const isEditing = !!initialData?.id;
      const url = isEditing ? `/api/mileage-logs/${initialData.id}` : "/api/mileage-logs";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? "update" : "save"} mileage log`);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/vehicle-mileage");
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
          <Label htmlFor="vehicleId">Vehicle *</Label>
          <Select id="vehicleId" {...register("vehicleId")} required>
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </Select>
          {errors.vehicleId && (
            <p className="text-sm text-destructive">{errors.vehicleId.message}</p>
          )}
        </div>

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
          <Label htmlFor="value">
            {mileageLoggingStyle === "odometer" ? "Odometer Reading" : "Trip Distance (km)"} *
          </Label>
          {mileageLoggingStyle === "odometer" ? (
            <Input
              id="odometerReading"
              type="number"
              step="1"
              min="0"
              {...register("odometerReading", {
                onChange: (e) => handleValueChange("odometerReading", e.target.value),
                required: "Odometer reading is required",
              })}
            />
          ) : (
            <Input
              id="tripDistance"
              type="number"
              step="1"
              min="0"
              {...register("tripDistance", {
                onChange: (e) => handleValueChange("tripDistance", e.target.value),
                required: "Trip distance is required",
              })}
            />
          )}
          {errors.odometerReading && (
            <p className="text-sm text-destructive">{errors.odometerReading.message}</p>
          )}
          {errors.tripDistance && (
            <p className="text-sm text-destructive">{errors.tripDistance.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            {...register("description")}
            placeholder="Optional description"
          />
        </div>

        <div className="space-y-2 flex items-center">
          <input
            id="isBusinessUse"
            type="checkbox"
            {...register("isBusinessUse")}
            className="mr-2"
          />
          <Label htmlFor="isBusinessUse">Business Use</Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || vehicles.length === 0}>
          {loading
            ? initialData?.id
              ? "Updating..."
              : "Saving..."
            : initialData?.id
              ? "Update Mileage Log"
              : "Save Mileage Log"}
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

      {vehicles.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No vehicles found. <a href="/vehicles" className="text-primary underline">Add a vehicle first</a>.
        </p>
      )}
    </form>
  );
}
