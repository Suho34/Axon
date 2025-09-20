"use client";

import React, { useEffect, useRef } from "react";
import {
  Upload,
  Loader2,
  Send,
  Building,
  FileText,
  X,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Clock,
  Zap,
  BookOpen,
  Search,
  PenTool,
  BarChart3,
  Check,
  ArrowRight,
  Lightbulb,
  MessageCircle,
  AlertTriangle,
  Microscope,
  TrendingUp,
  HelpCircle,
  FileText as FileTextIcon,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatProvider, useChatContext } from "@/contexts/ChatContext";
import { getQuickActions } from "@/utils/getQuickActions";
import { getMessageSuggestions } from "@/utils/getMessageSuggestions";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  DocumentListSkeleton,
  MessageSkeleton,
} from "@/components/LoadingSkeletons";
import { MessageSuggestion, QuickActionWithIcon } from "@/types";

// Icon mapping for quick actions
const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  PenTool: <PenTool className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  MessageCircle: <MessageCircle className="w-4 h-4" />,
  AlertTriangle: <AlertTriangle className="w-4 h-4" />,
  Microscope: <Microscope className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  HelpCircle: <HelpCircle className="w-4 h-4" />,
  FileText: <FileTextIcon className="w-4 h-4" />,
  Lightbulb: <Lightbulb className="w-4 h-4" />,
};

const WorkspaceContent: React.FC = () => {
  const {
    workspace: {
      workspaceId,
      workspaceName,
      documents,
      activeDocumentId,
      setActiveDocumentId,
      isLoading: isWorkspaceLoading,
    },
    chat: {
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
    },
    upload: {
      selectedFile,
      isUploading,
      uploadMessage,
      handleFileUpload,
      pollEmbeddingStatus,
      onFileChange,
      removeSelectedFile,
    },
  } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const activeDocument = documents.find((doc) => doc._id === activeDocumentId);
  const docTitle = activeDocument?.title.toLowerCase() || "";

  // Map the quick actions to include React icon elements
  const quickActions = getQuickActions(docTitle, currentMessages).map(
    (action) => {
      const iconElement = iconMap[action.icon] || <Zap className="w-4 h-4" />;

      return {
        ...action,
        iconElement,
      };
    }
  );

  const messageSuggestions = getMessageSuggestions(
    currentMessages,
    inputMessage,
    docTitle
  );

  const handleDocumentSelect = (documentId: string) => {
    setActiveDocumentId(documentId);
    setShowQuickActions(false);
    setShowSuggestions(false);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSuggestionClick = (suggestion: MessageSuggestion) => {
    setInputMessage(suggestion.text);
    setShowSuggestions(false);
  };

  const handleQuickAction = (action: QuickActionWithIcon) => {
    setInputMessage(action.prompt);
    setShowQuickActions(false);
    setShowSuggestions(false);
  };

  const handleUpload = async () => {
    try {
      const documentId = await handleFileUpload((newDocument) => {
        // In a real implementation, this would update the workspace context
        documents.unshift(newDocument);
        setActiveDocumentId(newDocument._id);
      });

      if (documentId) {
        // Start polling for embedding status
        pollEmbeddingStatus(documentId, (docId, status) => {
          // Update document status
          const updatedDocs = documents.map((doc) =>
            doc._id === docId ? { ...doc, uploadStatus: status } : doc
          );
          // This would typically update the workspace context
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const getFullTimestamp = (timestamp: string) => {
    return `Today ${timestamp}`;
  };

  return (
    // CHANGE: Added lg:gap-6 to create space between sidebar and main content on desktop
    <div className="flex h-screen bg-black text-white lg:gap-6">
      {/* Mobile Sidebar Toggle */}
      {/* CHANGE: Moved from left-4 to right-4 */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-80 border-r border-gray-800 bg-black p-6 flex flex-col fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Building className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm sm:text-base">
                {workspaceName}
              </h2>
              <p className="text-xs text-gray-400">
                ID: {workspaceId.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <h3 className="font-medium text-sm mb-4 text-gray-400 uppercase tracking-wide">
            Upload Document
          </h3>

          {!selectedFile ? (
            <label className="block border-2 border-dashed border-gray-800 rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-gray-900/50">
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-blue-900/30 rounded-full">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <p className="text-sm font-medium text-gray-200">
                  Select PDF file
                </p>
                <p className="text-xs text-gray-500">Max 10MB</p>
              </div>
            </label>
          ) : (
            <div className="border border-gray-800 rounded-xl p-3 sm:p-4 bg-gray-900/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-blue-900/30 rounded-lg">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white truncate max-w-[100px] sm:max-w-[140px]">
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  onClick={removeSelectedFile}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm sm:text-base"
              >
                {isUploading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
                ) : (
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                )}
                Upload File
              </Button>
            </div>
          )}

          {uploadMessage && (
            <div
              className={`mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                uploadMessage.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-red-900/30 text-red-400 border border-red-800"
              }`}
            >
              {uploadMessage.text}
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-hidden">
          <h3 className="font-medium text-sm mb-4 text-gray-400 uppercase tracking-wide">
            Documents
          </h3>
          <div className="overflow-y-auto h-full pr-2">
            {isWorkspaceLoading ? (
              <DocumentListSkeleton />
            ) : documents.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm text-gray-500">No documents yet</p>
                <p className="text-xs text-gray-600 mt-1">
                  Upload your first PDF to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const hasMessages = currentMessages.length > 0;
                  return (
                    <div
                      key={doc._id}
                      className={`p-2 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                        activeDocumentId === doc._id
                          ? "bg-blue-900/20 border-blue-700 shadow-lg shadow-blue-900/10"
                          : "bg-gray-900/30 border-gray-800 hover:border-gray-700"
                      }`}
                      onClick={() => handleDocumentSelect(doc._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className={`p-1 sm:p-2 rounded-lg ${
                              doc.uploadStatus === "completed"
                                ? "bg-green-900/30 text-green-400"
                                : doc.uploadStatus === "processing" ||
                                  doc.uploadStatus === "uploading"
                                ? "bg-blue-900/30 text-blue-400"
                                : doc.uploadStatus === "failed"
                                ? "bg-red-900/30 text-red-400"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[160px]">
                              {doc.title || "Untitled Document"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                            activeDocumentId === doc._id
                              ? "text-blue-400 rotate-90"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2 sm:mt-3">
                        <span
                          className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full capitalize ${
                            doc.uploadStatus === "completed"
                              ? "bg-green-900/30 text-green-400"
                              : doc.uploadStatus === "processing" ||
                                doc.uploadStatus === "uploading"
                              ? "bg-blue-900/30 text-blue-400"
                              : doc.uploadStatus === "failed"
                              ? "bg-red-900/30 text-red-400"
                              : "bg-gray-800 text-gray-400"
                          }`}
                        >
                          {doc.uploadStatus}
                        </span>
                        <span className="text-xs text-gray-500">
                          {isClient &&
                            new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-black">
        {/* Header */}
        {/* CHANGE: Centered content on mobile, justify-between on desktop */}
        <div className="p-4 sm:p-6 border-b border-gray-800 bg-black flex items-center justify-center lg:justify-between">
          {/* CHANGE: Centered text on mobile, left-aligned on desktop */}
          <div className="text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl font-light text-white">
              Document Analysis
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {activeDocument
                ? `Analyzing: ${
                    activeDocument.title.length > 20
                      ? activeDocument.title.substring(0, 20) + "..."
                      : activeDocument.title
                  }`
                : "Select a document to start analyzing"}
            </p>
          </div>
          {/* CHANGE: Hidden on mobile, flex on desktop */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3">
            {activeDocumentId &&
              activeDocument?.uploadStatus === "completed" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowQuickActions(!showQuickActions);
                    setShowSuggestions(false);
                  }}
                  className={`border-gray-700 text-xs sm:text-sm ${
                    showQuickActions
                      ? "bg-blue-900/20 text-blue-300 border-blue-600"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Quick Actions
                </Button>
              )}
          </div>
        </div>

        {/* Enhanced Quick Actions Panel */}
        {showQuickActions && activeDocumentId && (
          <div className="p-3 sm:p-4 border-b border-gray-800 bg-gray-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <h3 className="font-medium text-white text-sm sm:text-base">
                Quick Actions
              </h3>
              <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
                Click to instantly ask about this document
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="text-left p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-blue-500 transition-all group flex flex-col"
                >
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <div className="text-blue-400">{action.iconElement}</div>
                    <span className="text-xs sm:text-sm font-medium text-white group-hover:text-blue-300">
                      {action.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {action.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Message Suggestions */}
        {showSuggestions && messageSuggestions.length > 0 && (
          <div className="p-3 sm:p-4 border-b border-gray-800 bg-gray-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <h3 className="text-xs sm:text-sm font-medium text-white">
                Suggested Questions
              </h3>
              <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
                Click to use these questions
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
              {messageSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-2 sm:p-3 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800 hover:border-blue-500 transition-all group flex items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-200 group-hover:text-white">
                        {suggestion.text}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2" />
                    </div>
                    <div className="mt-1 sm:mt-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full capitalize ${
                          suggestion.category === "summary"
                            ? "bg-blue-900/30 text-blue-400"
                            : suggestion.category === "analysis"
                            ? "bg-purple-900/30 text-purple-400"
                            : suggestion.category === "clarification"
                            ? "bg-green-900/30 text-green-400"
                            : suggestion.category === "deep-dive"
                            ? "bg-orange-900/30 text-orange-400"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {suggestion.category.replace("-", " ")}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-black">
          {currentMessages.length === 0 && !activeDocumentId ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-md p-6 sm:p-8 bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-800 shadow-lg">
                <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl font-light text-white mb-2 sm:mb-3">
                  Welcome to Document Analysis
                </h2>
                <p className="text-gray-400 text-sm sm:text-base">
                  Upload a PDF document or select an existing one to start
                  analyzing its content.
                </p>
              </div>
            </div>
          ) : currentMessages.length === 0 && activeDocumentId ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-md p-6 sm:p-8 bg-gray-900 rounded-xl sm:rounded-2xl border border-blue-800 shadow-lg">
                <Send className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl font-light text-white mb-2 sm:mb-3">
                  Ready to Analyze
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                  Ask questions about &quot;
                  {activeDocument?.title && activeDocument.title.length > 13
                    ? activeDocument.title.substring(0, 13) + "..."
                    : activeDocument?.title}
                  &quot; to get started.
                </p>
                {activeDocument?.uploadStatus === "completed" && (
                  <Button
                    onClick={() => setShowQuickActions(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                  >
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Try Quick Actions
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <ErrorBoundary>
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  } group`}
                  onMouseEnter={() => setHoveredMessage(msg.id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  <div
                    className={`max-w-xs sm:max-w-sm md:max-w-2xl p-3 sm:p-4 rounded-xl sm:rounded-2xl relative ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                        : msg.type === "loading"
                        ? "bg-gray-800 border border-gray-700 shadow-lg text-white"
                        : "bg-gray-900 border border-gray-800 shadow-lg text-white"
                    }`}
                  >
                    {msg.type === "loading" ? (
                      <MessageSkeleton />
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm sm:text-base">
                          {msg.content}
                        </p>

                        {/* Message Actions */}
                        {hoveredMessage === msg.id && (
                          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 bg-black/60 rounded-lg p-1 backdrop-blur-sm">
                            <button
                              onClick={() => copyMessage(msg.content, msg.id)}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title="Copy message"
                            >
                              {copiedMessage === msg.id ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-300" />
                              )}
                            </button>

                            {msg.type === "ai" && (
                              <>
                                <button
                                  onClick={() => regenerateResponse(msg.id)}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                  title="Regenerate response"
                                  disabled={isAiLoading}
                                >
                                  <RefreshCw className="w-3 h-3 text-gray-300" />
                                </button>

                                <div className="flex items-center gap-1 border-l border-gray-600 pl-1 ml-1">
                                  <button
                                    onClick={() =>
                                      reactToMessage(msg.id, "like")
                                    }
                                    className={`p-1 hover:bg-white/10 rounded transition-colors ${
                                      msg.reaction === "like"
                                        ? "text-green-400"
                                        : "text-gray-300"
                                    }`}
                                    title="Like response"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      reactToMessage(msg.id, "dislike")
                                    }
                                    className={`p-1 hover:bg-white/10 rounded transition-colors ${
                                      msg.reaction === "dislike"
                                        ? "text-red-400"
                                        : "text-gray-300"
                                    }`}
                                    title="Dislike response"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Timestamp with hover tooltip */}
                        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                          <span
                            className={`block text-xs ${
                              msg.type === "user"
                                ? "text-blue-200"
                                : "text-gray-500"
                            } cursor-pointer flex items-center gap-1`}
                            title={getFullTimestamp(msg.timestamp)}
                          >
                            <Clock className="w-3 h-3" />
                            {msg.timestamp}
                          </span>

                          {/* Reaction indicator */}
                          {msg.reaction && (
                            <span className="text-xs flex items-center gap-1">
                              {msg.reaction === "like" ? (
                                <ThumbsUp className="w-3 h-3 text-green-400" />
                              ) : (
                                <ThumbsDown className="w-3 h-3 text-red-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}

                    {/* Sources */}
                    {msg.type === "ai" && msg.sources && (
                      <div className="mt-3 sm:mt-4 space-y-2 text-xs">
                        <p className="font-medium text-gray-400 flex items-center gap-2">
                          <BookOpen className="w-3 h-3" />
                          Sources:
                        </p>
                        {msg.sources.map((src) => (
                          <div
                            key={src.chunkId}
                            className="p-2 sm:p-3 border rounded-lg sm:rounded-xl bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors"
                          >
                            <p className="font-medium text-white flex items-center gap-2">
                              <FileText className="w-3 h-3 text-blue-400" />
                              {src.documentTitle}{" "}
                              {src.pageNumber && (
                                <span className="text-blue-400">
                                  (p. {src.pageNumber})
                                </span>
                              )}
                            </p>
                            <p className="text-gray-400 mt-1 leading-relaxed text-xs sm:text-sm">
                              &quot;{src.text.substring(0, 120)}...&quot;
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </ErrorBoundary>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-black">
          <div className="p-4 sm:p-6 flex items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder={
                  activeDocumentId
                    ? `Ask something about ${
                        activeDocument?.title &&
                        activeDocument.title.length > 13
                          ? activeDocument.title.substring(0, 13) + "..."
                          : activeDocument?.title
                      }...`
                    : "Select a document to start chatting..."
                }
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Show suggestions when user starts typing on desktop
                  if (
                    window.innerWidth >= 1024 &&
                    e.target.value.length > 2 &&
                    !showSuggestions
                  ) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                    setShowQuickActions(false);
                  }
                }}
                onFocus={() => {
                  // CHANGE: Only auto-show panels on desktop screens
                  if (window.innerWidth >= 1024) {
                    setShowSuggestions(true);
                    if (!inputMessage) {
                      setShowQuickActions(true);
                    }
                  }
                }}
                disabled={isAiLoading || !activeDocumentId}
                className="flex-1 text-white bg-gray-900 border-gray-700 focus:border-blue-500 rounded-lg sm:rounded-xl h-10 sm:h-12 pr-24 text-sm sm:text-base"
              />
              {activeDocumentId &&
                activeDocument?.uploadStatus === "completed" && (
                  // CHANGE: Added manual trigger icons for suggestions/actions on mobile
                  <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className={`p-1.5 rounded-md lg:hidden transition-colors ${
                        showSuggestions
                          ? "bg-blue-900/50 text-blue-300"
                          : "text-gray-400 hover:text-white"
                      }`}
                      aria-label="Toggle suggestions"
                    >
                      <Lightbulb className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className={`p-1.5 rounded-md lg:hidden transition-colors ${
                        showQuickActions
                          ? "bg-blue-900/50 text-blue-300"
                          : "text-gray-400 hover:text-white"
                      }`}
                      aria-label="Toggle quick actions"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </div>
                )}
            </div>
            <Button
              onClick={sendMessage}
              disabled={isAiLoading || !inputMessage}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors text-white h-10 sm:h-12 w-10 sm:w-12 p-0 flex-shrink-0"
              aria-label="Send message"
            >
              {isAiLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main component export
const Workspace: React.FC = () => (
  <ChatProvider>
    <WorkspaceContent />
  </ChatProvider>
);

export default Workspace;
