// types/index.ts
export interface Message {
  id: number | string;
  type: "user" | "ai" | "loading";
  content: string;
  timestamp: string;
  reaction?: "like" | "dislike" | null;
  sources?: Array<{
    chunkId: string;
    documentTitle: string;
    pageNumber?: number;
    text: string;
  }>;
}

export interface Document {
  _id: string;
  title: string;
  uploadStatus: string;
  workspaceId: string;
  createdAt: string;
}

export interface DocumentChatHistories {
  [documentId: string]: Message[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
  category:
    | "summary"
    | "analysis"
    | "search"
    | "custom"
    | "clarification"
    | "exploration";
  priority: number;
}

export interface MessageSuggestion {
  id: string;
  text: string;
  category:
    | "follow-up"
    | "clarification"
    | "deep-dive"
    | "comparison"
    | "summary"
    | "analysis"
    | "context"
    | "connection";
  priority: number;
}

export interface QuickActionWithIcon extends QuickAction {
  iconElement: React.ReactNode; // Add this for the actual React icon component
}
