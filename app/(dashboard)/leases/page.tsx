import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function LeasesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Leases</h1>
        <Button asChild>
          <Link href="/leases/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Lease
          </Link>
        </Button>
      </div>
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Lease management coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
