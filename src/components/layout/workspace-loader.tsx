'use client';

import { useWorkspace } from '@/src/providers';
import { ReactNode, useState } from 'react';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { logger } from '@/src/lib/logger/logger';

interface WorkspaceLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WorkspaceLoader({ children, fallback }: WorkspaceLoaderProps) {
  const {
    isLoading,
    error,
    refetch,
    workspaces,
    user,
    createWorkspace,
    isCreatingWorkspace,
  } = useWorkspace();
  const [workspaceName, setWorkspaceName] = useState('');

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;

    try {
      await createWorkspace(workspaceName.trim());
      setWorkspaceName('');
    } catch (error) {
      logger.error({ workspaceName, error }, 'Failed to create workspace');
    }
  };

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div
            className="space-y-4 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">
              Loading workspace...
            </p>
          </div>
        </div>
      )
    );
  }

  // Show error for critical failures
  if (error && workspaces.length === 0 && !error.includes('No workspaces')) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="space-y-4 text-center max-w-md"
          role="alert"
          aria-live="assertive"
        >
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Unable to Load Workspace
            </h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => refetch()} variant="default" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show create workspace screen if no workspaces exist
  if (workspaces.length === 0 && user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="space-y-6 text-center max-w-md">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome to Atlas
            </h2>
            <p className="text-sm text-muted-foreground">
              Get started by creating your first workspace
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Workspace name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && workspaceName.trim()) {
                  handleCreateWorkspace();
                }
              }}
              disabled={isCreatingWorkspace}
            />
            <Button
              onClick={handleCreateWorkspace}
              disabled={!workspaceName.trim() || isCreatingWorkspace}
              className="w-full"
            >
              {isCreatingWorkspace ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
