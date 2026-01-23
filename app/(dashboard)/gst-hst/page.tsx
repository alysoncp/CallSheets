import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function GstHstPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">GST/HST Summary</h1>
      <Card>
        <CardHeader>
          <CardTitle>GST/HST Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">GST/HST summary coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
