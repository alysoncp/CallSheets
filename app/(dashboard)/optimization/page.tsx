import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function OptimizationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dividend vs. Salary Optimization</h1>
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Optimization tool coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
