"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SubscriptionUpgradeButtonProps {
  currentTier: string;
  targetTier: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SubscriptionUpgradeButton({
  currentTier,
  targetTier,
  disabled = false,
  children,
}: SubscriptionUpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (disabled || loading) return;

    setLoading(true);
    try {
      const response = await fetch("/api/subscription/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionTier: targetTier }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (currentTier === targetTier) {
    return (
      <Button disabled className="w-full">
        Current Plan
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={disabled || loading}
      className="w-full"
      variant="outline"
    >
      {loading ? "Updating..." : children}
    </Button>
  );
}
