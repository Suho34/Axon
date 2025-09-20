// utils/getMessageSuggestions.ts
import { MessageSuggestion, Message } from "@/types";

export const getMessageSuggestions = (
  currentMessages: Message[],
  inputMessage: string,
  docTitle: string = ""
): MessageSuggestion[] => {
  const suggestions: MessageSuggestion[] = [];
  const recentMessages = currentMessages
    .slice(-4)
    .filter((m) => m.type !== "loading");
  const lastAiMessage = [...recentMessages]
    .reverse()
    .find((m) => m.type === "ai");
  const lastUserMessage = [...recentMessages]
    .reverse()
    .find((m) => m.type === "user");

  const isResearchDoc =
    docTitle.includes("research") || docTitle.includes("study");
  const isLegalDoc =
    docTitle.includes("legal") || docTitle.includes("contract");
  const isFinancialDoc =
    docTitle.includes("financial") || docTitle.includes("report");

  // If no messages yet, provide introductory suggestions
  if (recentMessages.length === 0) {
    suggestions.push(
      {
        id: "intro-1",
        text: "What is this document about?",
        category: "summary",
        priority: 1,
      },
      {
        id: "intro-2",
        text: "Can you summarize the key points?",
        category: "summary",
        priority: 2,
      },
      {
        id: "intro-3",
        text: "Who is the intended audience for this document?",
        category: "context",
        priority: 3,
      }
    );

    // Document-specific initial questions
    if (isLegalDoc) {
      suggestions.push(
        {
          id: "legal-1",
          text: "What are the main obligations in this contract?",
          category: "analysis",
          priority: 1,
        },
        {
          id: "legal-2",
          text: "Are there any unusual clauses I should be aware of?",
          category: "analysis",
          priority: 2,
        }
      );
    } else if (isResearchDoc) {
      suggestions.push(
        {
          id: "research-1",
          text: "What methodology was used in this study?",
          category: "analysis",
          priority: 1,
        },
        {
          id: "research-2",
          text: "What were the main findings?",
          category: "analysis",
          priority: 2,
        }
      );
    } else if (isFinancialDoc) {
      suggestions.push(
        {
          id: "finance-1",
          text: "What are the key financial metrics?",
          category: "analysis",
          priority: 1,
        },
        {
          id: "finance-2",
          text: "What trends are highlighted in this report?",
          category: "analysis",
          priority: 2,
        }
      );
    }
  }
  // If there's an AI message, provide follow-up options
  else if (lastAiMessage) {
    suggestions.push(
      {
        id: "follow-1",
        text: "Can you explain that in simpler terms?",
        category: "clarification",
        priority: 1,
      },
      {
        id: "follow-2",
        text: "What are the implications of this?",
        category: "deep-dive",
        priority: 2,
      },
      {
        id: "follow-3",
        text: "Can you provide examples?",
        category: "clarification",
        priority: 3,
      },
      {
        id: "follow-4",
        text: "How does this relate to the main topic?",
        category: "connection",
        priority: 4,
      }
    );

    // If the AI message mentioned specific concepts, suggest questions about them
    const aiContent = lastAiMessage.content.toLowerCase();
    if (aiContent.includes("methodology") || aiContent.includes("method")) {
      suggestions.push(
        {
          id: "method-1",
          text: "What are the strengths of this methodology?",
          category: "deep-dive",
          priority: 2,
        },
        {
          id: "method-2",
          text: "Are there any limitations to this approach?",
          category: "deep-dive",
          priority: 3,
        }
      );
    }

    if (aiContent.includes("result") || aiContent.includes("finding")) {
      suggestions.push(
        {
          id: "result-1",
          text: "How significant are these findings?",
          category: "deep-dive",
          priority: 2,
        },
        {
          id: "result-2",
          text: "What further research is needed?",
          category: "deep-dive",
          priority: 3,
        }
      );
    }
  }

  // If user is typing, provide enhancement suggestions
  if (inputMessage.length > 3) {
    const lowerInput = inputMessage.toLowerCase();

    if (lowerInput.includes("what") && !lowerInput.includes("about")) {
      suggestions.push({
        id: "enhance-what",
        text: inputMessage + " and why is it important?",
        category: "deep-dive",
        priority: 1,
      });
    }

    if (lowerInput.includes("how")) {
      suggestions.push({
        id: "enhance-how",
        text: inputMessage + " step by step",
        category: "clarification",
        priority: 1,
      });
    }

    if (lowerInput.includes("compare") || lowerInput.includes("difference")) {
      suggestions.push({
        id: "enhance-compare",
        text: inputMessage + " in a table format",
        category: "comparison",
        priority: 1,
      });
    }
  }

  // Remove duplicates and limit to 6 suggestions
  const uniqueSuggestions = suggestions.filter(
    (s, index, self) => index === self.findIndex((t) => t.text === s.text)
  );

  return uniqueSuggestions.sort((a, b) => a.priority - b.priority).slice(0, 6);
};
