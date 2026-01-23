"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { getOcrLimit } from "@/lib/utils/subscription";
import type { SubscriptionTier } from "@/lib/utils/subscription";

interface SubscriptionSectionProps {
  subscriptionTier: SubscriptionTier;
}

export function SubscriptionSection({ subscriptionTier }: SubscriptionSectionProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Your current subscription plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{getTierName(subscriptionTier)}</h3>
            <span className="text-2xl font-bold">
              {getTierPrice(subscriptionTier)}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </span>
          </div>
          <ul className="space-y-2 mt-4">
            {getTierFeatures(subscriptionTier).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/subscription">
            Manage Subscription
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
