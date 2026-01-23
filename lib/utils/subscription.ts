// Subscription tier utilities

export type SubscriptionTier = "basic" | "personal" | "corporate";

export function canAccessFeature(
  tier: SubscriptionTier,
  feature: "vehicles" | "tax_calculator" | "assets_cca" | "optimization"
): boolean {
  switch (feature) {
    case "vehicles":
    case "tax_calculator":
    case "assets_cca":
    case "optimization":
      return tier === "personal" || tier === "corporate";
    default:
      return false;
  }
}

export function getOcrLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case "basic":
      return 10;
    case "personal":
      return 100;
    case "corporate":
      return Infinity;
    default:
      return 0;
  }
}
