import { z } from "zod";

export const mileageLogSchema = z
  .object({
    vehicleId: z.string().uuid("Vehicle is required"),
    date: z.string().min(1, "Date is required"),
    odometerReading: z.coerce.number().int().nonnegative().optional().nullable(),
    tripDistance: z.coerce.number().int().nonnegative().optional().nullable(),
    description: z.string().optional(),
    isBusinessUse: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // At least one of odometerReading or tripDistance must be provided
      const hasOdometer = data.odometerReading !== undefined && data.odometerReading !== null && data.odometerReading > 0;
      const hasTripDistance = data.tripDistance !== undefined && data.tripDistance !== null && data.tripDistance > 0;
      return hasOdometer || hasTripDistance;
    },
    {
      message: "Either odometer reading or trip distance must be provided",
      path: ["odometerReading"],
    }
  );

export type MileageLogFormData = z.infer<typeof mileageLogSchema>;
