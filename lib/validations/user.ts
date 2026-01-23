import { z } from "zod";

export const userProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  taxFilingStatus: z.enum(["personal_only", "personal_and_corporate"]).optional(),
  province: z.string().optional(),
  userType: z.enum(["performer", "crew", "both"]).optional(),
  unionAffiliations: z.array(z.string()).optional(),
  hasAgent: z.boolean().optional(),
  agentName: z.string().optional(),
  agentCommission: z.coerce.number().min(0).max(100).optional(),
  hasBusinessNumber: z.boolean().optional(),
  businessNumber: z.string().optional(),
  hasGstNumber: z.boolean().optional(),
  gstNumber: z.string().optional(),
  usesPersonalVehicle: z.boolean().optional(),
  usesCorporateVehicle: z.boolean().optional(),
  hasRegularEmployment: z.boolean().optional(),
  hasHomeOffice: z.boolean().optional(),
  homeOfficePercentage: z.coerce.number().min(0).max(100).optional(),
  enabledExpenseCategories: z.array(z.string()).optional(),
  mileageLoggingStyle: z.enum(["trip_distance", "odometer"]).optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
