"use client";

import { useWorkspace } from "@/src/providers";
import { ReactNode } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface WorkspaceLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WorkspaceLoader({ children, fallback }: WorkspaceLoaderProps) {
  const { isLoading, error, refetch } = useWorkspace();

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4 text-center" role="status" aria-live="polite">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      )
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="space-y-4 text-center max-w-md" role="alert" aria-live="assertive">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight">Unable to Load Workspace</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="default"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
