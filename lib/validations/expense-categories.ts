export const EXPENSE_CATEGORIES = {
  SELF_EMPLOYMENT: [
    "advertising",
    "business_taxes",
    "commissions_agent_fees",
    "delivery_freight",
    "fuel_non_vehicle",
    "insurance",
    "licenses_memberships",
    "management_admin_fees",
    "meals_entertainment",
    "office_supplies",
    "professional_fees",
    "repairs_maintenance",
    "salaries_wages",
    "training",
    "travel_expenses",
  ],
  HOME_OFFICE_LIVING: [
    "rent",
    "utilities",
    "internet",
    "phone",
    "heat",
    "electricity",
    "insurance_home",
    "maintenance_home",
    "mortgage_interest",
    "property_taxes",
  ],
  VEHICLE: [
    "fuel_costs",
    "electric_vehicle_charging",
    "vehicle_insurance",
    "parking_tolls",
    "lease_payment",
    "vehicle_repairs",
  ],
  TAX_DEDUCTIBLE_PERSONAL: [
    "child_care_expenses",
    "medical_expenses",
    "charitable_donations",
    "moving_expenses",
    "student_loan_interest",
    "disability_supports",
    "investment_counsel_fees",
    "tuition",
  ],
  NON_DEDUCTIBLE_PERSONAL: [
    "personal_phone",
    "grocery",
    "entertainment",
    "dining_out",
    "clothing",
    "transportation",
    "insurance_personal",
    "health_fitness",
    "gifts",
    "household_supplies",
  ],
} as const;

export const ALL_EXPENSE_CATEGORIES = [
  ...EXPENSE_CATEGORIES.SELF_EMPLOYMENT,
  ...EXPENSE_CATEGORIES.HOME_OFFICE_LIVING,
  ...EXPENSE_CATEGORIES.VEHICLE,
  ...EXPENSE_CATEGORIES.TAX_DEDUCTIBLE_PERSONAL,
  ...EXPENSE_CATEGORIES.NON_DEDUCTIBLE_PERSONAL,
] as const;

export type ExpenseCategory = typeof ALL_EXPENSE_CATEGORIES[number];

export const INCOME_TYPES = [
  "union_production",
  "non_union_production",
  "royalty_residual",
  "cash",
] as const;

export type IncomeType = typeof INCOME_TYPES[number];

export const CCA_CLASSES = ["10", "10.1", "8", "12", "50", "45"] as const;

export type CcaClass = typeof CCA_CLASSES[number];

export const CCA_RATES: Record<CcaClass, number> = {
  "10": 30,
  "10.1": 30,
  "8": 20,
  "12": 100,
  "50": 55,
  "45": 45,
};
