import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function VehicleMileagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicle Mileage</h1>
        <Button asChild>
          <Link href="/vehicle-mileage/new">
            <Plus className="mr-2 h-4 w-4" />
            Log Mileage
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Mileage tracking coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
