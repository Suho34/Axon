// hooks/useChat.ts
import { useState, useCallback } from "react";
import { Message, DocumentChatHistories } from "@/types/index";

export const useChat = (
  workspaceId: string | null,
  activeDocumentId: string | null
) => {
  const [documentChatHistories, setDocumentChatHistories] =
    useState<DocumentChatHistories>({});
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | number | null>(
    null
  );
  const [copiedMessage, setCopiedMessage] = useState<string | number | null>(
    null
  );
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const updateDocumentMessages = useCallback(
    (documentId: string, updater: (prev: Message[]) => Message[]) => {
      setDocumentChatHistories((prev) => ({
        ...prev,
        [documentId]: updater(prev[documentId] || []),
      }));
    },
    []
  );

  const currentMessages = activeDocumentId
    ? documentChatHistories[activeDocumentId] || []
    : [];

  const sendMessage = useCallback(async () => {
    if (
      !inputMessage.trim() ||
      !activeDocumentId ||
      isAiLoading ||
      !workspaceId
    )
      return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    updateDocumentMessages(activeDocumentId, (prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsAiLoading(true);
    setShowQuickActions(false);

    const loadingMessageId = "loading-" + Date.now();
    const loadingMessage: Message = {
      id: loadingMessageId,
      type: "loading",
      content: "AI is thinking...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    updateDocumentMessages(activeDocumentId, (prev) => [
      ...prev,
      loadingMessage,
    ]);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage.content,
          documentId: activeDocumentId,
          workspaceId: workspaceId,
          topK: 5,
        }),
      });

      if (!res.ok) throw new Error("Query failed");
      const data = await res.json();

      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: data.sources,
      };

      updateDocumentMessages(activeDocumentId, (prev) => {
        const newMessages = prev.filter((msg) => msg.id !== loadingMessageId);
        return [...newMessages, aiResponse];
      });
    } catch (err) {
      console.error("Query error:", err);
      updateDocumentMessages(activeDocumentId, (prev) => {
        const newMessages = prev.filter((msg) => msg.id !== loadingMessageId);
        return [
          ...newMessages,
          {
            id: Date.now() + 1,
            type: "ai",
            content: "Sorry, something went wrong fetching the answer.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    } finally {
      setIsAiLoading(false);
    }
  }, [
    inputMessage,
    activeDocumentId,
    isAiLoading,
    workspaceId,
    updateDocumentMessages,
  ]);

  const copyMessage = useCallback(
    async (content: string, messageId: string | number) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedMessage(messageId);
        setTimeout(() => setCopiedMessage(null), 2000);
      } catch (err) {
        console.error("Failed to copy message:", err);
      }
    },
    []
  );

  const reactToMessage = useCallback(
    (messageId: string | number, reaction: "like" | "dislike") => {
      if (!activeDocumentId) return;

      updateDocumentMessages(activeDocumentId, (prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
            : msg
        )
      );
    },
    [activeDocumentId, updateDocumentMessages]
  );

  const regenerateResponse = useCallback(
    async (messageId: string | number) => {
      if (!activeDocumentId || !workspaceId) return;

      const messages = documentChatHistories[activeDocumentId] || [];
      const aiMessageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (aiMessageIndex === -1 || aiMessageIndex === 0) return;

      const userMessage = messages[aiMessageIndex - 1];
      if (userMessage.type !== "user") return;

      setIsAiLoading(true);

      updateDocumentMessages(activeDocumentId, (prev) =>
        prev.filter((msg) => msg.id !== messageId)
      );

      const loadingMessageId = "loading-" + Date.now();
      const loadingMessage: Message = {
        id: loadingMessageId,
        type: "loading",
        content: "Regenerating response...",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      updateDocumentMessages(activeDocumentId, (prev) => [
        ...prev,
        loadingMessage,
      ]);

      try {
        const res = await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: userMessage.content,
            documentId: activeDocumentId,
            workspaceId: workspaceId,
            topK: 5,
          }),
        });

        if (!res.ok) throw new Error("Query failed");
        const data = await res.json();

        const aiResponse: Message = {
          id: Date.now() + 1,
          type: "ai",
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          sources: data.sources,
        };

        updateDocumentMessages(activeDocumentId, (prev) => {
          const newMessages = prev.filter((msg) => msg.id !== loadingMessageId);
          return [...newMessages, aiResponse];
        });
      } catch (err) {
        console.error("Regeneration error:", err);
        updateDocumentMessages(activeDocumentId, (prev) => {
          const newMessages = prev.filter((msg) => msg.id !== loadingMessageId);
          return [
            ...newMessages,
            {
              id: Date.now() + 1,
              type: "ai",
              content: "Sorry, something went wrong regenerating the response.",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ];
        });
      } finally {
        setIsAiLoading(false);
      }
    },
    [
      activeDocumentId,
      workspaceId,
      documentChatHistories,
      updateDocumentMessages,
    ]
  );

  return {
    documentChatHistories,
    inputMessage,
    setInputMessage,
    isAiLoading,
    hoveredMessage,
    setHoveredMessage,
    copiedMessage,
    showQuickActions,
    setShowQuickActions,
    showSuggestions,
    setShowSuggestions,
    currentMessages,
    sendMessage,
    copyMessage,
    reactToMessage,
    regenerateResponse,
    updateDocumentMessages,
  };
};
