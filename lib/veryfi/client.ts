// Veryfi OCR API client
// This is a structure for Veryfi integration
// Add your Veryfi credentials to .env.local

export interface VeryfiReceiptResult {
  vendor: {
    name: string;
  };
  line_items: Array<{
    description: string;
    total: number;
  }>;
  total: number;
  tax: number;
  date: string;
  currency_code: string;
}

export interface VeryfiPaystubResult {
  employer: string;
  employee_name: string;
  gross_pay: number;
  net_pay: number;
  deductions: {
    cpp: number;
    ei: number;
    income_tax: number;
  };
  pay_period: string;
}

export class VeryfiClient {
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private apiKey: string;
  private baseUrl = "https://api.veryfi.com/api/v8";

  constructor() {
    this.clientId = process.env.VERYFI_CLIENT_ID || "";
    this.clientSecret = process.env.VERYFI_CLIENT_SECRET || "";
    this.username = process.env.VERYFI_USERNAME || "";
    this.apiKey = process.env.VERYFI_API_KEY || "";
  }

  async processReceipt(imageUrl: string): Promise<VeryfiReceiptResult> {
    console.log("=== VERYFI CLIENT: processReceipt START ===");
    console.log("Image URL:", imageUrl);
    
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      console.error("=== VERYFI CREDENTIALS MISSING ===");
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    console.log("Veryfi credentials found, fetching image...");
    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error("Failed to fetch image:", imageResponse.statusText);
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    console.log("Image fetched, size:", imageBlob.size, "bytes");

    // Create form data for Veryfi API
    const formData = new FormData();
    formData.append("file", imageBlob, "receipt.jpg");

    console.log("=== CALLING VERYFI API (RECEIPT) ===");
    console.log("Base URL:", this.baseUrl);
    const endpoint = `${this.baseUrl}/partner/documents`;
    console.log("Endpoint:", endpoint);
    console.log("CLIENT-ID:", this.clientId);
    console.log("AUTHORIZATION:", `apikey ${this.username}:***`);
    
    // Veryfi API v8 document processing endpoint
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "CLIENT-ID": this.clientId,
        "AUTHORIZATION": `apikey ${this.username}:${this.apiKey}`,
      },
      body: formData,
    });

    console.log("Veryfi API response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("=== VERYFI API ERROR (RECEIPT) ===");
      console.error("Status:", response.status);
      console.error("Error text:", errorText);
      throw new Error(`Veryfi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log("=== VERYFI API SUCCESS (RECEIPT) ===");
    console.log("Veryfi Receipt OCR raw response:", JSON.stringify(data, null, 2));
    console.log("Response keys:", Object.keys(data));
    console.log("OCR text:", data.ocr_text || "NOT PRESENT");
    console.log("Vendor:", data.vendor);
    console.log("Total:", data.total);
    console.log("Tax:", data.tax);
    console.log("Date:", data.date);
    console.log("Line items:", data.line_items);
    
    // Map Veryfi response to our interface
    const mappedResult = {
      vendor: {
        name: data.vendor?.name || data.vendor?.raw_name || "",
      },
      line_items: (data.line_items || []).map((item: any) => ({
        description: item.description || item.text || "",
        total: item.total || 0,
      })),
      total: data.total || 0,
      tax: data.tax || 0,
      date: data.date || new Date().toISOString(),
      currency_code: data.currency_code || "CAD",
    };
    
    console.log("=== MAPPED RECEIPT RESULT ===");
    console.log("Mapped result:", JSON.stringify(mappedResult, null, 2));
    
    return mappedResult;
  }

  async processPaystub(imageUrl: string): Promise<VeryfiPaystubResult> {
    console.log("=== VERYFI CLIENT: processPaystub START ===");
    console.log("Image URL:", imageUrl);
    
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      console.error("=== VERYFI CREDENTIALS MISSING ===");
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    console.log("Veryfi credentials found, fetching image...");
    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error("Failed to fetch image:", imageResponse.statusText);
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();
    console.log("Image fetched, size:", imageBlob.size, "bytes");

    // Create form data for Veryfi API (multipart/form-data)
    const formData = new FormData();
    formData.append("file", imageBlob, "paystub.jpg");

    console.log("=== CALLING VERYFI API ===");
    console.log("Base URL:", this.baseUrl);
    // Try without trailing slash
    const endpoint = `${this.baseUrl}/partner/documents`;
    console.log("Endpoint:", endpoint);
    console.log("CLIENT-ID:", this.clientId);
    console.log("AUTHORIZATION:", `apikey ${this.username}:***`);
    console.log("Using multipart/form-data with blob");
    
    // Veryfi API v8 document processing endpoint (try without trailing slash)
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "CLIENT-ID": this.clientId,
        "AUTHORIZATION": `apikey ${this.username}:${this.apiKey}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    console.log("Veryfi API response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("=== VERYFI API ERROR ===");
      console.error("Status:", response.status);
      console.error("Error text:", errorText);
      throw new Error(`Veryfi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log("=== VERYFI API SUCCESS (PAYSTUB) ===");
    console.log("Veryfi Paystub OCR raw response:", JSON.stringify(data, null, 2));
    console.log("Response keys:", Object.keys(data));
    console.log("OCR text:", data.ocr_text || "NOT PRESENT");
    console.log("Employer:", data.employer);
    console.log("Employee:", data.employee);
    console.log("Gross pay:", data.gross_pay);
    console.log("Net pay:", data.net_pay);
    console.log("Total:", data.total);
    console.log("Gross:", data.gross);
    console.log("Deductions:", data.deductions);
    console.log("Pay period:", data.pay_period);
    console.log("Period:", data.period);
    console.log("Date:", data.date);
    console.log("Company name:", data.company_name);
    
    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'veryfi/client.ts:129',message:'Veryfi Paystub OCR raw response',data:{rawResponse:data,dataKeys:Object.keys(data),hasEmployer:!!data.employer,hasEmployee:!!data.employee,hasGrossPay:!!data.gross_pay,hasNetPay:!!data.net_pay,hasDeductions:!!data.deductions,hasPayPeriod:!!data.pay_period,ocrText:data.ocr_text},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    
    // Map Veryfi response to our interface
    const mappedResult = {
      employer: data.employer?.name || data.employer?.raw_name || data.company_name || "",
      employee_name: data.employee?.name || data.employee_name || "",
      gross_pay: data.gross_pay || data.total || data.gross || 0,
      net_pay: data.net_pay || data.net || 0,
      deductions: {
        cpp: data.deductions?.cpp || data.deductions?.canada_pension_plan || 0,
        ei: data.deductions?.ei || data.deductions?.employment_insurance || 0,
        income_tax: data.deductions?.income_tax || data.deductions?.tax || 0,
      },
      pay_period: data.pay_period || data.period || data.date || new Date().toISOString(),
    };
    
    console.log("=== MAPPED PAYSTUB RESULT ===");
    console.log("Mapped result:", JSON.stringify(mappedResult, null, 2));
    
    // #region agent log
    await fetch('http://127.0.0.1:7242/ingest/c7f9371c-25c8-41a6-9350-a0ea722a33f3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'veryfi/client.ts:143',message:'Veryfi Paystub OCR mapped result',data:{mappedResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    
    return mappedResult;
  }
}
