/**
 * Utility functions to parse OCR text from paystubs
 * Handles both Entertainment Partners (EP) and Cast and Crew (CC) paystub formats
 */

/** Parse amount string (handles commas e.g. "12,573.32") */
function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ""));
}

export interface ParsedPaystubData {
  issuerType?: "EP" | "CC";
  date?: string;
  gst?: number;
  grossIncome?: number;
  /** Raw gross pay from stub (EP only); form uses this for entry, stores grossIncome = grossPay - gst */
  grossPayRaw?: number;
  netIncome?: number;
  deductions?: number;
  reimbursements?: number;
  productionName?: string;
  /** Optional union deduction fields */
  insurance?: number;
  dues?: number;
  pension?: number;
  retirement?: number;
}

/**
 * Identify the paystub issuer type by scanning OCR text
 */
function identifyIssuerType(ocrText: string): "EP" | "CC" | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const firstLines = upperText.split('\n').slice(0, 50).join('\n');

  // Check for Entertainment Partners indicators (OCR often splits "Entertainment" and "ep Partners")
  if (
    firstLines.includes("ENTERTAINMENT PARTNERS") ||
    firstLines.includes("ENTERTAINMENTPARTNERS") ||
    (firstLines.includes("EP") && firstLines.includes("PAYROLL")) ||
    firstLines.includes("EP PARTNERS") ||
    (firstLines.includes("ENTERTAINMENT") && firstLines.includes("PARTNERS")) ||
    firstLines.includes("TIME REPORT SUMMARY") ||
    (firstLines.includes("PERIOD ENDING") && !firstLines.includes("PAY PERIOD"))
  ) {
    return "EP";
  }

  // Check for Cast and Crew indicators
  if (
    firstLines.includes("CAST AND CREW") ||
    firstLines.includes("CASTANDCREW") ||
    (firstLines.includes("CC") && firstLines.includes("PAYROLL"))
  ) {
    return "CC";
  }

  return undefined;
}

/**
 * Extract date from EP paystub
 * Looks for "PERIOD ENDING" pattern
 */
function extractEPDate(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const periodEndingPattern = /PERIOD\s+ENDING[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
  const match = upperText.match(periodEndingPattern);

  if (match && match[1]) {
    try {
      const dateStr = match[1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Continue
    }
  }

  return undefined;
}

/**
 * Extract date from CC paystub
 * Looks for "PAY PERIOD:" pattern
 */
function extractCCDate(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const payPeriodPattern = /PAY\s+PERIOD[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
  const match = upperText.match(payPeriodPattern);

  if (match && match[1]) {
    try {
      const dateStr = match[1];
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Continue
    }
  }

  return undefined;
}

/**
 * Extract GST from EP paystub
 * Looks for "G/HST", "G/HST (P)", or "GST/HST" patterns
 */
function extractEPGst(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const patterns = [
    /G\/HST\s*\(P\)[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /GST\/HST[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /G\/?HST[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
  ];

  for (const gstPattern of patterns) {
    const match = upperText.match(gstPattern);
    if (match && match[1]) {
      const amount = parseAmount(match[1]);
      if (!isNaN(amount) && amount >= 0) {
        return amount;
      }
    }
  }

  return undefined;
}

/**
 * Extract GST from CC paystub
 * Looks for "GST/HST:" pattern
 */
function extractCCGst(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const patterns = [
    // GST/HST: 12.34 or GST HST $12.34
    /\bGST\s*\/?\s*HST[:\s]+\$?\s*([\d,]+(?:\.\d{2})?)\b/i,
    // G.S.T. 12.34
    /\bG\.?\s*S\.?\s*T\.?[:\s]+\$?\s*([\d,]+(?:\.\d{2})?)\b/i,
  ];

  for (const gstPattern of patterns) {
    const match = upperText.match(gstPattern);
    if (match && match[1]) {
      const amount = parseAmount(match[1]);
      if (!isNaN(amount) && amount >= 0) {
        return amount;
      }
    }
  }

  return undefined;
}

/**
 * Extract raw gross pay from EP paystub (for form display)
 * Looks for "GROSS PAY" pattern
 */
function extractEPGrossPayRaw(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const grossPayPattern = /GROSS\s+PAY[:\s]*\$?[\s]*([\d,]+\.?\d*)/i;
  const match = upperText.match(grossPayPattern);

  if (match && match[1]) {
    const amount = parseAmount(match[1]);
    if (!isNaN(amount) && amount >= 0) {
      return amount;
    }
  }

  return undefined;
}

/**
 * Extract gross income from EP paystub (Gross Pay - GST, for storage)
 * Looks for "GROSS PAY" and subtracts GST
 */
function extractEPGrossIncome(ocrText: string, gst: number = 0): number | undefined {
  const raw = extractEPGrossPayRaw(ocrText);
  if (raw === undefined) return undefined;
  return Math.max(0, raw - gst);
}

/**
 * Extract raw gross pay from CC paystub (for form display)
 */
function extractCCGrossPayRaw(ocrText: string): number | undefined {
  if (!ocrText) return undefined;
  const upperText = ocrText.toUpperCase();
  const grossPayPattern = /GROSS\s+PAY[:\s]*\$?[\s]*([\d,]+\.?\d*)/i;
  const grossMatch = upperText.match(grossPayPattern);
  const grossPay = grossMatch && grossMatch[1] ? parseAmount(grossMatch[1]) : 0;
  return grossPay > 0 ? grossPay : undefined;
}

/**
 * Extract gross income from CC paystub (Gross Pay + Reimbursements, for storage)
 * Looks for "GROSS PAY:" and "REIMBURSEMENTS" and sums them
 */
function extractCCGrossIncome(ocrText: string): number | undefined {
  const grossPay = extractCCGrossPayRaw(ocrText) ?? 0;
  const reimbursements = extractCCReimbursements(ocrText) ?? 0;
  if (grossPay > 0 || reimbursements > 0) {
    return grossPay + reimbursements;
  }
  return undefined;
}

/**
 * Extract net income from paystub
 * Looks for "NET PAY" or "AMOUNT DEPOSITED" pattern (works for both EP and CC)
 */
function extractNetIncome(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const patterns = [
    /NET\s+PAY[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /AMOUNT\s+DEPOSITED[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
  ];
  for (const netPayPattern of patterns) {
    const match = upperText.match(netPayPattern);
    if (match && match[1]) {
      const amount = parseAmount(match[1]);
      if (!isNaN(amount) && amount >= 0) {
        return amount;
      }
    }
  }
  return undefined;
}

/**
 * Extract deductions from EP paystub
 * Looks for "TOTAL DEDUCTIONS" pattern
 */
function extractEPDeductions(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const deductionsPattern = /TOTAL\s+DEDUCTIONS?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i;
  const match = upperText.match(deductionsPattern);

  if (match && match[1]) {
    const amount = parseAmount(match[1]);
    if (!isNaN(amount) && amount >= 0) {
      return amount;
    }
  }

  return undefined;
}

/**
 * Extract deductions from CC paystub
 * Looks for "DEDUCTIONS:" pattern
 */
function extractCCDeductions(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const deductionsPattern = /DEDUCTIONS?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i;
  const match = upperText.match(deductionsPattern);

  if (match && match[1]) {
    const amount = parseAmount(match[1]);
    if (!isNaN(amount) && amount >= 0) {
      return amount;
    }
  }

  return undefined;
}

/**
 * Extract reimbursements from CC paystub
 * Looks for "REIMBURSEMENTS" pattern
 */
function extractCCReimbursements(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const reimbursementPattern = /REIMBURSEMENTS?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i;
  const match = upperText.match(reimbursementPattern);

  if (match && match[1]) {
    const amount = parseAmount(match[1]);
    if (!isNaN(amount) && amount >= 0) {
      return amount;
    }
  }

  return undefined;
}

/**
 * Extract optional deduction amounts from CC paystub
 * Labels: Ins. Ded (insurance), Member Fee / Permit Fee / Dues (dues), Retir. Emp (pension), Retire Ded / Retire Deduct (retirement)
 */
function extractCCOptionalDeductions(ocrText: string): {
  insurance?: number;
  dues?: number;
  pension?: number;
  retirement?: number;
} {
  const result: { insurance?: number; dues?: number; pension?: number; retirement?: number } = {};
  if (!ocrText) return result;
  const upperText = ocrText.toUpperCase();
  const patterns: { key: keyof typeof result; regex: RegExp }[] = [
    { key: "insurance", regex: /INS\.\s*DED[:\s]*\$?[\s]*([\d,]+\.?\d*)/i },
    { key: "dues", regex: /(?:MEMBER|PERMIT)\s+FEE[:\s]*\$?[\s]*([\d,]+\.?\d*)/i },
    { key: "dues", regex: /\bDUES[:\s]*\$?[\s]*([\d,]+\.?\d*)/i },
    { key: "pension", regex: /RETIR\.\s+EMP[:\s]*\$?[\s]*([\d,]+\.?\d*)/i },
    { key: "retirement", regex: /RETIRE\s+DED(?:UCT)?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i },
  ];
  for (const { key, regex } of patterns) {
    const match = upperText.match(regex);
    if (match && match[1]) {
      const amount = parseAmount(match[1]);
      if (!isNaN(amount) && amount >= 0) result[key] = amount;
    }
  }
  return result;
}

/**
 * Extract optional deduction amounts from EP paystub
 * Labels: Insurance/Insure/Ins., Dues/Permit Fee/Member Fee, Pension/Retir. Emp, Retire/Retire Ded (retirement)
 * EP stubs use a DEDUCTIONS table: "DESC.\tCURRENT\tYEAR TO DATE" with rows like "Dues\t93.07\t137.5"
 */
function extractEPOptionalDeductions(ocrText: string): {
  insurance?: number;
  dues?: number;
  pension?: number;
  retirement?: number;
} {
  const result: { insurance?: number; dues?: number; pension?: number; retirement?: number } = {};
  if (!ocrText) return result;
  const upperText = ocrText.toUpperCase();
  // Restrict to DEDUCTIONS section so we don't match labels elsewhere (e.g. in headers)
  const deductionsIndex = upperText.indexOf("DEDUCTIONS");
  const searchText = deductionsIndex >= 0 ? upperText.slice(deductionsIndex) : upperText;

  // Insurance: EP stubs use "Insure" as label; also Ins. Ded, Insurance (table row: "Insure\t12.34")
  const insPatterns = [
    /\bINSURE\b[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /INS\.\s*DED[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /INSURE?(?:ANCE)?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /\bINS\.?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
  ];
  for (const re of insPatterns) {
    const m = searchText.match(re);
    if (m?.[1]) {
      const amount = parseAmount(m[1]);
      if (!isNaN(amount) && amount >= 0) {
        result.insurance = amount;
        break;
      }
    }
  }

  // Dues: Dues, Permit Fee, Member Fee (table row: "Dues\t93.07\t137.5")
  const duesPatterns = [
    /\bDUES[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /\bPERMIT\s+FEE[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /\bMEMBER\s+FEE[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
  ];
  for (const re of duesPatterns) {
    const m = searchText.match(re);
    if (m?.[1]) {
      const amount = parseAmount(m[1]);
      if (!isNaN(amount) && amount >= 0) {
        result.dues = amount;
        break;
      }
    }
  }

  // Pension: Pension, Retir. Emp (table row)
  const pensionPatterns = [
    /\bPENSION[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /\bRETIR\.\s+EMP[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
  ];
  for (const re of pensionPatterns) {
    const m = searchText.match(re);
    if (m?.[1]) {
      const amount = parseAmount(m[1]);
      if (!isNaN(amount) && amount >= 0) {
        result.pension = amount;
        break;
      }
    }
  }

  // Retirement: Retire Ded, Retire Deduct, Retire (table row: "Retire\t50.00")
  const retirePatterns = [
    /\bRETIRE\s+DED(?:UCT)?[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
    /\bRETIRE[:\s]*\$?[\s]*([\d,]+\.?\d*)/i,
  ];
  for (const re of retirePatterns) {
    const m = searchText.match(re);
    if (m?.[1]) {
      const amount = parseAmount(m[1]);
      if (!isNaN(amount) && amount >= 0) {
        result.retirement = amount;
        break;
      }
    }
  }

  return result;
}

/**
 * Extract production name from EP paystub
 * Looks for "SHOW" pattern
 */
function extractEPProductionName(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const showPattern = /SHOW[:\s]+(.+?)(?=UNION:|\n|$)/i;
  const match = upperText.match(showPattern);

  if (match && match[1]) {
    return match[1].trim();
  }

  return undefined;
}

/**
 * Extract production name from CC paystub
 * Looks for "CONTROLLING EMPLOYER" pattern; stops at "Resident of British"
 */
function extractCCProductionName(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const employerPattern = /CONTROLLING\s+EMPLOYER[:\s]+(.+?)(?=RESIDENT\s+OF\s+BRITISH|\n|$)/i;
  const match = upperText.match(employerPattern);

  if (match && match[1]) {
    return match[1].trim();
  }

  return undefined;
}

/**
 * Parse paystub OCR text to extract structured data
 * @param ocrText The raw OCR text from Veryfi
 * @param ocrData The structured data from Veryfi (may be incomplete)
 * @returns Parsed paystub data
 */
export function parsePaystubOcr(
  ocrText: string | undefined | null,
  ocrData: any
): ParsedPaystubData {
  const result: ParsedPaystubData = {};

  if (!ocrText) {
    // Fallback to structured data if no OCR text
    result.date = ocrData?.date || ocrData?.pay_period;
    result.gst = ocrData?.tax || ocrData?.gst;
    result.grossIncome = ocrData?.gross_pay || ocrData?.gross || ocrData?.total;
    result.netIncome = ocrData?.net_pay || ocrData?.net;
    result.deductions = ocrData?.deductions?.total || 
      (ocrData?.deductions ? 
        (ocrData.deductions.cpp || 0) + 
        (ocrData.deductions.ei || 0) + 
        (ocrData.deductions.income_tax || 0) : 
        undefined);
    result.productionName = ocrData?.employer?.name || ocrData?.employer?.raw_name || ocrData?.company_name;
    return result;
  }

  // Identify issuer type
  result.issuerType = identifyIssuerType(ocrText);

  if (result.issuerType === "EP") {
    // Parse EP paystub
    result.date = extractEPDate(ocrText);
    // EP stubs may omit GST entirely; default to 0 instead of noisy fallback values.
    result.gst = extractEPGst(ocrText) ?? 0;
    result.grossPayRaw = extractEPGrossPayRaw(ocrText);
    result.grossIncome = extractEPGrossIncome(ocrText, result.gst || 0);
    result.netIncome = extractNetIncome(ocrText);
    result.deductions = extractEPDeductions(ocrText);
    result.productionName = extractEPProductionName(ocrText);
    const epOptional = extractEPOptionalDeductions(ocrText);
    if (epOptional.insurance !== undefined) result.insurance = epOptional.insurance;
    if (epOptional.dues !== undefined) result.dues = epOptional.dues;
    if (epOptional.pension !== undefined) result.pension = epOptional.pension;
    if (epOptional.retirement !== undefined) result.retirement = epOptional.retirement;
  } else if (result.issuerType === "CC") {
    // Parse CC paystub
    result.date = extractCCDate(ocrText);
    // CC stubs may omit GST entirely; default to 0 instead of noisy fallback values.
    result.gst = extractCCGst(ocrText) ?? 0;
    result.grossPayRaw = extractCCGrossPayRaw(ocrText);
    result.grossIncome = extractCCGrossIncome(ocrText);
    result.netIncome = extractNetIncome(ocrText);
    result.deductions = extractCCDeductions(ocrText);
    result.reimbursements = extractCCReimbursements(ocrText);
    result.productionName = extractCCProductionName(ocrText);
    const ccOptional = extractCCOptionalDeductions(ocrText);
    if (ccOptional.insurance !== undefined) result.insurance = ccOptional.insurance;
    if (ccOptional.dues !== undefined) result.dues = ccOptional.dues;
    if (ccOptional.pension !== undefined) result.pension = ccOptional.pension;
    if (ccOptional.retirement !== undefined) result.retirement = ccOptional.retirement;
  } else {
    // Unknown issuer type, try generic patterns and both EP/CC optional deductions
    result.date = extractEPDate(ocrText) || extractCCDate(ocrText);
    result.gst = extractEPGst(ocrText) || extractCCGst(ocrText);
    result.grossIncome = extractEPGrossIncome(ocrText, result.gst || 0) || extractCCGrossIncome(ocrText);
    result.netIncome = extractNetIncome(ocrText);
    result.deductions = extractEPDeductions(ocrText) || extractCCDeductions(ocrText);
    result.productionName = extractEPProductionName(ocrText) || extractCCProductionName(ocrText);
    // Still extract optional fields (retire, insurance, dues, pension) from either format
    const epOptional = extractEPOptionalDeductions(ocrText);
    const ccOptional = extractCCOptionalDeductions(ocrText);
    if (epOptional.insurance !== undefined) result.insurance = epOptional.insurance;
    if (epOptional.dues !== undefined) result.dues = epOptional.dues;
    if (epOptional.pension !== undefined) result.pension = epOptional.pension;
    if (epOptional.retirement !== undefined) result.retirement = epOptional.retirement;
    if (ccOptional.insurance !== undefined) result.insurance = ccOptional.insurance;
    if (ccOptional.dues !== undefined) result.dues = ccOptional.dues;
    if (ccOptional.pension !== undefined) result.pension = ccOptional.pension;
    if (ccOptional.retirement !== undefined) result.retirement = ccOptional.retirement;
  }

  // Fallback to structured data if OCR parsing didn't find values
  if (!result.date && (ocrData?.date || ocrData?.pay_period)) {
    result.date = ocrData.date || ocrData.pay_period;
  }
  if (result.gst === undefined && (ocrData?.tax || ocrData?.gst)) {
    result.gst = ocrData.tax || ocrData.gst;
  }
  if (!result.grossIncome && (ocrData?.gross_pay || ocrData?.gross || ocrData?.total)) {
    result.grossIncome = ocrData.gross_pay || ocrData.gross || ocrData.total;
  }
  if (!result.netIncome && (ocrData?.net_pay || ocrData?.net)) {
    result.netIncome = ocrData.net_pay || ocrData.net;
  }
  if (!result.deductions && ocrData?.deductions) {
    result.deductions = ocrData.deductions.total || 
      (ocrData.deductions.cpp || 0) + 
      (ocrData.deductions.ei || 0) + 
      (ocrData.deductions.income_tax || 0);
  }
  if (!result.productionName && (ocrData?.employer?.name || ocrData?.employer?.raw_name || ocrData?.company_name)) {
    result.productionName = ocrData.employer?.name || ocrData.employer?.raw_name || ocrData.company_name;
  }

  return result;
}
