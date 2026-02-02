import { z } from "zod";

export const userProfileSchema = z
  .object({
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    profileImageUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
    taxFilingStatus: z.enum(["personal_only", "personal_and_corporate"]).nullish(),
    province: z.string().nullish(),
    userType: z.enum(["performer", "crew", "both"]).nullish(),
    unionAffiliations: z.array(z.string()).nullish(),
    hasAgent: z.boolean().nullish(),
    agentName: z.string().nullish(),
    agentCommission: z.coerce.number().min(0).max(100).nullish(),
    hasBusinessNumber: z.boolean().nullish(),
    businessNumber: z.string().nullish(),
    hasGstNumber: z.boolean().nullish(),
    usesPersonalVehicle: z.boolean().nullish(),
    usesCorporateVehicle: z.boolean().nullish(),
    hasRegularEmployment: z.boolean().nullish(),
    hasHomeOffice: z.boolean().nullish(),
    homeOfficePercentage: z.coerce.number().min(0).max(100).nullish(),
    enabledExpenseCategories: z.array(z.string()).nullish(),
    mileageLoggingStyle: z.enum(["trip_distance", "odometer"]).nullish(),
    trackPersonalExpenses: z.boolean().nullish(),
    ubcpActraStatus: z.enum(["none", "background", "apprentice", "full_member"]).nullish(),
    iatseStatus: z.enum(["full", "permittee", "none"]).nullish(),
  })
  .refine(
    (data) => {
      // If hasAgent is true, agentName must be provided
      if (data.hasAgent === true) {
        return !!data.agentName && data.agentName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Agent name is required when you have an agent",
      path: ["agentName"],
    }
  );

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
