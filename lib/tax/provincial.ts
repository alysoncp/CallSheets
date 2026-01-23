// BC provincial tax brackets (simplified - 2024 rates)
export const BC_TAX_BRACKETS = [
  { min: 0, max: 47937, rate: 0.0506 },
  { min: 47937, max: 95875, rate: 0.077 },
  { min: 95875, max: 110076, rate: 0.105 },
  { min: 110076, max: 133664, rate: 0.1229 },
  { min: 133664, max: 181232, rate: 0.147 },
  { min: 181232, max: 252752, rate: 0.168 },
  { min: 252752, max: Infinity, rate: 0.205 },
] as const;

export function calculateProvincialTax(taxableIncome: number, province: string = "BC"): number {
  if (taxableIncome <= 0) return 0;

  // For now, only BC is implemented
  if (province !== "BC") {
    // Return a placeholder - would need to implement other provinces
    return calculateProvincialTax(taxableIncome, "BC");
  }

  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of BC_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;

    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min
    );

    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}
