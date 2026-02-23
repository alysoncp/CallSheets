import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, vehicleMileageLogs, vehicles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { VehicleMileagePageClient } from "@/components/mileage/vehicle-mileage-page-client";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";

export default async function VehicleMileagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const [userProfile] = await db
    .select({ enabledExpenseCategories: users.enabledExpenseCategories })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const enabledCategories = Array.isArray(userProfile?.enabledExpenseCategories)
    ? userProfile.enabledExpenseCategories
    : [];
  const trackVehicleExpenses = enabledCategories.length === 0
    ? true
    : EXPENSE_CATEGORIES.VEHICLE.some((cat) => enabledCategories.includes(cat));

  if (!trackVehicleExpenses) {
    redirect("/dashboard");
  }

  const mileageLogs = await db
    .select()
    .from(vehicleMileageLogs)
    .where(eq(vehicleMileageLogs.userId, user.id))
    .orderBy(desc(vehicleMileageLogs.date));

  const vehicleRecords = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, user.id))
    .orderBy(desc(vehicles.createdAt));

  return (
    <VehicleMileagePageClient
      initialLogs={mileageLogs}
      vehicles={vehicleRecords}
    />
  );
}
