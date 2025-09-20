// hooks/useUpload.ts
import { useState } from "react";
import { Document } from "@/types/index";

export const useUpload = (workspaceId: string | null) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileUpload = async (
    onUploadSuccess: (document: Document) => void
  ) => {
    if (!workspaceId || !selectedFile) {
      setUploadMessage({
        type: "error",
        text: "Please select a file to upload.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    setIsUploading(true);
    setUploadMessage(null);

    let documentId: string | null = null;

    try {
      const res = await fetch(`/api/upload?workspaceId=${workspaceId}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newDocument = {
        _id: data.document._id,
        title: data.document.title,
        uploadStatus: "uploading",
        workspaceId: workspaceId,
        createdAt: new Date().toISOString(),
      };
      documentId = data.document._id;

      onUploadSuccess(newDocument);

      if (data.document && data.document._id) {
        const embedRes = await fetch(
          `/api/documents/${data.document._id}/embed`,
          {
            method: "POST",
          }
        );

        if (!embedRes.ok) {
          throw new Error("Failed to start embedding process");
        }
      }

      setUploadMessage({
        type: "success",
        text: "File uploaded successfully!",
      });

      setSelectedFile(null);
      return data.document._id;
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setUploadMessage({
        type: "error",
        text: (err as Error).message || "Failed to upload file.",
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const pollEmbeddingStatus = async (
    documentId: string,
    onStatusUpdate: (documentId: string, status: string) => void
  ) => {
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const statusRes = await fetch(`/api/documents/${documentId}/embed`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();

          if (statusData.uploadStatus === "completed") {
            onStatusUpdate(documentId, "completed");
            return;
          } else if (statusData.uploadStatus === "failed") {
            console.error("Embedding failed for document:", documentId);
            onStatusUpdate(documentId, "failed");
            return;
          } else if (statusData.uploadStatus === "processing") {
            onStatusUpdate(documentId, "processing");
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        console.error("Error checking embedding status:", err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        }
      }
    };

    setTimeout(checkStatus, 1000);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadMessage(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadMessage(null);
  };

  return {
    selectedFile,
    isUploading,
    uploadMessage,
    handleFileUpload,
    pollEmbeddingStatus,
    onFileChange,
    removeSelectedFile,
  };
};
