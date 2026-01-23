// CPP contribution rates and limits for 2024
export const CPP_BASIC_EXEMPTION = 3500;
export const CPP_MAX_CONTRIBUTABLE_EARNINGS = 68500;
export const CPP_EMPLOYEE_RATE = 0.0595;
export const CPP_EMPLOYER_RATE = 0.0595;
export const CPP_SELF_EMPLOYED_RATE = 0.119; // Employee + Employer rate

export function calculateCPP(
  netIncome: number,
  isSelfEmployed: boolean = true
): number {
  const contributableEarnings = Math.max(
    0,
    Math.min(netIncome, CPP_MAX_CONTRIBUTABLE_EARNINGS) - CPP_BASIC_EXEMPTION
  );

  if (contributableEarnings <= 0) return 0;

  const rate = isSelfEmployed ? CPP_SELF_EMPLOYED_RATE : CPP_EMPLOYEE_RATE;
  return contributableEarnings * rate;
}
