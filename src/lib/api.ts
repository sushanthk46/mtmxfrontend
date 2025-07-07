import { configManager } from "./config";
import { mockApiClient } from "./mockApi";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface ConversionRequest {
  conversionType: string;
  content?: string;
  file?: File;
  folder?: FileList;
}

export interface ConversionResponse {
  success: boolean;
  convertedContent?: string;
  downloadUrl?: string;
  message?: string;
  error?: string;
}

export interface AuditRequest {
  messageType: "MT" | "MX";
  startDate: string;
  endDate: string;
}

export interface AuditRecord {
  id: string;
  txnReference: string;
  originalMessage: string;
  convertedMessage: string;
  status: "SUCCESS" | "FAILED";
  errorMessage?: string;
  createdAt: string;
  messageType: string;
}

export interface AuditResponse {
  success: boolean;
  records: AuditRecord[];
  total: number;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private useMockApi: boolean = true; // Use mock API for demo

  constructor() {
    this.baseUrl = configManager.get().apiBaseUrl;
    this.token = localStorage.getItem("auth_token");

    // Check if we should use mock API (default to true for demo)
    this.useMockApi = !import.meta.env.VITE_USE_REAL_API;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error("Authentication failed. Please login again.");
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      // If it's a network error (Failed to fetch), throw it to be handled by calling method
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("NETWORK_ERROR");
      }
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (this.useMockApi) {
      console.log("Using mock API for demo");
      const mockResponse = await mockApiClient.login(credentials);

      if (mockResponse.success && mockResponse.token) {
        this.token = mockResponse.token;
        localStorage.setItem("auth_token", mockResponse.token);
      }

      return mockResponse;
    }

    try {
      const response = await this.request<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (response.success && response.token) {
        this.token = response.token;
        localStorage.setItem("auth_token", response.token);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async convertContent(
    request: ConversionRequest,
  ): Promise<ConversionResponse> {
    if (this.useMockApi) {
      console.log("Using mock API for demo");
      return mockApiClient.convertContent(request);
    }

    try {
      const formData = new FormData();
      formData.append("conversionType", request.conversionType);

      if (request.content) {
        formData.append("content", request.content);
      }

      if (request.file) {
        formData.append("file", request.file);
      }

      const headers: HeadersInit = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}/convert`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Conversion failed",
      };
    }
  }

  async convertFolder(
    conversionType: string,
    files: FileList,
  ): Promise<ConversionResponse> {
    if (this.useMockApi) {
      console.log("Using mock API for demo");
      return mockApiClient.convertFolder(conversionType, files);
    }

    try {
      const formData = new FormData();
      formData.append("conversionType", conversionType);

      Array.from(files).forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const headers: HeadersInit = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}/convert-folder`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Folder conversion failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Folder conversion failed",
      };
    }
  }

  async getAuditReport(request: AuditRequest): Promise<AuditResponse> {
    if (this.useMockApi) {
      console.log("Using mock API for demo");
      return mockApiClient.getAuditReport(request);
    }

    try {
      const queryParams = new URLSearchParams({
        messageType: request.messageType,
        startDate: request.startDate,
        endDate: request.endDate,
      });

      return this.request<AuditResponse>(`/audit?${queryParams}`);
    } catch (error) {
      return {
        success: false,
        records: [],
        total: 0,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch audit report",
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();
