export interface AppConfig {
  apiBaseUrl: string;
  conversionTypes: {
    value: string;
    label: string;
    description: string;
  }[];
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  retryAttempts: number;
}

export const defaultConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  conversionTypes: [
    {
      value: "MT103",
      label: "MT103",
      description: "Single Customer Credit Transfer",
    },
    {
      value: "MT202",
      label: "MT202",
      description: "General Financial Institution Transfer",
    },
    {
      value: "MT940",
      label: "MT940",
      description: "Customer Statement Message",
    },
    { value: "MT950", label: "MT950", description: "Statement Message" },
    {
      value: "MX.pacs.008",
      label: "MX pacs.008",
      description: "Customer Credit Transfer Initiation",
    },
    {
      value: "MX.pacs.002",
      label: "MX pacs.002",
      description: "Payment Status Report",
    },
    {
      value: "MX.camt.053",
      label: "MX camt.053",
      description: "Bank to Customer Statement",
    },
    {
      value: "MX.camt.054",
      label: "MX camt.054",
      description: "Bank to Customer Debit Credit Notification",
    },
  ],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [".txt", ".xml", ".mt", ".mx"],
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  retryAttempts: 3,
};

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = { ...defaultConfig };
  }

  get(): AppConfig {
    return this.config;
  }

  update(partialConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...partialConfig };
  }

  getConversionTypes(): AppConfig["conversionTypes"] {
    return this.config.conversionTypes;
  }

  getMTTypes(): AppConfig["conversionTypes"] {
    return this.config.conversionTypes.filter((type) =>
      type.value.startsWith("MT"),
    );
  }

  getMXTypes(): AppConfig["conversionTypes"] {
    return this.config.conversionTypes.filter((type) =>
      type.value.startsWith("MX"),
    );
  }

  getApiUrl(endpoint: string): string {
    return `${this.config.apiBaseUrl}${endpoint}`;
  }
}

export const configManager = new ConfigManager();
export { ConfigManager };
