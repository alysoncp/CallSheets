import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ExternalLink, ArrowLeft } from "lucide-react";
import { getOcrLimit } from "@/lib/utils/subscription";
import type { SubscriptionTier } from "@/lib/utils/subscription";
import { SubscriptionUpgradeButton } from "@/components/subscription/subscription-upgrade-button";

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and view your current plan details
          </p>
        </div>
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
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            View all available subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Basic Plan - Greyed out */}
            <Card className={subscriptionTier === "basic" ? "border-primary" : "opacity-50"}>
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <CardDescription>Free</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-6">$0<span className="text-lg font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Income/expense tracking</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Receipt/paystub upload</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>10 OCR requests/month</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Basic dashboard</span>
                  </li>
                </ul>
                <Button disabled className="w-full" variant="outline">
                  Not Available
                </Button>
              </CardContent>
            </Card>

            {/* Personal Plan - Free during beta */}
            <Card className={subscriptionTier === "personal" ? "border-primary border-2" : ""}>
              <CardHeader>
                <CardTitle>Personal</CardTitle>
                <CardDescription>Most Popular - Free during beta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                  <span className="line-through text-muted-foreground">$9.99</span>
                  <span className="ml-2">Free</span>
                  <span className="text-lg font-normal">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Free during beta period</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>All Basic features</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Vehicle mileage tracking</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Tax calculator</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Asset/CCA tracking</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Lease management</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>100 OCR requests/month</span>
                  </li>
                </ul>
                <SubscriptionUpgradeButton
                  currentTier={subscriptionTier}
                  targetTier="personal"
                >
                  Select (Beta: Free)
                </SubscriptionUpgradeButton>
              </CardContent>
            </Card>

            {/* Corporate Plan - Coming soon */}
            <Card className={subscriptionTier === "corporate" ? "border-primary" : "opacity-50"}>
              <CardHeader>
                <CardTitle>Corporate</CardTitle>
                <CardDescription>Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-6">$24.99<span className="text-lg font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>All Personal features</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Unlimited OCR requests</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Advanced reporting</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Corporate tax features</span>
                  </li>
                </ul>
                <Button disabled className="w-full" variant="outline">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
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
