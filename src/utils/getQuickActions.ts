// utils/getQuickActions.ts
import { Message, QuickAction } from "@/types";

export const getQuickActions = (
  docTitle: string = "",
  recentMessages: Message[] = []
): QuickAction[] => {
  const hasConversation = recentMessages.length > 0;
  const lastMessage = recentMessages[recentMessages.length - 1];
  const isResearchDoc =
    docTitle.includes("research") ||
    docTitle.includes("study") ||
    docTitle.includes("paper");
  const isLegalDoc =
    docTitle.includes("legal") ||
    docTitle.includes("contract") ||
    docTitle.includes("law");
  const isFinancialDoc =
    docTitle.includes("financial") ||
    docTitle.includes("report") ||
    docTitle.includes("business");

  // Base actions that are always available
  const baseActions: QuickAction[] = [
    {
      id: "summarize",
      label: "Summarize Document",
      icon: "BookOpen",
      prompt:
        "Please provide a comprehensive summary of this document, highlighting the main points and key takeaways.",
      category: "summary",
      priority: 1,
    },
    {
      id: "key-points",
      label: "Key Points",
      icon: "Zap",
      prompt:
        "What are the most important key points and findings in this document?",
      category: "summary",
      priority: 2,
    },
  ];

  // Contextual actions based on recent conversation
  if (hasConversation && lastMessage && lastMessage.type === "ai") {
    baseActions.push({
      id: "explain-more",
      label: "Explain This More",
      icon: "MessageCircle",
      prompt: `Can you explain this in more detail? "${lastMessage.content.substring(
        0,
        100
      )}..."`,
      category: "clarification",
      priority: 1,
    });

    baseActions.push({
      id: "examples",
      label: "Provide Examples",
      icon: "Lightbulb",
      prompt: "Can you provide some examples or use cases related to this?",
      category: "clarification",
      priority: 2,
    });
  }

  // Document-type specific actions
  if (isLegalDoc) {
    baseActions.push(
      {
        id: "obligations",
        label: "Key Obligations",
        icon: "FileText",
        prompt:
          "What are the key obligations and responsibilities outlined in this document?",
        category: "analysis",
        priority: 1,
      },
      {
        id: "risks",
        label: "Potential Risks",
        icon: "AlertTriangle",
        prompt:
          "Identify any potential risks or liabilities mentioned in this document.",
        category: "analysis",
        priority: 2,
      }
    );
  }

  if (isResearchDoc) {
    baseActions.push(
      {
        id: "methodology",
        label: "Research Methodology",
        icon: "Microscope",
        prompt: "Explain the research methodology used in this study.",
        category: "analysis",
        priority: 1,
      },
      {
        id: "findings",
        label: "Main Findings",
        icon: "BarChart3",
        prompt: "What are the main findings and conclusions of this research?",
        category: "analysis",
        priority: 2,
      }
    );
  }

  if (isFinancialDoc) {
    baseActions.push(
      {
        id: "metrics",
        label: "Key Metrics",
        icon: "TrendingUp",
        prompt:
          "What are the key financial metrics and performance indicators in this report?",
        category: "analysis",
        priority: 1,
      },
      {
        id: "recommendations",
        label: "Recommendations",
        icon: "ThumbsUp",
        prompt:
          "What recommendations or action items are suggested in this document?",
        category: "analysis",
        priority: 2,
      }
    );
  }

  // Add action to generate questions if no conversation has started
  if (!hasConversation) {
    baseActions.push({
      id: "generate-questions",
      label: "Suggest Questions",
      icon: "HelpCircle",
      prompt:
        "What questions should I ask about this document to better understand it?",
      category: "exploration",
      priority: 3,
    });
  }

  // Sort by priority and return
  return baseActions.sort((a, b) => a.priority - b.priority).slice(0, 6);
};
