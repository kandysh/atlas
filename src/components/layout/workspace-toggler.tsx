'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Plus, Check, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useWorkspace } from '@/src/providers/workspace-provider';
import { useSidebar } from '@/src/components/ui/sidebar';
import { toast } from 'sonner';

export function WorkspaceToggler() {
  const router = useRouter();
  const {
    currentWorkspace,
    setCurrentWorkspace,
    workspaces,
    createWorkspace,
    isCreatingWorkspace,
  } = useWorkspace();
  const { state } = useSidebar();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  if (!currentWorkspace) return null;

  const handleWorkspaceChange = (workspace: (typeof workspaces)[0]) => {
    setCurrentWorkspace(workspace);
    setOpen(false);
    
    // Navigate to the new workspace's active page
    router.push(`/${workspace.slug}`);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    try {
      const newWorkspace = await createWorkspace(newWorkspaceName.trim());
      toast.success(`Workspace "${newWorkspaceName}" created`);
      setDialogOpen(false);
      setNewWorkspaceName('');
      setOpen(false);
      
      // Navigate to the new workspace
      router.push(`/${newWorkspace.slug}`);
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  const getWorkspaceInfo = (workspace: (typeof workspaces)[0]) => {
    return workspace.slug;
  };

  const isCollapsed = state === 'collapsed';

  const workspaceListContent = (
    <>
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
                {getWorkspaceInfo(workspace)}
              </p>
            </div>
            {currentWorkspace.id === workspace.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>
        </DropdownMenuItem>
      ))}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          setOpen(false);
          setDialogOpen(true);
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        <span>Create New Workspace</span>
      </DropdownMenuItem>
    </>
  );

  // When collapsed, show only the avatar
  if (isCollapsed) {
    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-center h-auto p-2 hover:bg-accent"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {currentWorkspace.name.charAt(0)}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64" align="start" side="right">
            {workspaceListContent}
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your tasks and projects.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="My Workspace"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateWorkspace();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateWorkspace}
                disabled={isCreatingWorkspace}
              >
                {isCreatingWorkspace && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Expanded state
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-3 hover:bg-accent"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {currentWorkspace.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {currentWorkspace.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getWorkspaceInfo(currentWorkspace)}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align="start" side="right">
          {workspaceListContent}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your tasks and projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                placeholder="My Workspace"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateWorkspace();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={isCreatingWorkspace}
            >
              {isCreatingWorkspace && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
