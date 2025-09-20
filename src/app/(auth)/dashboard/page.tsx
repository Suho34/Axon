"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Settings,
  User,
  FolderOpen,
  Loader2,
  Trash2Icon,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import SignOutButton from "@/components/SignOutButton";
import Image from "next/image";

// Interface for the data received directly from the API
interface ApiWorkspace {
  _id: string;
  name: string;
  createdAt: string; // The API returns an ISO date string
  role: "admin" | "member";
  documentCount?: number;
}

// Interface for the transformed data used in the component state
interface Workspace {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  role: "admin" | "member";
  documentCount?: number;
  lastAccessed?: string;
}

const AxonDashboard = () => {
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workspaceToDeleteId, setWorkspaceToDeleteId] = useState<string | null>(
    null
  );
  const [workspaceName, setWorkspaceName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch workspaces from API
  const fetchWorkspaces = async () => {
    try {
      setIsLoadingWorkspaces(true);
      const response = await fetch(`/api/workspaces`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch workspaces:", data.error);
        toast.error("Failed to fetch workspaces");
        return;
      }

      // Use the new ApiWorkspace interface to type the incoming data
      const transformedWorkspaces: Workspace[] = data.workspaces.map(
        (ws: ApiWorkspace) => ({
          _id: ws._id,
          name: ws.name,
          createdAt: new Date(ws.createdAt).toISOString().split("T")[0],
          role: ws.role,
          documentCount: ws.documentCount || Math.floor(Math.random() * 20),
        })
      );

      setWorkspaces(transformedWorkspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to fetch workspaces");
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  // Fetch workspaces on component mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceName.trim()) {
      return;
    }

    setIsCreatingWorkspace(true);

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(
          "Error creating workspace:",
          data.error || "Failed to create workspace"
        );
        toast.error(data.error || "Failed to create workspace");
        return;
      }

      const newWorkspace: Workspace = {
        _id: data.workspace._id,
        name: data.workspace.name,
        createdAt: new Date(data.workspace.createdAt)
          .toISOString()
          .split("T")[0],
        role: "admin",
        documentCount: 0,
        lastAccessed: "Just now",
      };

      setWorkspaces((prev) => [...prev, newWorkspace]);
      setWorkspaceName("");
      setShowCreateWorkspace(false);

      toast.success(`Workspace "${data.workspace.name}" created successfully!`);
    } catch (err) {
      console.error(
        "Error creating workspace:",
        err instanceof Error ? err.message : "Something went wrong"
      );
      toast.error("Failed to create workspace");
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    setWorkspaceToDeleteId(workspaceId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!workspaceToDeleteId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/workspaces?id=${workspaceToDeleteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to delete workspace");
        return;
      }

      setWorkspaces((prev) =>
        prev.filter((ws) => ws._id !== workspaceToDeleteId)
      );
      toast.success("Workspace deleted successfully");
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace");
    } finally {
      setShowDeleteConfirm(false);
      setWorkspaceToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setWorkspaceToDeleteId(null);
  };

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                  <Image
                    src="/axon.svg"
                    width={20}
                    height={20}
                    alt="logo of the app"
                  />
                </div>
                <h1 className="text-xl font-light tracking-wide">Axon</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 w-64 placeholder-gray-500"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition-colors duration-300">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors duration-300">
                <User className="w-5 h-5" />
              </button>
              <div className="p-2 text-gray-400 hover:text-white transition-colors duration-300">
                <SignOutButton />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-white/10 py-4 px-4">
            <div className="flex flex-col space-y-4">
              <button className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 py-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 py-2">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 py-2">
                <SignOutButton />
                <span>Sign Out</span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-light text-white mb-1">
                Workspaces
              </h2>
              <p className="text-gray-400 text-xs md:text-sm">
                Organize your documents and AI analysis sessions
              </p>
            </div>
            <button
              onClick={() => setShowCreateWorkspace(true)}
              className="flex items-center justify-center sm:justify-start space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm font-medium w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>
          </div>

          {isLoadingWorkspaces && (
            <div className="flex items-center justify-center py-12 md:py-16">
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading workspaces...</span>
              </div>
            </div>
          )}

          {!isLoadingWorkspaces && workspaces.length === 0 && (
            <div className="text-center py-12 md:py-16">
              <FolderOpen className="w-10 h-10 md:w-12 md:h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-300 mb-2">
                No workspaces yet
              </h3>
              <p className="text-gray-500 mb-6 text-xs md:text-sm">
                Create your first workspace to get started organizing your
                documents.
              </p>
              <button
                onClick={() => setShowCreateWorkspace(true)}
                className="flex items-center justify-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm font-medium mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Workspace</span>
              </button>
            </div>
          )}

          {!isLoadingWorkspaces && workspaces.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredWorkspaces.map((workspace) => (
                <div
                  key={workspace._id}
                  className="bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 hover:bg-white/10 transition-all duration-300 group shadow-md max-w-sm mx-auto sm:mx-0 w-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-lg md:rounded-xl flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="max-w-[120px] md:max-w-none">
                        <h3 className="text-base md:text-lg font-semibold text-white truncate">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              workspace.role === "admin"
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-700 text-gray-400"
                            }`}
                          >
                            {workspace.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-3">
                      {workspace.role === "admin" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkspace(workspace._id);
                          }}
                          className="text-gray-500 hover:text-red-400 transition-colors duration-300 opacity-70 group-hover:opacity-100 p-1"
                          title="Delete workspace"
                        >
                          <Trash2Icon className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}

                      <a
                        href={`/workspace/${workspace._id}`}
                        className="text-xs md:text-sm text-blue-400 hover:underline whitespace-nowrap"
                      >
                        Open →
                      </a>
                    </div>
                  </div>

                  <div className="mt-3 md:mt-4 text-xs text-gray-400">
                    Created {workspace.createdAt}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoadingWorkspaces &&
            workspaces.length > 0 &&
            filteredWorkspaces.length === 0 && (
              <div className="text-center py-12 md:py-16">
                <Search className="w-10 h-10 md:w-12 md:h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-300 mb-2">
                  No matching workspaces
                </h3>
                <p className="text-gray-500 text-xs md:text-sm">
                  Try adjusting your search terms
                </p>
              </div>
            )}

          {showCreateWorkspace && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
              <div className="bg-black border border-white/10 rounded-lg max-w-md w-full p-4 md:p-6">
                <h3 className="text-lg font-medium text-white mb-4">
                  Create New Workspace
                </h3>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-gray-400 mb-2">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white placeholder-gray-500 transition-all duration-300"
                      placeholder="Enter workspace name"
                      disabled={isCreatingWorkspace}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateWorkspace(false);
                        setWorkspaceName("");
                      }}
                      disabled={isCreatingWorkspace}
                      className="flex-1 px-4 py-2.5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingWorkspace || !workspaceName.trim()}
                      className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                    >
                      {isCreatingWorkspace ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        "Create Workspace"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
              <div className="bg-black border border-white/10 rounded-lg max-w-sm w-full p-4 md:p-6 text-center">
                <Trash2Icon className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-medium text-white mb-2">
                  Delete Workspace?
                </h3>
                <p className="text-gray-400 text-xs md:text-sm mb-6">
                  This action cannot be undone. All documents and data within
                  this workspace will be permanently deleted.
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2.5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AxonDashboard;
