import {
  LoginRequest,
  LoginResponse,
  ConversionRequest,
  ConversionResponse,
  AuditRequest,
  AuditResponse,
  AuditRecord,
} from "./api";
import JSZip from "jszip";

// Mock database for audit records
const mockAuditRecords: AuditRecord[] = [
  {
    id: "1",
    txnReference: "TXN001",
    originalMessage: "MT103",
    convertedMessage: "MX.pacs.008",
    status: "SUCCESS",
    createdAt: "2024-01-15T10:30:00Z",
    messageType: "MT103",
  },
  {
    id: "2",
    txnReference: "TXN002",
    originalMessage: "MT202",
    convertedMessage: "MX.pacs.002",
    status: "FAILED",
    errorMessage: "Invalid BIC code",
    createdAt: "2024-01-15T11:15:00Z",
    messageType: "MT202",
  },
  {
    id: "3",
    txnReference: "TXN003",
    originalMessage: "MX.pacs.008",
    convertedMessage: "MT103",
    status: "SUCCESS",
    createdAt: "2024-01-15T14:20:00Z",
    messageType: "MX.pacs.008",
  },
  {
    id: "4",
    txnReference: "TXN004",
    originalMessage: "MT940",
    convertedMessage: "MX.camt.053",
    status: "SUCCESS",
    createdAt: "2024-01-16T09:45:00Z",
    messageType: "MT940",
  },
  {
    id: "5",
    txnReference: "TXN005",
    originalMessage: "MX.camt.054",
    convertedMessage: "MT950",
    status: "FAILED",
    errorMessage: "Unsupported currency code",
    createdAt: "2024-01-16T13:30:00Z",
    messageType: "MX.camt.054",
  },
  {
    id: "6",
    txnReference: "TXN006",
    originalMessage: "MT103",
    convertedMessage: "MX.pacs.008",
    status: "SUCCESS",
    createdAt: "2024-01-17T08:15:00Z",
    messageType: "MT103",
  },
  {
    id: "7",
    txnReference: "TXN007",
    originalMessage: "MX.pacs.002",
    convertedMessage: "MT202",
    status: "SUCCESS",
    createdAt: "2024-01-17T16:45:00Z",
    messageType: "MX.pacs.002",
  },
  {
    id: "8",
    txnReference: "TXN008",
    originalMessage: "MT950",
    convertedMessage: "MX.camt.054",
    status: "FAILED",
    errorMessage: "Missing mandatory fields",
    createdAt: "2024-01-18T10:10:00Z",
    messageType: "MT950",
  },
  {
    id: "9",
    txnReference: "TXN009",
    originalMessage: "MX.camt.053",
    convertedMessage: "MT940",
    status: "SUCCESS",
    createdAt: "2024-01-18T12:30:00Z",
    messageType: "MX.camt.053",
  },
  {
    id: "10",
    txnReference: "TXN010",
    originalMessage: "MT103",
    convertedMessage: "MX.pacs.008",
    status: "SUCCESS",
    createdAt: "2024-01-19T07:20:00Z",
    messageType: "MT103",
  },
  {
    id: "11",
    txnReference: "TXN011",
    originalMessage: "MX.pacs.008",
    convertedMessage: "MT103",
    status: "FAILED",
    errorMessage: "Network timeout during conversion",
    createdAt: "2024-01-19T15:55:00Z",
    messageType: "MX.pacs.008",
  },
  {
    id: "12",
    txnReference: "TXN012",
    originalMessage: "MT202",
    convertedMessage: "MX.pacs.002",
    status: "SUCCESS",
    createdAt: "2024-01-20T11:40:00Z",
    messageType: "MT202",
  },
];

class MockApiClient {
  // Mock login - accepts any non-empty credentials
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        message: "Username and password are required",
      };
    }

    // Mock successful login for demo
    return {
      success: true,
      token: "mock_token_" + Date.now(),
      message: "Login successful",
    };
  }

  // Mock content conversion
  async convertContent(
    request: ConversionRequest,
  ): Promise<ConversionResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!request.conversionType) {
      return {
        success: false,
        error: "Conversion type is required",
      };
    }

    // Mock conversion logic
    const mockConvertedContent = this.generateMockConvertedContent(
      request.conversionType,
      request.content || "Sample content",
    );

    // For file uploads, generate a download URL
    if (request.file) {
      const mockDownloadUrl = URL.createObjectURL(
        new Blob([mockConvertedContent], { type: "text/plain" }),
      );

      return {
        success: true,
        convertedContent: mockConvertedContent,
        downloadUrl: mockDownloadUrl,
        message: `Successfully converted ${request.file.name} from ${this.getSourceFormat(request.conversionType)} to ${this.getTargetFormat(request.conversionType)}`,
      };
    }

    // For content conversion, return the converted content directly
    return {
      success: true,
      convertedContent: mockConvertedContent,
      message: `Successfully converted from ${this.getSourceFormat(request.conversionType)} to ${this.getTargetFormat(request.conversionType)}`,
    };
  }

  // Mock folder conversion
  async convertFolder(
    conversionType: string,
    files: FileList,
  ): Promise<ConversionResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!conversionType) {
      return {
        success: false,
        error: "Conversion type is required",
      };
    }

    if (!files || files.length === 0) {
      return {
        success: false,
        error: "No files selected for conversion",
      };
    }

    try {
      // Create a ZIP file with converted content
      const zip = new JSZip();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mockConvertedContent = this.generateMockConvertedContent(
          conversionType,
          `Content from ${file.name}`,
        );

        // Add converted file to ZIP with appropriate extension
        const targetExtension = this.getTargetExtension(conversionType);
        const fileName = file.name.replace(/\.[^/.]+$/, targetExtension);
        zip.file(fileName, mockConvertedContent);
      }

      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);

      return {
        success: true,
        downloadUrl,
        message: `Successfully converted ${files.length} files from ${this.getSourceFormat(conversionType)} to ${this.getTargetFormat(conversionType)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to create ZIP file with converted content",
      };
    }
  }

  // Mock audit report
  async getAuditReport(request: AuditRequest): Promise<AuditResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!request.startDate || !request.endDate) {
      return {
        success: false,
        records: [],
        total: 0,
        message: "Start date and end date are required",
      };
    }

    // Filter records based on request criteria
    let filteredRecords = mockAuditRecords.filter((record) => {
      const recordDate = new Date(record.createdAt);
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      // Date range filter
      const isInDateRange = recordDate >= startDate && recordDate <= endDate;

      // Message type filter
      let matchesMessageType = true;
      if (request.messageType === "MT") {
        matchesMessageType = record.messageType.startsWith("MT");
      } else if (request.messageType === "MX") {
        matchesMessageType = record.messageType.startsWith("MX");
      }

      return isInDateRange && matchesMessageType;
    });

    // Sort by date descending
    filteredRecords = filteredRecords.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      success: true,
      records: filteredRecords,
      total: filteredRecords.length,
      message: `Found ${filteredRecords.length} audit records`,
    };
  }

  // Helper methods
  private generateMockConvertedContent(
    conversionType: string,
    originalContent: string,
  ): string {
    const timestamp = new Date().toISOString();
    const targetFormat = this.getTargetFormat(conversionType);

    if (targetFormat.startsWith("MX")) {
      // Generate mock XML content for MX format
      return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:${targetFormat.toLowerCase().replace(".", ".")}.001.01">
  <${targetFormat.split(".")[1]}>
    <GrpHdr>
      <MsgId>MSG${Date.now()}</MsgId>
      <CreDtTm>${timestamp}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR${Date.now()}</InstrId>
        <EndToEndId>E2E${Date.now()}</EndToEndId>
      </PmtId>
      <Amt>
        <InstdAmt Ccy="USD">1000.00</InstdAmt>
      </Amt>
      <Dbtr>
        <Nm>Sample Debtor</Nm>
      </Dbtr>
      <Cdtr>
        <Nm>Sample Creditor</Nm>
      </Cdtr>
      <!-- Converted from: ${originalContent.substring(0, 50)}... -->
    </CdtTrfTxInf>
  </${targetFormat.split(".")[1]}>
</Document>`;
    } else {
      // Generate mock MT format content
      return `:20:${Date.now()}
:23B:CRED
:32A:${new Date().toISOString().slice(2, 10).replace(/-/g, "")}USD1000,00
:50K:SAMPLE DEBTOR
SAMPLE ADDRESS
:59:/12345678901234567890
SAMPLE CREDITOR
SAMPLE ADDRESS
:70:/INV/${Date.now()}
CONVERTED FROM: ${originalContent.substring(0, 30)}...
:71A:BEN
-`;
    }
  }

  private getSourceFormat(conversionType: string): string {
    if (conversionType.startsWith("MT")) {
      return "MT";
    } else {
      return "MX";
    }
  }

  private getTargetFormat(conversionType: string): string {
    // Map MT types to their corresponding MX types and vice versa
    const conversionMap: { [key: string]: string } = {
      // MT to MX mappings
      MT103: "MX.pacs.008",
      MT202: "MX.pacs.002",
      MT940: "MX.camt.053",
      MT950: "MX.camt.054",
      // MX to MT mappings
      "MX.pacs.008": "MT103",
      "MX.pacs.002": "MT202",
      "MX.camt.053": "MT940",
      "MX.camt.054": "MT950",
    };

    return conversionMap[conversionType] || conversionType;
  }

  private getTargetExtension(conversionType: string): string {
    if (conversionType.startsWith("MX")) {
      return ".xml";
    } else {
      return ".mt";
    }
  }
}

export const mockApiClient = new MockApiClient();
