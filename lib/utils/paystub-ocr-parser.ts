/**
 * Utility functions to parse OCR text from paystubs
 * Handles both Entertainment Partners (EP) and Cast and Crew (CC) paystub formats
 */

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
}

/**
 * Identify the paystub issuer type by scanning OCR text
 */
function identifyIssuerType(ocrText: string): "EP" | "CC" | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const firstLines = upperText.split('\n').slice(0, 50).join('\n');

  // Check for Entertainment Partners indicators
  if (
    firstLines.includes("ENTERTAINMENT PARTNERS") ||
    firstLines.includes("ENTERTAINMENTPARTNERS") ||
    (firstLines.includes("EP") && firstLines.includes("PAYROLL"))
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
    /G\/HST\s*\(P\)[:\s]*\$?[\s]*(\d+\.?\d*)/i,
    /GST\/HST[:\s]*\$?[\s]*(\d+\.?\d*)/i,
    /G\/?HST[:\s]*\$?[\s]*(\d+\.?\d*)/i,
  ];

  for (const gstPattern of patterns) {
    const match = upperText.match(gstPattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1]);
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
  const gstPattern = /GST\/?HST[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const match = upperText.match(gstPattern);

  if (match && match[1]) {
    const amount = parseFloat(match[1]);
    if (!isNaN(amount) && amount >= 0) {
      return amount;
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
  const grossPayPattern = /GROSS\s+PAY[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const match = upperText.match(grossPayPattern);

  if (match && match[1]) {
    const amount = parseFloat(match[1]);
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
  const grossPayPattern = /GROSS\s+PAY[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const grossMatch = upperText.match(grossPayPattern);
  const grossPay = grossMatch && grossMatch[1] ? parseFloat(grossMatch[1]) : 0;
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
 * Looks for "NET PAY" pattern (works for both EP and CC)
 */
function extractNetIncome(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const netPayPattern = /NET\s+PAY[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const match = upperText.match(netPayPattern);

  if (match && match[1]) {
    const amount = parseFloat(match[1]);
    if (!isNaN(amount) && amount > 0) {
      return amount;
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
  const deductionsPattern = /TOTAL\s+DEDUCTIONS?[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const match = upperText.match(deductionsPattern);

  if (match && match[1]) {
    const amount = parseFloat(match[1]);
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
  const deductionsPattern = /DEDUCTIONS?[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const match = upperText.match(deductionsPattern);

  if (match && match[1]) {
    const amount = parseFloat(match[1]);
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
  const reimbursementPattern = /REIMBURSEMENTS?[:\s]*\$?[\s]*(\d+\.?\d*)/i;
  const match = upperText.match(reimbursementPattern);

  if (match && match[1]) {
    const amount = parseFloat(match[1]);
    if (!isNaN(amount) && amount >= 0) {
      return amount;
    }
  }

  return undefined;
}

/**
 * Extract production name from EP paystub
 * Looks for "SHOW" pattern
 */
function extractEPProductionName(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const showPattern = /SHOW[:\s]+(.+?)(?:\n|$)/i;
  const match = upperText.match(showPattern);

  if (match && match[1]) {
    return match[1].trim();
  }

  return undefined;
}

/**
 * Extract production name from CC paystub
 * Looks for "CONTROLLING EMPLOYER" pattern
 */
function extractCCProductionName(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  const upperText = ocrText.toUpperCase();
  const employerPattern = /CONTROLLING\s+EMPLOYER[:\s]+(.+?)(?:\n|$)/i;
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
    result.gst = extractEPGst(ocrText);
    result.grossPayRaw = extractEPGrossPayRaw(ocrText);
    result.grossIncome = extractEPGrossIncome(ocrText, result.gst || 0);
    result.netIncome = extractNetIncome(ocrText);
    result.deductions = extractEPDeductions(ocrText);
    result.productionName = extractEPProductionName(ocrText);
  } else if (result.issuerType === "CC") {
    // Parse CC paystub
    result.date = extractCCDate(ocrText);
    result.gst = extractCCGst(ocrText);
    result.grossPayRaw = extractCCGrossPayRaw(ocrText);
    result.grossIncome = extractCCGrossIncome(ocrText);
    result.netIncome = extractNetIncome(ocrText);
    result.deductions = extractCCDeductions(ocrText);
    result.reimbursements = extractCCReimbursements(ocrText);
    result.productionName = extractCCProductionName(ocrText);
  } else {
    // Unknown issuer type, try generic patterns
    result.date = extractEPDate(ocrText) || extractCCDate(ocrText);
    result.gst = extractEPGst(ocrText) || extractCCGst(ocrText);
    result.grossIncome = extractEPGrossIncome(ocrText, result.gst || 0) || extractCCGrossIncome(ocrText);
    result.netIncome = extractNetIncome(ocrText);
    result.deductions = extractEPDeductions(ocrText) || extractCCDeductions(ocrText);
    result.productionName = extractEPProductionName(ocrText) || extractCCProductionName(ocrText);
  }

  // Fallback to structured data if OCR parsing didn't find values
  if (!result.date && (ocrData?.date || ocrData?.pay_period)) {
    result.date = ocrData.date || ocrData.pay_period;
  }
  if (!result.gst && (ocrData?.tax || ocrData?.gst)) {
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
