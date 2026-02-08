import { pgTable, uuid, text, timestamp, jsonb, boolean, numeric, date, varchar, integer } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  taxFilingStatus: text("tax_filing_status").$type<"personal_only" | "personal_and_corporate">().default("personal_only"),
  province: text("province").default("BC"),
  subscriptionTier: text("subscription_tier").$type<"basic" | "personal" | "corporate">().default("basic"),
  userType: text("user_type").$type<"performer" | "crew" | "both">(),
  unionAffiliations: jsonb("union_affiliations").$type<string[]>(),
  hasAgent: boolean("has_agent").default(false),
  agentName: text("agent_name"),
  agentCommission: numeric("agent_commission", { precision: 5, scale: 2 }),
  hasBusinessNumber: boolean("has_business_number").default(false),
  businessNumber: text("business_number"),
  hasGstNumber: boolean("has_gst_number").default(false),
  gstNumber: text("gst_number"),
  usesPersonalVehicle: boolean("uses_personal_vehicle").default(false),
  usesCorporateVehicle: boolean("uses_corporate_vehicle").default(false),
  hasRegularEmployment: boolean("has_regular_employment").default(false),
  hasHomeOffice: boolean("has_home_office").default(false),
  homeOfficePercentage: numeric("home_office_percentage", { precision: 5, scale: 2 }),
  enabledExpenseCategories: jsonb("enabled_expense_categories").$type<string[]>(),
  mileageLoggingStyle: text("mileage_logging_style").$type<"trip_distance" | "odometer">().default("trip_distance"),
  trackPersonalExpenses: boolean("track_personal_expenses").default(true),
  ubcpActraStatus: text("ubcp_actra_status").$type<"none" | "background" | "apprentice" | "full_member">().default("none"),
  iatseStatus: text("iatse_status").$type<"full" | "permittee" | "none">().default("none"),
  ocrRequestsThisMonth: integer("ocr_requests_this_month").default(0),
  lastOcrReset: timestamp("last_ocr_reset"),
  disclaimerAcceptedAt: timestamp("disclaimer_accepted_at", { withTimezone: true }),
  disclaimerVersion: text("disclaimer_version"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Income table
export const income = pgTable("income", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  incomeType: text("income_type").$type<"union_production" | "non_union_production" | "royalty_residual" | "cash">().notNull(),
  incomeCategory: text("income_category"),
  grossPay: numeric("gross_pay", { precision: 12, scale: 2 }),
  productionName: text("production_name"),
  accountingOffice: text("accounting_office"),
  employerName: text("employer_name"),
  businessName: text("business_name"),
  description: text("description"),
  paystubImageUrl: text("paystub_image_url"),
  gstHstCollected: numeric("gst_hst_collected", { precision: 12, scale: 2 }).default("0"),
  cppContribution: numeric("cpp_contribution", { precision: 12, scale: 2 }).default("0"),
  eiContribution: numeric("ei_contribution", { precision: 12, scale: 2 }).default("0"),
  incomeTaxDeduction: numeric("income_tax_deduction", { precision: 12, scale: 2 }).default("0"),
  dues: numeric("dues", { precision: 12, scale: 2 }).default("0"),
  retirement: numeric("retirement", { precision: 12, scale: 2 }).default("0"),
  pension: numeric("pension", { precision: 12, scale: 2 }).default("0"),
  insurance: numeric("insurance", { precision: 12, scale: 2 }).default("0"),
  agentCommissionAmount: numeric("agent_commission_amount", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  description: text("description"),
  vendor: text("vendor"),
  receiptImageUrl: text("receipt_image_url"),
  isTaxDeductible: boolean("is_tax_deductible").default(true),
  baseCost: numeric("base_cost", { precision: 12, scale: 2 }),
  gstAmount: numeric("gst_amount", { precision: 12, scale: 2 }).default("0"),
  pstAmount: numeric("pst_amount", { precision: 12, scale: 2 }).default("0"),
  expenseType: text("expense_type").$type<"home_office_living" | "vehicle" | "self_employment" | "personal" | "mixed">().notNull(),
  businessUsePercentage: numeric("business_use_percentage", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  licensePlate: text("license_plate"),
  isPrimary: boolean("is_primary").default(false),
  usedExclusivelyForBusiness: boolean("used_exclusively_for_business").default(false),
  claimsCca: boolean("claims_cca").default(false),
  ccaClass: text("cca_class").$type<"10" | "10.1">(),
  currentMileage: integer("current_mileage"),
  mileageAtBeginningOfYear: integer("mileage_at_beginning_of_year"),
  totalAnnualMileage: integer("total_annual_mileage"),
  estimatedYearlyMileage: integer("estimated_yearly_mileage"),
  mileageEstimate: boolean("mileage_estimate").default(false),
  purchasedThisYear: boolean("purchased_this_year").default(false),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vehicle mileage logs
export const vehicleMileageLogs = pgTable("vehicle_mileage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  odometerReading: integer("odometer_reading"),
  tripDistance: integer("trip_distance"),
  description: text("description"),
  isBusinessUse: boolean("is_business_use").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Odometer photos
export const odometerPhotos = pgTable("odometer_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  photoUrl: text("photo_url").notNull(),
  photoDate: date("photo_date").notNull(),
  mileage: integer("mileage"),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Assets table
export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  purchaseDate: date("purchase_date").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull(),
  purchaseGst: numeric("purchase_gst", { precision: 12, scale: 2 }).default("0"),
  purchasePst: numeric("purchase_pst", { precision: 12, scale: 2 }).default("0"),
  ccaClass: text("cca_class").$type<"10" | "10.1" | "8" | "12" | "50" | "45">().notNull(),
  businessUsePercentage: numeric("business_use_percentage", { precision: 5, scale: 2 }).default("100"),
  applyHalfYearRule: boolean("apply_half_year_rule").default(true),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  isActive: boolean("is_active").default(true),
  disposalDate: date("disposal_date"),
  disposalProceeds: numeric("disposal_proceeds", { precision: 12, scale: 2 }),
  disposalGst: numeric("disposal_gst", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Asset CCA history
export const assetCcaHistory = pgTable("asset_cca_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetId: uuid("asset_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  taxYear: integer("tax_year").notNull(),
  openingUcc: numeric("opening_ucc", { precision: 12, scale: 2 }).notNull(),
  additions: numeric("additions", { precision: 12, scale: 2 }).default("0"),
  dispositions: numeric("dispositions", { precision: 12, scale: 2 }).default("0"),
  ccaClaimed: numeric("cca_claimed", { precision: 12, scale: 2 }).default("0"),
  closingUcc: numeric("closing_ucc", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lease contracts
export const leaseContracts = pgTable("lease_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  leaseType: text("lease_type").$type<"vehicle" | "equipment">().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  lessorName: text("lessor_name"),
  leaseStartDate: date("lease_start_date").notNull(),
  leaseEndDate: date("lease_end_date").notNull(),
  monthlyPayment: numeric("monthly_payment", { precision: 12, scale: 2 }).notNull(),
  paymentFrequency: text("payment_frequency").$type<"monthly" | "quarterly" | "annual">().default("monthly"),
  businessUsePercentage: numeric("business_use_percentage", { precision: 5, scale: 2 }).default("100"),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
  assetCategory: text("asset_category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lease payments
export const leasePayments = pgTable("lease_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaseContractId: uuid("lease_contract_id").notNull().references(() => leaseContracts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentDate: date("payment_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  gstAmount: numeric("gst_amount", { precision: 12, scale: 2 }).default("0"),
  pstAmount: numeric("pst_amount", { precision: 12, scale: 2 }).default("0"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Receipts table
export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  linkedExpenseId: uuid("linked_expense_id").references(() => expenses.id, { onDelete: "set null" }),
  linkedIncomeId: uuid("linked_income_id").references(() => income.id, { onDelete: "set null" }),
  notes: text("notes"),
  ocrJobId: text("ocr_job_id"),
  ocrStatus: text("ocr_status").$type<"pending" | "processing" | "completed" | "failed">(),
  ocrResult: jsonb("ocr_result"),
  ocrProcessedAt: timestamp("ocr_processed_at"),
});

// Paystubs table
export const paystubs = pgTable("paystubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  linkedIncomeId: uuid("linked_income_id").references(() => income.id, { onDelete: "set null" }),
  notes: text("notes"),
  ocrJobId: text("ocr_job_id"),
  ocrStatus: text("ocr_status").$type<"pending" | "processing" | "completed" | "failed">(),
  ocrResult: jsonb("ocr_result"),
  ocrProcessedAt: timestamp("ocr_processed_at"),
});
