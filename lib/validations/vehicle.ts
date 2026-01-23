import { z } from "zod";
import { CCA_CLASSES } from "./expense-categories";

export const vehicleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  licensePlate: z.string().optional(),
  isPrimary: z.boolean().default(false),
  usedExclusivelyForBusiness: z.boolean().default(false),
  claimsCca: z.boolean().default(false),
  ccaClass: z.enum(CCA_CLASSES as [string, ...string[]]).optional(),
  currentMileage: z.coerce.number().int().nonnegative().optional(),
  mileageAtBeginningOfYear: z.coerce.number().int().nonnegative().optional(),
  totalAnnualMileage: z.coerce.number().int().nonnegative().optional(),
  estimatedYearlyMileage: z.coerce.number().int().nonnegative().optional(),
  mileageEstimate: z.boolean().default(false),
  purchasedThisYear: z.boolean().default(false),
  purchasePrice: z.coerce.number().nonnegative().optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
