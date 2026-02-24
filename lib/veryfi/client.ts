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
  ocr_text?: string;
  raw_data?: any;
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
  ocr_text?: string;
  raw_data?: any;
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

  private async submitDocument(fileBlob: Blob, filename: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", fileBlob, filename);

    const endpoint = `${this.baseUrl}/partner/documents`;
    const response = await fetch(endpoint, {
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

    return response.json();
  }

  async processReceiptBlob(imageBlob: Blob, filename: string = "receipt.jpg"): Promise<VeryfiReceiptResult> {
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    const data = await this.submitDocument(imageBlob, filename);

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
      ocr_text: data.ocr_text,
      raw_data: data,
    };
  }

  async processPaystubBlob(imageBlob: Blob, filename: string = "paystub.jpg"): Promise<VeryfiPaystubResult> {
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    const data = await this.submitDocument(imageBlob, filename);

    return {
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
      ocr_text: data.ocr_text,
      raw_data: data,
    };
  }

  async processReceipt(imageUrl: string): Promise<VeryfiReceiptResult> {
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    // Fetch the image from the URL (User-Agent helps avoid 400 from some CDNs/storage)
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "CrewBooks-OCR/1.0",
        "Accept": "image/*,*/*",
      },
    });
    if (!imageResponse.ok) {
      console.error("Failed to fetch image:", imageResponse.statusText);
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    return this.processReceiptBlob(imageBlob, "receipt.jpg");
  }

  async processPaystub(imageUrl: string): Promise<VeryfiPaystubResult> {
    if (!this.clientId || !this.clientSecret || !this.username || !this.apiKey) {
      throw new Error("Veryfi credentials not configured. Add credentials to .env.local");
    }

    // Fetch the image from the URL (User-Agent helps avoid 400 from some CDNs/storage)
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "CrewBooks-OCR/1.0",
        "Accept": "image/*,*/*",
      },
    });
    if (!imageResponse.ok) {
      console.error("Failed to fetch image:", imageResponse.statusText);
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageBlob = await imageResponse.blob();

    return this.processPaystubBlob(imageBlob, "paystub.jpg");
  }
}
