import { useState, useCallback, useRef } from "react";

// Extend HTMLInputElement to include webkitdirectory
declare module "react" {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: boolean | "";
  }
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Upload,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Folder,
  FileText,
} from "lucide-react";
import { configManager } from "@/lib/config";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onFolderSelect?: (files: FileList | null) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  folder?: boolean;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  onFolderSelect,
  accept,
  maxSize,
  multiple = false,
  folder = false,
  className,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const config = configManager.get();
  const actualMaxSize = maxSize || config.maxFileSize;
  const allowedTypes = config.allowedFileTypes;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > actualMaxSize) {
        return `File size exceeds ${(actualMaxSize / (1024 * 1024)).toFixed(1)}MB limit`;
      }

      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowedTypes.includes(extension)) {
        return `File type ${extension} is not supported. Allowed types: ${allowedTypes.join(", ")}`;
      }

      return null;
    },
    [actualMaxSize, allowedTypes],
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setErrors([]);
      const newErrors: string[] = [];
      const validFiles: File[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      setErrors(newErrors);

      if (validFiles.length > 0) {
        setSelectedFiles(validFiles);

        if (folder && onFolderSelect) {
          // Create FileList-like object for folder upload
          const fileList = validFiles as any;
          fileList.length = validFiles.length;
          onFolderSelect(fileList);
        } else if (!folder && onFileSelect) {
          onFileSelect(validFiles[0]);
        }

        // Simulate upload progress
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setUploadProgress(0);
          }
        }, 100);
      }
    },
    [onFileSelect, onFolderSelect, folder, validateFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    if (newFiles.length === 0) {
      if (folder && onFolderSelect) {
        onFolderSelect(null);
      } else if (!folder && onFileSelect) {
        onFileSelect(null);
      }
    } else if (!folder && onFileSelect) {
      onFileSelect(newFiles[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
          isDragActive ? "border-primary bg-primary/5" : "border-border",
          isUploading && "pointer-events-none opacity-70",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={folder ? undefined : accept}
          multiple={multiple || folder}
          {...(folder ? { webkitdirectory: "" } : {})}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="p-8 text-center">
          <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            {folder ? (
              <Folder className="h-6 w-6 text-primary" />
            ) : (
              <Upload className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {folder ? "Drop folder here" : "Drop files here"}
            </h3>
            <p className="text-sm text-muted-foreground">
              or{" "}
              <span className="text-primary underline">
                browse to choose {folder ? "folder" : "files"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Max file size: {(actualMaxSize / (1024 * 1024)).toFixed(1)}MB
              <br />
              Supported types: {allowedTypes.join(", ")}
            </p>
          </div>
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Upload className="h-4 w-4 text-primary animate-pulse" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        </Card>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && !isUploading && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="p-4 border-destructive">
          <h4 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Upload Errors
          </h4>
          <div className="space-y-1">
            {errors.map((error, index) => (
              <p key={index} className="text-xs text-destructive">
                {error}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
