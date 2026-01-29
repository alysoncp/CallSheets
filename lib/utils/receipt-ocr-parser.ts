/**
 * Utility functions to parse OCR text from receipts when structured data is not available
 */

/** Parse amount string (handles commas e.g. "12,573.32") */
function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ""));
}

export interface ParsedReceiptData {
  vendor?: string;
  date?: string;
  total?: number;
  gst?: number;
}

/**
 * Extract vendor name from OCR text
 * Looks for common patterns like store names, business names
 */
function extractVendor(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  // Look for common vendor patterns
  // Try to find text that looks like a business name (usually at the top)
  const lines = ocrText.split('\n').slice(0, 10); // Check first 10 lines
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip lines that are clearly not vendor names
    if (
      trimmed.length > 3 &&
      trimmed.length < 50 &&
      !trimmed.match(/^\d+/) && // Doesn't start with numbers
      !trimmed.match(/^\$/) && // Doesn't start with $
      !trimmed.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}/) && // Not a date
      !trimmed.match(/^TOTAL/i) &&
      !trimmed.match(/^SUB/i) &&
      !trimmed.match(/^GST/i) &&
      !trimmed.match(/^HST/i)
    ) {
      return trimmed;
    }
  }

  return undefined;
}

/**
 * Extract date from OCR text
 * Looks for common date patterns
 */
function extractDate(ocrText: string): string | undefined {
  if (!ocrText) return undefined;

  // Common date patterns
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/g, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/g, // YYYY-MM-DD
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/gi, // DD Mon YYYY
  ];

  for (const pattern of datePatterns) {
    const matches = ocrText.match(pattern);
    if (matches && matches.length > 0) {
      try {
        const dateStr = matches[0];
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          // Return in YYYY-MM-DD format
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }

  return undefined;
}

/**
 * Extract total amount from OCR text
 * Looks for currency patterns like $XX.XX, CAD XX.XX, etc.
 */
function extractTotal(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  // Look for patterns like "TOTAL", "AMOUNT DUE", "BALANCE", etc. followed by currency
  const totalPatterns = [
    /(?:TOTAL|AMOUNT|BALANCE|DUE|CHARGE)[\s:]*\$?[\s]*([\d,]+\.?\d*)/gi,
    /\$[\s]*([\d,]+\.?\d*)[\s]*(?:TOTAL|AMOUNT|BALANCE|DUE)?/gi,
    /(?:CAD|USD|C\$)[\s]*([\d,]+\.?\d*)/gi,
  ];

  // Also look for the largest currency amount (likely the total)
  const currencyPattern = /\$[\s]*([\d,]+\.?\d*)/g;
  const allAmounts: number[] = [];

  // First try specific total patterns
  for (const pattern of totalPatterns) {
    const matches = [...ocrText.matchAll(pattern)];
    for (const match of matches) {
      const amount = parseAmount(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // Fallback: find all currency amounts and return the largest
  const currencyMatches = [...ocrText.matchAll(currencyPattern)];
  for (const match of currencyMatches) {
    const amount = parseAmount(match[1]);
    if (!isNaN(amount) && amount > 0) {
      allAmounts.push(amount);
    }
  }

  if (allAmounts.length > 0) {
    // Return the largest amount (likely the total)
    return Math.max(...allAmounts);
  }

  return undefined;
}

/**
 * Extract GST/HST amount from OCR text
 * Looks for GST, HST, TAX patterns
 */
function extractGst(ocrText: string): number | undefined {
  if (!ocrText) return undefined;

  // Look for GST/HST patterns
  const gstPatterns = [
    /(?:GST|HST|G\/HST|TAX)[\s:]*\$?[\s]*([\d,]+\.?\d*)/gi,
    /\$[\s]*([\d,]+\.?\d*)[\s]*(?:GST|HST|G\/HST|TAX)/gi,
  ];

  for (const pattern of gstPatterns) {
    const matches = [...ocrText.matchAll(pattern)];
    for (const match of matches) {
      const amount = parseAmount(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  return undefined;
}

/**
 * Parse receipt OCR text to extract structured data
 * @param ocrText The raw OCR text from Veryfi
 * @param structuredData The structured data from Veryfi (may be incomplete)
 * @returns Parsed receipt data
 */
export function parseReceiptOcr(
  ocrText: string | undefined | null,
  structuredData: any
): ParsedReceiptData {
  const result: ParsedReceiptData = {};

  // First try to get data from structured fields
  result.vendor = structuredData?.vendor?.name || structuredData?.vendor?.raw_name;
  result.date = structuredData?.date;
  result.total = structuredData?.total;
  result.gst = structuredData?.tax;

  // If OCR text is available and we're missing fields, parse from text
  if (ocrText) {
    if (!result.vendor) {
      result.vendor = extractVendor(ocrText);
    }
    if (!result.date) {
      result.date = extractDate(ocrText);
    }
    if (!result.total) {
      result.total = extractTotal(ocrText);
    }
    if (!result.gst) {
      result.gst = extractGst(ocrText);
    }
  }

  return result;
}
