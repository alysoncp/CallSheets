import { users } from "@/lib/db/schema";

type UserProfile = typeof users.$inferSelect;

/**
 * Checks if a user profile is complete based on required fields
 * Required fields: firstName, lastName, userType, province, taxFilingStatus, hasAgent, hasGstNumber
 */
export function isProfileComplete(profile: UserProfile | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  // Check required fields
  const hasRequiredFields =
    profile.firstName &&
    profile.lastName &&
    profile.userType &&
    profile.province &&
    profile.taxFilingStatus &&
    profile.hasAgent !== null &&
    profile.hasAgent !== undefined &&
    profile.hasGstNumber !== null &&
    profile.hasGstNumber !== undefined;

  if (!hasRequiredFields) {
    return false;
  }

  // If hasAgent is true, agentName must be provided
  if (profile.hasAgent && !profile.agentName) {
    return false;
  }

  return true;
}
