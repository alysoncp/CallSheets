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
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    // Create form data for Veryfi API
    const formData = new FormData();
    formData.append("file", imageBlob, "receipt.jpg");

    // Veryfi API v8 document.parser endpoint
    const response = await fetch(`${this.baseUrl}/partner/document`, {
      method: "POST",
      headers: {
        "CLIENT-ID": this.clientId,
        "AUTHORIZATION": `apikey ${this.username}:${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Veryfi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Map Veryfi response to our interface
    return {
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
  }

  async processPaystub(imageUrl: string): Promise<VeryfiPaystubResult> {
    // Implementation would call Veryfi API
    throw new Error("Veryfi integration not yet implemented. Add credentials to .env.local");
  }
}
