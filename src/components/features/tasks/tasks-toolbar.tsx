"use client";

import { Table } from "@tanstack/react-table";
import { Task, Status, Priority } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { 
  Plus, 
  Search, 
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";

interface TasksToolbarProps {
  table: Table<Task>;
  uniqueOwners: string[];
  uniqueAssetClasses: string[];
  onAddTask?: () => void;
  onDeleteSelected?: (selectedIds: string[]) => void;
}

const statusLabels: Record<Status, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "testing": "Testing",
  "done": "Done",
  "completed": "Completed",
  "blocked": "Blocked",
};

const priorityLabels: Record<Priority, string> = {
  "low": "Low",
  "medium": "Medium",
  "high": "High",
  "urgent": "Urgent",
};

export function TasksToolbar({
  table,
  uniqueOwners,
  uniqueAssetClasses,
  onAddTask,
  onDeleteSelected,
}: TasksToolbarProps) {
  const selectedRowCount = Object.keys(table.getState().rowSelection).length;
  const globalFilter = table.getState().globalFilter ?? "";

  const statusColumn = table.getColumn("status");
  const priorityColumn = table.getColumn("priority");
  const ownerColumn = table.getColumn("owner");
  const assetClassColumn = table.getColumn("assetClass");

  const statusFilter = (statusColumn?.getFilterValue() as string[]) ?? [];
  const priorityFilter = (priorityColumn?.getFilterValue() as string[]) ?? [];
  const ownerFilter = (ownerColumn?.getFilterValue() as string[]) ?? [];
  const assetClassFilter = (assetClassColumn?.getFilterValue() as string[]) ?? [];

  const statuses: Status[] = ["todo", "in-progress", "testing", "done", "completed", "blocked"];
  const priorities: Priority[] = ["low", "medium", "high", "urgent"];

  const totalFilters = statusFilter.length + priorityFilter.length + ownerFilter.length + assetClassFilter.length;

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(table.getState().rowSelection);
    onDeleteSelected?.(selectedIds);
    table.resetRowSelection();
  };

  const handleStatusToggle = (value: Status) => {
    const current = statusFilter;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    statusColumn?.setFilterValue(updated.length > 0 ? updated : undefined);
  };

  const handlePriorityToggle = (value: Priority) => {
    const current = priorityFilter;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    priorityColumn?.setFilterValue(updated.length > 0 ? updated : undefined);
  };

  const handleOwnerToggle = (value: string) => {
    const current = ownerFilter;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    ownerColumn?.setFilterValue(updated.length > 0 ? updated : undefined);
  };

  const handleAssetClassToggle = (value: string) => {
    const current = assetClassFilter;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    assetClassColumn?.setFilterValue(updated.length > 0 ? updated : undefined);
  };

  const clearAllFilters = () => {
    statusColumn?.setFilterValue(undefined);
    priorityColumn?.setFilterValue(undefined);
    ownerColumn?.setFilterValue(undefined);
    assetClassColumn?.setFilterValue(undefined);
  };

  const getFilterLabel = (count: number, singular: string) => {
    if (count === 0) return singular;
    if (count === 1) return `1 ${singular}`;
    return `${count} ${singular}s`;
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Search + Filters */}
      <div className="flex flex-1 items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              statusFilter.length > 0 
                ? "bg-accent/50 border-accent-foreground/20 text-foreground" 
                : "border-input bg-background text-muted-foreground"
            )}>
              <span className="status-dot status-todo" />
              <span>{statusFilter.length > 0 ? getFilterLabel(statusFilter.length, "status") : "Status"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter.includes(status)}
                onCheckedChange={() => handleStatusToggle(status)}
                className="gap-2"
              >
                <span className={`status-dot status-${status}`} />
                {statusLabels[status]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              priorityFilter.length > 0 
                ? "bg-accent/50 border-accent-foreground/20 text-foreground" 
                : "border-input bg-background text-muted-foreground"
            )}>
              <span className="priority-dot priority-medium" />
              <span>{priorityFilter.length > 0 ? getFilterLabel(priorityFilter.length, "priority") : "Priority"}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {priorities.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={priorityFilter.includes(priority)}
                onCheckedChange={() => handlePriorityToggle(priority)}
                className="gap-2"
              >
                <span className={`priority-dot priority-${priority}`} />
                {priorityLabels[priority]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Owner Filter */}
        {uniqueOwners.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                ownerFilter.length > 0 
                  ? "bg-accent/50 border-accent-foreground/20 text-foreground" 
                  : "border-input bg-background text-muted-foreground"
              )}>
              <span>{ownerFilter.length > 0 ? getFilterLabel(ownerFilter.length, "owner") : "Owner"}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-auto">
              {uniqueOwners.map((owner) => (
                <DropdownMenuCheckboxItem
                  key={owner}
                  checked={ownerFilter.includes(owner)}
                  onCheckedChange={() => handleOwnerToggle(owner)}
                >
                  {owner}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Asset Class Filter */}
        {uniqueAssetClasses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                assetClassFilter.length > 0 
                  ? "bg-accent/50 border-accent-foreground/20 text-foreground" 
                  : "border-input bg-background text-muted-foreground"
              )}>
                <span>{assetClassFilter.length > 0 ? getFilterLabel(assetClassFilter.length, "class") : "Asset Class"}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-auto">
              {uniqueAssetClasses.map((assetClass) => (
                <DropdownMenuCheckboxItem
                  key={assetClass}
                  checked={assetClassFilter.includes(assetClass)}
                  onCheckedChange={() => handleAssetClassToggle(assetClass)}
                >
                  {assetClass}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Reset Filters */}
        {totalFilters > 0 && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 h-9 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {selectedRowCount > 0 && onDeleteSelected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete ({selectedRowCount})
          </Button>
        )}
        
        {onAddTask && (
          <Button onClick={onAddTask} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
}
