import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { db } from "@/lib/db";
import { vehicles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export default async function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, params.id), eq(vehicles.userId, user.id)))
    .limit(1);

  if (!vehicle) {
    redirect("/vehicles");
  }

  // Convert DB nulls to undefined for form (form expects undefined, not null)
  const initialData = {
    ...vehicle,
    make: vehicle.make ?? undefined,
    model: vehicle.model ?? undefined,
    year: vehicle.year ?? undefined,
    licensePlate: vehicle.licensePlate ?? undefined,
    isPrimary: vehicle.isPrimary ?? undefined,
    usedExclusivelyForBusiness: vehicle.usedExclusivelyForBusiness ?? undefined,
    claimsCca: vehicle.claimsCca ?? undefined,
    ccaClass: vehicle.ccaClass ?? undefined,
    currentMileage: vehicle.currentMileage ?? undefined,
    mileageAtBeginningOfYear: vehicle.mileageAtBeginningOfYear ?? undefined,
    totalAnnualMileage: vehicle.totalAnnualMileage ?? undefined,
    estimatedYearlyMileage: vehicle.estimatedYearlyMileage ?? undefined,
    mileageEstimate: vehicle.mileageEstimate ?? undefined,
    purchasedThisYear: vehicle.purchasedThisYear ?? undefined,
    purchasePrice: vehicle.purchasePrice != null ? Number(vehicle.purchasePrice) : undefined,
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Edit Vehicle</h1>
      </div>
      <VehicleForm initialData={initialData} />
    </div>
  );
}
