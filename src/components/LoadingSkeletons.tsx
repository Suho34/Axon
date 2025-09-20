// components/LoadingSkeletons.tsx
import React from "react";

export const DocumentListSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3 rounded-xl border border-gray-800 bg-gray-900/30 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
              <div className="flex flex-col">
                <div className="w-32 h-4 bg-gray-700 rounded"></div>
                <div className="w-16 h-3 bg-gray-800 rounded mt-2"></div>
              </div>
            </div>
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="w-16 h-4 bg-gray-700 rounded-full"></div>
            <div className="w-12 h-3 bg-gray-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow-lg w-full">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          <div className="w-32 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ChatAreaSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full text-center">
      <div className="max-w-md p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-lg">
        <div className="w-12 h-12 bg-blue-500/30 rounded-full mx-auto mb-4"></div>
        <div className="w-48 h-6 bg-gray-700 rounded mx-auto mb-3"></div>
        <div className="w-64 h-4 bg-gray-800 rounded mx-auto"></div>
      </div>
    </div>
  );
};
