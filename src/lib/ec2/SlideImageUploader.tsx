/**
 * Slide Image Uploader for EC2 self-hosted backend.
 * Uses JWT from EC2 client and uploads to /api/upload/slide.
 */

import { useState, useRef, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Image,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/lib/ec2/client";

interface SlideImageUploaderProps {
  sampleId?: string;
  sampleBarcode?: string;
  onUploadComplete?: (imageUrl: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  url?: string;
  error?: string;
}

const SlideImageUploader = ({
  sampleId,
  sampleBarcode,
  onUploadComplete,
}: SlideImageUploaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files ? Array.from(e.target.files) : []);
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => {
      const ext = file.name.toLowerCase();
      return (
        file.type.startsWith("image/") ||
        ext.endsWith(".tiff") ||
        ext.endsWith(".tif") ||
        ext.endsWith(".svs") ||
        ext.endsWith(".ndpi")
      );
    });

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload image files (JPG, PNG, TIFF, SVS, NDPI)",
        variant: "destructive",
      });
      return;
    }

    const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3GB
    const oversized = imageFiles.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast({
        title: "File Too Large",
        description: `${oversized.map((f) => f.name).join(", ")} exceed 3GB limit`,
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      status: "pending" as const,
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    for (let i = 0; i < imageFiles.length; i++) {
      await uploadFile(imageFiles[i], newFiles[i].id);
    }
  };

  const uploadFile = async (file: File, fileId: string) => {
    const token = getAccessToken();
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      return;
    }

    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, status: "uploading" as const } : f
      )
    );

    const formData = new FormData();
    formData.append("file", file);
    if (sampleId) formData.append("sample_id", sampleId);
    if (sampleBarcode) formData.append("tile_name", sampleBarcode);

    try {
      const res = await fetch("/api/upload/slide", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      const fileUrl = data.url || data.file_path;

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "success" as const, progress: 100, url: fileUrl }
            : f
        )
      );

      toast({
        title: "Upload Complete",
        description: `${file.name} uploaded successfully`,
      });

      onUploadComplete?.(fileUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "error" as const, error: message } : f
        )
      );

      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Image className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Slide Images
          {sampleBarcode && (
            <Badge variant="outline" className="ml-2">
              {sampleBarcode}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.tiff,.tif,.svs,.ndpi"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm font-medium">Drag & drop slide images here</p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse (JPG, PNG, TIFF, SVS, NDPI)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Maximum file size: 3GB per file
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Uploaded Files</p>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                {getStatusIcon(file.status)}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1 flex-1" />
                    )}
                    {file.status === "success" && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50"
                      >
                        Uploaded
                      </Badge>
                    )}
                    {file.status === "error" && (
                      <Badge
                        variant="outline"
                        className="text-destructive border-destructive/30 bg-destructive/10"
                      >
                        Failed
                      </Badge>
                    )}
                  </div>
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {uploadedFiles.filter((f) => f.status === "success").length > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                {uploadedFiles.filter((f) => f.status === "success").length} file(s)
                uploaded successfully
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SlideImageUploader;
