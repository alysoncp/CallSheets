import { calculateFederalTax } from "./federal";
import { calculateProvincialTax } from "./provincial";
import { calculateCPP } from "./cpp";

export const BASIC_PERSONAL_AMOUNT = 15000;

export interface TaxCalculationInput {
  grossIncome: number;
  totalExpenses: number;
  ccaDeductions: number;
  province: string;
  isSelfEmployed: boolean;
}

export interface TaxCalculationResult {
  grossIncome: number;
  totalExpenses: number;
  netIncome: number;
  taxableIncome: number;
  federalTax: number;
  provincialTax: number;
  cppContribution: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
}

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const netIncome = input.grossIncome - input.totalExpenses - input.ccaDeductions;
  const taxableIncome = Math.max(0, netIncome - BASIC_PERSONAL_AMOUNT);

  const federalTax = calculateFederalTax(taxableIncome);
  const provincialTax = calculateProvincialTax(taxableIncome, input.province);
  const cppContribution = calculateCPP(netIncome, input.isSelfEmployed);

  const totalTax = federalTax + provincialTax + cppContribution;
  const afterTaxIncome = netIncome - totalTax;
  const effectiveTaxRate = netIncome > 0 ? (totalTax / netIncome) * 100 : 0;

  // Calculate marginal tax rate (highest bracket)
  let marginalRate = 0;
  if (taxableIncome > 246752) {
    marginalRate = 0.33 + 0.205; // Federal + BC highest
  } else if (taxableIncome > 173205) {
    marginalRate = 0.29 + 0.168;
  } else if (taxableIncome > 111733) {
    marginalRate = 0.26 + 0.147;
  } else if (taxableIncome > 55867) {
    marginalRate = 0.205 + 0.077;
  } else {
    marginalRate = 0.15 + 0.0506;
  }

  return {
    grossIncome: input.grossIncome,
    totalExpenses: input.totalExpenses,
    netIncome,
    taxableIncome,
    federalTax,
    provincialTax,
    cppContribution,
    totalTax,
    afterTaxIncome,
    effectiveTaxRate,
    marginalTaxRate: marginalRate * 100,
  };
}
