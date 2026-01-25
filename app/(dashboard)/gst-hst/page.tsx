import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GstHstPageClient } from "@/components/gst-hst/gst-hst-page-client";

export default async function GstHstPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return <GstHstPageClient />;
}
