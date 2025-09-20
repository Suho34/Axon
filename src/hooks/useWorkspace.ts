// hooks/useWorkspace.ts
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Document } from "@/types/index";

export const useWorkspace = () => {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [workspaceRes, docsRes] = await Promise.all([
          fetch(`/api/files/${workspaceId}`),
          fetch(`/api/pdfs?workspaceId=${workspaceId}`),
        ]);

        if (workspaceRes.ok) {
          const workspaceData = await workspaceRes.json();
          setWorkspaceName(workspaceData.workspace?.name || "Workspace");
        }

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDocuments(docsData.documents || []);

          if (docsData.documents?.length > 0 && !activeDocumentId) {
            setActiveDocumentId(docsData.documents[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching workspace data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [workspaceId, activeDocumentId]);

  const handleDocumentSelect = (documentId: string) => {
    setActiveDocumentId(documentId);
  };

  return {
    workspaceId,
    workspaceName,
    documents,
    activeDocumentId,
    setActiveDocumentId: handleDocumentSelect,
    isLoading,
  };
};
