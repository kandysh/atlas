"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronsUpDown,
  Plus,
  Check,
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/providers/workspace-provider";

export function WorkspaceToggler() {
  const { currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspace();
  const [open, setOpen] = useState(false);

  if (!currentWorkspace) return null;

  const handleWorkspaceChange = (workspace: typeof workspaces[0]) => {
    setCurrentWorkspace(workspace);
    setOpen(false);
    // TODO: Redirect to workspace route
    // window.location.href = `/${workspace.slug}`;
  };

  const getPlanDisplay = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1) + " Plan";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-3 px-3 hover:bg-accent"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary">
                {currentWorkspace.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate">
                {currentWorkspace.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getPlanDisplay(currentWorkspace.plan)}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="start" side="right">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Workspaces
          </p>
        </div>

        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceChange(workspace)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {workspace.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  {getPlanDisplay(workspace.plan)}
                </p>
              </div>
              {currentWorkspace.id === workspace.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          <span>Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
