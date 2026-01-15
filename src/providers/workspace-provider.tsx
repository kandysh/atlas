"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Workspace as DBWorkspace, User } from "@/src/lib/db/schema";
import {
  getWorkspaces,
  createWorkspace as createWorkspaceAction,
} from "@/src/lib/actions/workspaces";
import { initUser } from "@/src/lib/actions/user";
import { queryKeys } from "@/src/lib/query/keys";

interface WorkspaceContextType {
  currentWorkspace: DBWorkspace | null;
  setCurrentWorkspace: (workspace: DBWorkspace) => void;
  workspaces: DBWorkspace[];
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createWorkspace: (name: string) => Promise<DBWorkspace>;
  isCreatingWorkspace: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentWorkspace, setCurrentWorkspace] =
    useState<DBWorkspace | null>(null);

  // Fetch current user from USERINFO env var using server action
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const result = await initUser();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.user;
    },
    staleTime: Infinity, // User info doesn't change during session
    retry: 2,
  });

  // Fetch workspaces for the user using server action
  const {
    data: workspacesData,
    isLoading: isLoadingWorkspaces,
    error: workspacesError,
    refetch,
  } = useQuery({
    queryKey: user
      ? queryKeys.workspaces.byUser(user.id)
      : ["workspaces", "pending"],
    queryFn: async () => {
      if (!user) return [];
      const result = await getWorkspaces(user.id);
      if (!result.success) {
        throw new Error(result.error || "Failed to load workspaces");
      }
      return result.workspaces || [];
    },
    enabled: !!user, // Only run when user is loaded
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });

  // Mutation to create a new workspace using server action
  const createWorkspaceMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("User not initialized");

      const result = await createWorkspaceAction(name, user.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.workspace;
    },
    onSuccess: (newWorkspace) => {
      // Invalidate and refetch workspaces
      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.byUser(user!.id),
      });
      // Set the new workspace as current
      setCurrentWorkspace(newWorkspace);
    },
  });

  const createWorkspace = useCallback(
    async (name: string) => {
      return createWorkspaceMutation.mutateAsync(name);
    },
    [createWorkspaceMutation]
  );

  const workspaces = workspacesData || [];
  const isLoading = isLoadingUser || isLoadingWorkspaces;
  
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
    if (userError) {
      return userError instanceof Error 
        ? userError.message 
        : "Failed to initialize user";
    }
    if (workspacesError) {
      return workspacesError instanceof Error 
        ? workspacesError.message 
        : "Failed to load workspaces";
    }
    return null;
  }, [userError, workspacesError]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<WorkspaceContextType>(() => ({
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    user: user || null,
    isLoading,
    error,
    refetch: () => { refetch(); },
    createWorkspace,
    isCreatingWorkspace: createWorkspaceMutation.isPending,
  }), [
    currentWorkspace, 
    workspaces, 
    user, 
    isLoading, 
    error, 
    refetch, 
    createWorkspace,
    createWorkspaceMutation.isPending,
  ]);

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
