import { z } from "zod";
import { INCOME_TYPES } from "./expense-categories";

/** Require a number (no blank) but allow zero. */
const requiredNum = (msg: string) =>
  z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0, msg);

export const paystubIssuerEnum = z.enum(["EP", "CC"]);
export type PaystubIssuer = z.infer<typeof paystubIssuerEnum>;

export const incomeSchema = z.object({
  amount: requiredNum("Amount is required"),
  date: z.string().min(1, "Date is required"),
  incomeType: z.enum(INCOME_TYPES),
  incomeCategory: z.string().optional(),
  grossPay: requiredNum("Gross income is required"),
  productionName: z.string().min(1, "Production name is required"),
  accountingOffice: z.string().optional(),
  employerName: z.string().optional(),
  businessName: z.string().optional(),
  description: z.string().optional(),
  paystubImageUrl: z.string().url().optional().or(z.literal("")),
  gstHstCollected: requiredNum("GST is required"),
  totalDeductions: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  reimbursements: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  paystubIssuer: paystubIssuerEnum.optional(),
  cppContribution: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  eiContribution: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  incomeTaxDeduction: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  dues: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  retirement: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  pension: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  insurance: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).default(0),
  agentCommissionAmount: z.coerce.number().refine((n) => !Number.isNaN(n) && n >= 0).optional(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
