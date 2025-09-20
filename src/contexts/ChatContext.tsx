// contexts/ChatContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useChat } from "@/hooks/useChat";
import { useUpload } from "@/hooks/useUpload";

interface ChatContextType {
  workspace: ReturnType<typeof useWorkspace>;
  chat: ReturnType<typeof useChat>;
  upload: ReturnType<typeof useUpload>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const workspace = useWorkspace();
  const chat = useChat(workspace.workspaceId, workspace.activeDocumentId);
  const upload = useUpload(workspace.workspaceId);

  return (
    <ChatContext.Provider value={{ workspace, chat, upload }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
