import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { getOcrLimit } from "@/lib/utils/subscription";
import type { SubscriptionTier } from "@/lib/utils/subscription";

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const [userProfile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!userProfile) {
    redirect("/profile?setup=true");
  }

  const subscriptionTier: SubscriptionTier = userProfile.subscriptionTier || "basic";

  const getTierName = (tier: SubscriptionTier) => {
    switch (tier) {
      case "basic":
        return "Basic";
      case "personal":
        return "Personal";
      case "corporate":
        return "Corporate";
      default:
        return "Basic";
    }
  };

  const getTierPrice = (tier: SubscriptionTier) => {
    switch (tier) {
      case "basic":
        return "$0";
      case "personal":
        return "$9.99";
      case "corporate":
        return "$24.99";
      default:
        return "$0";
    }
  };

  const getTierFeatures = (tier: SubscriptionTier) => {
    switch (tier) {
      case "basic":
        return [
          "Income/expense tracking",
          "Receipt/paystub upload",
          `${getOcrLimit(tier)} OCR requests/month`,
          "Basic dashboard",
        ];
      case "personal":
        return [
          "All Basic features",
          "Vehicle mileage tracking",
          "Tax calculator",
          "Asset/CCA tracking",
          "Lease management",
          `${getOcrLimit(tier)} OCR requests/month`,
        ];
      case "corporate":
        return [
          "All Personal features",
          "Unlimited OCR requests",
          "Advanced reporting",
          "Corporate tax features",
          "Dividend vs. Salary optimization",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and view your current plan details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold">{getTierName(subscriptionTier)}</h3>
              <span className="text-3xl font-bold">
                {getTierPrice(subscriptionTier)}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </span>
            </div>
            <ul className="space-y-3 mt-6">
              {getTierFeatures(subscriptionTier).map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upgrade or Change Plan</CardTitle>
          <CardDescription>
            View all available plans and upgrade or downgrade your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/pricing">
              View Pricing Plans
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Manage your billing and payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Billing management will be available soon. For now, please contact support for any billing inquiries.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
