'use client';

import { useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useWorkspace } from '@/src/providers';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { workspaces, setCurrentWorkspace, isLoading } = useWorkspace();

  useEffect(() => {
    // Once workspaces are loaded, sync URL with context
    if (!isLoading && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      
      if (workspace) {
        // Set the workspace from URL if it exists
        setCurrentWorkspace(workspace);
      } else {
        // Workspace ID in URL doesn't exist or user doesn't have access
        notFound();
      }
    }
  }, [workspaceId, workspaces, setCurrentWorkspace, isLoading]);

  // Show loading state while validating workspace
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Check if workspace exists
  const workspace = workspaces.find((w) => w.id === workspaceId);
  if (!workspace) {
    notFound();
  }

  return <>{children}</>;
}
