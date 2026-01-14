"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  workspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

// Mock data - replace with API call
const mockWorkspaces: Workspace[] = [
  { id: "1", name: "Personal Projects", slug: "personal", plan: "free" },
  { id: "2", name: "Work Tasks", slug: "work", plan: "pro" },
  { id: "3", name: "Side Hustle", slug: "side-hustle", plan: "free" },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    mockWorkspaces[0]
  );
  const [workspaces] = useState<Workspace[]>(mockWorkspaces);

  return (
    <WorkspaceContext.Provider
      value={{ currentWorkspace, setCurrentWorkspace, workspaces }}
    >
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
