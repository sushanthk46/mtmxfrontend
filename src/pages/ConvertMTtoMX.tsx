import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/FileUpload";
import { apiClient } from "@/lib/api";
import { configManager } from "@/lib/config";
import {
  ArrowLeftRight,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Folder,
  Type,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConvertMTtoMX() {
  const [activeTab, setActiveTab] = useState("file");
  const [conversionType, setConversionType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // File conversion state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Folder conversion state
  const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null);

  // Content conversion state
  const [inputContent, setInputContent] = useState("");
  const [outputContent, setOutputContent] = useState("");

  const mtTypes = configManager.getMTTypes();

  const handleConvert = async () => {
    if (!conversionType) {
      setError("Please select a conversion type");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      let response;

      if (activeTab === "file" && selectedFile) {
        response = await apiClient.convertContent({
          conversionType,
          file: selectedFile,
        });
      } else if (activeTab === "folder" && selectedFolder) {
        response = await apiClient.convertFolder(
          conversionType,
          selectedFolder,
        );
      } else if (activeTab === "content" && inputContent.trim()) {
        response = await apiClient.convertContent({
          conversionType,
          content: inputContent.trim(),
        });
      } else {
        setError(
          `Please provide ${activeTab === "content" ? "content" : activeTab} to convert`,
        );
        return;
      }

      if (response.success) {
        setResult(response);
        if (activeTab === "content" && response.convertedContent) {
          setOutputContent(response.convertedContent);
        }
      } else {
        setError(response.error || response.message || "Conversion failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      // Create a download link instead of opening in new tab
      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = `converted_${conversionType}_${Date.now()}.${activeTab === "folder" ? "zip" : "xml"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (outputContent) {
      const blob = new Blob([outputContent], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted_${conversionType}_${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const canConvert = () => {
    if (!conversionType) return false;
    if (activeTab === "file") return !!selectedFile;
    if (activeTab === "folder") return !!selectedFolder;
    if (activeTab === "content") return !!inputContent.trim();
    return false;
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedFolder(null);
    setInputContent("");
    setOutputContent("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>
                Select the conversion type and input method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conversion-type">Conversion Type</Label>
                <Select
                  value={conversionType}
                  onValueChange={setConversionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select MT message type">
                      {conversionType
                        ? mtTypes.find((type) => type.value === conversionType)
                            ?.label
                        : "Select MT message type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mtTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col gap-1 w-full">
                          <span className="font-medium text-sm leading-tight">
                            {type.label}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight break-words">
                            {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {conversionType && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="text-primary border-primary"
                    >
                      {conversionType}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {
                      mtTypes.find((t) => t.value === conversionType)
                        ?.description
                    }
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleConvert}
                  disabled={!canConvert() || isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Convert to MX
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          {(result || error) && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {result && (
                  <div className="space-y-3">
                    <Alert className="border-success text-success">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Conversion completed successfully!
                      </AlertDescription>
                    </Alert>

                    {(result.downloadUrl || outputContent) && (
                      <Button
                        onClick={handleDownload}
                        className="w-full bg-success hover:bg-success/90"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download MX File
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Input Panel */}
        <div className="lg:col-span-2">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Input Method</CardTitle>
              <CardDescription>
                Choose how you want to provide the MT message for conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    File
                  </TabsTrigger>
                  <TabsTrigger
                    value="folder"
                    className="flex items-center gap-2"
                  >
                    <Folder className="h-4 w-4" />
                    Folder
                  </TabsTrigger>
                  <TabsTrigger
                    value="content"
                    className="flex items-center gap-2"
                  >
                    <Type className="h-4 w-4" />
                    Content
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Upload MT File
                      </Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a single MT message file for conversion
                      </p>
                      <FileUpload
                        onFileSelect={setSelectedFile}
                        accept=".txt,.mt"
                        maxSize={10 * 1024 * 1024}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="folder" className="mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Upload MT Folder
                      </Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select multiple MT message files for batch conversion
                      </p>
                      <FileUpload
                        onFolderSelect={setSelectedFolder}
                        folder={true}
                        multiple={true}
                        accept=".txt,.mt"
                        maxSize={10 * 1024 * 1024}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="input-content"
                          className="text-base font-medium"
                        >
                          MT Message Content
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Paste your MT message content below
                        </p>
                        <Textarea
                          id="input-content"
                          placeholder="Paste your MT message here..."
                          value={inputContent}
                          onChange={(e) => setInputContent(e.target.value)}
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Converted MX Content
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          The converted MX format will appear here
                        </p>
                        <Textarea
                          value={outputContent}
                          readOnly
                          placeholder="Converted MX content will appear here..."
                          className="min-h-[300px] font-mono text-sm bg-muted/50"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
