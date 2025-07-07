import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient, AuditRecord } from "@/lib/api";
import {
  BarChart3,
  Search,
  Download,
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

export default function AuditReport() {
  const [messageType, setMessageType] = useState<"MT" | "MX">("MT");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(
    null,
  );
  const [total, setTotal] = useState(0);

  const handleSearch = useCallback(async () => {
    console.log("Audit Report: handleSearch called with:", {
      messageType,
      startDate,
      endDate,
    });

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.getAuditReport({
        messageType,
        startDate,
        endDate,
      });

      console.log("Audit Report: API response:", response);

      if (response.success) {
        setRecords(response.records);
        setTotal(response.total);
        console.log("Audit Report: Records set:", response.records.length);
      } else {
        setError(response.message || "Failed to fetch audit report");
      }
    } catch (err) {
      console.error("Audit Report: Error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }, [messageType, startDate, endDate]);

  // Set default dates to January 2024 to match mock data
  useEffect(() => {
    // Use January 2024 dates to match our mock data
    const endDate = new Date("2024-01-31");
    const startDate = new Date("2024-01-01");

    setEndDate(format(endDate, "yyyy-MM-dd"));
    setStartDate(format(startDate, "yyyy-MM-dd"));
    console.log(
      "Audit Report: Default dates set to:",
      format(startDate, "yyyy-MM-dd"),
      "to",
      format(endDate, "yyyy-MM-dd"),
    );
  }, []);

  // Auto-search when dates are set and handleSearch is ready
  useEffect(() => {
    if (startDate && endDate && handleSearch) {
      handleSearch();
    }
  }, [startDate, endDate, handleSearch]);

  const handleExport = () => {
    if (records.length === 0) return;

    const csvData = [
      [
        "Transaction Reference",
        "Message Type",
        "Status",
        "Created At",
        "Error Message",
      ],
      ...records.map((record) => [
        record.txnReference,
        record.messageType,
        record.status,
        format(new Date(record.createdAt), "yyyy-MM-dd HH:mm:ss"),
        record.errorMessage || "",
      ]),
    ];

    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_report_${messageType}_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="outline" className="border-success text-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Success
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStats = () => {
    const successCount = records.filter((r) => r.status === "SUCCESS").length;
    const failedCount = records.filter((r) => r.status === "FAILED").length;
    const successRate =
      records.length > 0 ? (successCount / records.length) * 100 : 0;

    return { successCount, failedCount, successRate };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500 text-white">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Report</h1>
          <p className="text-muted-foreground">
            View and analyze conversion history and performance metrics
          </p>
        </div>
      </div>

      {/* Search Filters */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <CardDescription>
            Configure search parameters to find specific conversion records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="message-type">Message Type</Label>
              <Select
                value={messageType}
                onValueChange={(value: "MT" | "MX") => setMessageType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MT">MT Messages</SelectItem>
                  <SelectItem value="MX">MX Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
              {records.length > 0 && (
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Records
                  </p>
                  <p className="text-2xl font-bold text-foreground">{total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Successful
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {stats.successCount}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-destructive">
                    {stats.failedCount}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {records.length > 0 ? (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conversion Records ({records.length})</span>
              <Badge variant="outline">{messageType} Messages</Badge>
            </CardTitle>
            <CardDescription>
              Detailed list of conversion transactions within the selected date
              range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Reference</TableHead>
                    <TableHead>Message Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.txnReference}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{record.messageType}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {format(
                          new Date(record.createdAt),
                          "MMM dd, yyyy HH:mm",
                        )}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>
                                Conversion Details - {record.txnReference}
                              </DialogTitle>
                              <DialogDescription>
                                View original and converted message content
                              </DialogDescription>
                            </DialogHeader>

                            {selectedRecord && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Status
                                    </Label>
                                    <div className="mt-1">
                                      {getStatusBadge(selectedRecord.status)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Message Type
                                    </Label>
                                    <div className="mt-1">
                                      <Badge variant="secondary">
                                        {selectedRecord.messageType}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {selectedRecord.errorMessage && (
                                  <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      {selectedRecord.errorMessage}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Original Message
                                    </Label>
                                    <ScrollArea className="h-[300px] mt-2 rounded-md border p-4">
                                      <pre className="text-xs font-mono whitespace-pre-wrap">
                                        {selectedRecord.originalMessage}
                                      </pre>
                                    </ScrollArea>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Converted Message
                                    </Label>
                                    <ScrollArea className="h-[300px] mt-2 rounded-md border p-4">
                                      <pre className="text-xs font-mono whitespace-pre-wrap">
                                        {selectedRecord.convertedMessage ||
                                          "No conversion result available"}
                                      </pre>
                                    </ScrollArea>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : !isLoading && startDate && endDate ? (
        <Card className="glass-effect">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Records Found
            </h3>
            <p className="text-muted-foreground mb-4">
              No conversion records found for the selected criteria. Try
              adjusting your search parameters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                const thirtyDaysAgo = new Date(
                  today.getTime() - 30 * 24 * 60 * 60 * 1000,
                );
                setEndDate(format(today, "yyyy-MM-dd"));
                setStartDate(format(thirtyDaysAgo, "yyyy-MM-dd"));
              }}
            >
              Reset to Last 30 Days
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
