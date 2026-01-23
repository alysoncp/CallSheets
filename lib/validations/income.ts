import { z } from "zod";
import { INCOME_TYPES } from "./expense-categories";

export const incomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  incomeType: z.enum(INCOME_TYPES),
  incomeCategory: z.string().optional(),
  grossPay: z.coerce.number().nonnegative().optional(),
  productionName: z.string().optional(),
  accountingOffice: z.string().optional(),
  employerName: z.string().optional(),
  businessName: z.string().optional(),
  description: z.string().optional(),
  paystubImageUrl: z.string().url().optional().or(z.literal("")),
  gstHstCollected: z.coerce.number().nonnegative().default(0),
  cppContribution: z.coerce.number().nonnegative().default(0),
  eiContribution: z.coerce.number().nonnegative().default(0),
  incomeTaxDeduction: z.coerce.number().nonnegative().default(0),
  dues: z.coerce.number().nonnegative().default(0),
  retirement: z.coerce.number().nonnegative().default(0),
  pension: z.coerce.number().nonnegative().default(0),
  insurance: z.coerce.number().nonnegative().default(0),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
