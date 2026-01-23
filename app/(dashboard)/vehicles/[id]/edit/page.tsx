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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Vehicle</h1>
      <VehicleForm initialData={vehicle} />
    </div>
  );
}
