"use client";

import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Workspace as DBWorkspace } from "@/src/lib/db/schema";
import { getWorkspaces } from "@/src/lib/api/workspaces";

interface WorkspaceContextType {
  currentWorkspace: DBWorkspace | null;
  setCurrentWorkspace: (workspace: DBWorkspace) => void;
  workspaces: DBWorkspace[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

// Query key factory for consistency
export const workspaceQueryKeys = {
  all: ["workspaces"] as const,
  user: (userId: string) => ["workspaces", "user", userId] as const,
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // TODO: Get actual user ID from auth session
  const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  
  const [currentWorkspace, setCurrentWorkspace] = useState<DBWorkspace | null>(null);

  // Use React Query for data fetching
  const {
    data: workspacesData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: workspaceQueryKeys.user(userId),
    queryFn: async () => {
      const result = await getWorkspaces(userId);
      if (!result.success) {
        throw new Error(result.error || "Failed to load workspaces");
      }
      return result.workspaces || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - workspaces don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch on every window focus
  });

  const workspaces = workspacesData || [];
  
  // Auto-select first workspace when data loads
  useMemo(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
    
    // Validate current workspace still exists
    if (currentWorkspace && workspaces.length > 0) {
      const stillExists = workspaces.some((w) => w.id === currentWorkspace.id);
      if (!stillExists) {
        setCurrentWorkspace(workspaces[0]);
      }
    }
  }, [workspaces, currentWorkspace]);

  // Compute error message
  const error = useMemo(() => {
    if (queryError) {
      return queryError instanceof Error 
        ? queryError.message 
        : "Failed to load workspaces";
    }
    if (workspaces.length === 0 && !isLoading) {
      return "No workspaces found for this user";
    }
    return null;
  }, [queryError, workspaces.length, isLoading]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<WorkspaceContextType>(() => ({
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    isLoading,
    error,
    refetch: () => { refetch(); },
  }), [currentWorkspace, workspaces, isLoading, error, refetch]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
