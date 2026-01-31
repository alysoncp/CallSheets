import { z } from "zod";
import { ALL_EXPENSE_CATEGORIES } from "./expense-categories";

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  category: z.enum(ALL_EXPENSE_CATEGORIES as unknown as [string, ...string[]]),
  subcategory: z.string().optional(),
  vehicleId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().optional(),
  vendor: z.string().optional(),
  receiptImageUrl: z.string().url().optional().or(z.literal("")),
  isTaxDeductible: z.boolean().default(true),
  baseCost: z.coerce.number().nonnegative().optional(),
  gstAmount: z.coerce.number().nonnegative().default(0),
  pstAmount: z.coerce.number().nonnegative().default(0),
  expenseType: z.enum([
    "home_office_living",
    "vehicle",
    "self_employment",
    "personal",
    "mixed",
  ]),
  businessUsePercentage: z.coerce.number().min(0).max(100).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
