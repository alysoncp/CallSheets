import { z } from "zod";
import { INCOME_TYPES } from "./expense-categories";

export const paystubIssuerEnum = z.enum(["EP", "CC"]);
export type PaystubIssuer = z.infer<typeof paystubIssuerEnum>;

export const incomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  incomeType: z.enum(INCOME_TYPES),
  incomeCategory: z.string().optional(),
  grossPay: z.coerce.number().nonnegative("Gross income is required"),
  productionName: z.string().min(1, "Production name is required"),
  accountingOffice: z.string().optional(),
  employerName: z.string().optional(),
  businessName: z.string().optional(),
  description: z.string().optional(),
  paystubImageUrl: z.string().url().optional().or(z.literal("")),
  gstHstCollected: z.coerce.number().nonnegative("GST is required"),
  totalDeductions: z.coerce.number().nonnegative().default(0),
  reimbursements: z.coerce.number().nonnegative().default(0),
  paystubIssuer: paystubIssuerEnum.optional(),
  cppContribution: z.coerce.number().nonnegative().default(0),
  eiContribution: z.coerce.number().nonnegative().default(0),
  incomeTaxDeduction: z.coerce.number().nonnegative().default(0),
  dues: z.coerce.number().nonnegative().default(0),
  retirement: z.coerce.number().nonnegative().default(0),
  pension: z.coerce.number().nonnegative().default(0),
  insurance: z.coerce.number().nonnegative().default(0),
  agentCommissionAmount: z.coerce.number().nonnegative().optional(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
