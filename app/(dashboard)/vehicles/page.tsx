import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VehiclesList } from "@/components/vehicles/vehicles-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, vehicles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { EXPENSE_CATEGORIES } from "@/lib/validations/expense-categories";

export default async function VehiclesPage() {
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

  const vehicleRecords = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, user.id))
    .orderBy(desc(vehicles.createdAt));

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Vehicles</h1>
        <Button asChild>
          <Link href="/vehicles/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Link>
        </Button>
      </div>
      <div className="pt-2 sm:pt-3">
        <VehiclesList initialData={vehicleRecords} />
      </div>
    </div>
  );
}
