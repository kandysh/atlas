"use client";

import { Table } from "@tanstack/react-table";
import { Task, Status, Priority } from "@/src/lib/types";
import { FieldConfig } from "@/src/lib/db";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { 
  Search, 
  Trash2,
  ChevronDown,
  X,
  SlidersHorizontal,
  Columns3,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { useMemo } from "react";

interface DynamicToolbarProps {
  table: Table<Task>;
  fieldConfigs: FieldConfig[];
  tasks: Task[];
  onAddTask?: () => void;
  onDeleteSelected?: (selectedIds: string[]) => void;
  onToggleFieldVisibility?: (fieldId: string, visible: boolean) => void;
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

// Field types that support filtering
const FILTERABLE_TYPES = ["select", "status", "priority", "editable-owner", "editable-combobox"];

export function DynamicToolbar({
  table,
  fieldConfigs,
  tasks,
  onAddTask,
  onDeleteSelected,
  onToggleFieldVisibility,
}: DynamicToolbarProps) {
  const selectedRowCount = Object.keys(table.getState().rowSelection).length;
  const globalFilter = table.getState().globalFilter ?? "";

  // Build dynamic filters from field configs
  const filterableFields = useMemo(() => {
    return fieldConfigs.filter(
      (f) => f.visible && FILTERABLE_TYPES.includes(f.type)
    );
  }, [fieldConfigs]);

  // Extract unique values for each filterable field
  const fieldOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    
    filterableFields.forEach((field) => {
      if (field.type === "status") {
        options[field.key] = ["todo", "in-progress", "testing", "done", "completed", "blocked"];
      } else if (field.type === "priority") {
        options[field.key] = ["low", "medium", "high", "urgent"];
      } else {
        // Extract unique values from tasks
        const values = tasks
          .map((task) => (task as unknown as Record<string, unknown>)[field.key])
          .filter((v): v is string => typeof v === "string" && v.length > 0);
        options[field.key] = Array.from(new Set(values)).sort();
      }
    });
    
    return options;
  }, [filterableFields, tasks]);

  // Count total active filters
  const totalFilters = useMemo(() => {
    let count = 0;
    filterableFields.forEach((field) => {
      const column = table.getColumn(field.key);
      const filterValue = column?.getFilterValue() as string[] | undefined;
      if (filterValue && filterValue.length > 0) {
        count += filterValue.length;
      }
    });
    return count;
  }, [filterableFields, table]);

  const handleDeleteSelected = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedIds = selectedRows.map((row) => row.original.id);
    onDeleteSelected?.(selectedIds);
    table.resetRowSelection();
  };

  const handleFilterToggle = (fieldKey: string, value: string) => {
    const column = table.getColumn(fieldKey);
    if (!column) return;
    
    const current = (column.getFilterValue() as string[]) ?? [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    column.setFilterValue(updated.length > 0 ? updated : undefined);
  };

  const clearAllFilters = () => {
    filterableFields.forEach((field) => {
      const column = table.getColumn(field.key);
      column?.setFilterValue(undefined);
    });
  };

  const getDisplayLabel = (field: FieldConfig, value: string): string => {
    if (field.type === "status") {
      return statusLabels[value as Status] || value;
    }
    if (field.type === "priority") {
      return priorityLabels[value as Priority] || value;
    }
    return value;
  };

  const getDotClass = (field: FieldConfig, value: string): string | null => {
    if (field.type === "status") {
      return `status-dot status-${value}`;
    }
    if (field.type === "priority") {
      return `priority-dot priority-${value}`;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main toolbar row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="h-10 pl-9 text-sm bg-muted/30 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Filter button with count */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-10 gap-2",
                  totalFilters > 0 && "border-primary/50 bg-primary/5"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {totalFilters > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {totalFilters}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {filterableFields.map((field) => {
                const options = fieldOptions[field.key] || [];
                const column = table.getColumn(field.key);
                const filterValue = (column?.getFilterValue() as string[]) ?? [];
                
                if (options.length === 0) return null;
                
                return (
                  <DropdownMenu key={field.id}>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                        <span>{field.name}</span>
                        <div className="flex items-center gap-1">
                          {filterValue.length > 0 && (
                            <span className="text-xs text-primary">{filterValue.length}</span>
                          )}
                          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48 max-h-64 overflow-auto">
                      {options.map((value) => {
                        const dotClass = getDotClass(field, value);
                        return (
                          <DropdownMenuCheckboxItem
                            key={value}
                            checked={filterValue.includes(value)}
                            onCheckedChange={() => handleFilterToggle(field.key, value)}
                            className="gap-2"
                          >
                            {dotClass && <span className={dotClass} />}
                            {getDisplayLabel(field, value)}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
              
              {totalFilters > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={clearAllFilters}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all filters
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 gap-2">
                <Columns3 className="h-4 w-4" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {fieldConfigs
                .filter((f) => f.key !== "title") // Don't allow hiding title
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <DropdownMenuCheckboxItem
                    key={field.id}
                    checked={field.visible}
                    onCheckedChange={(checked) => {
                      onToggleFieldVisibility?.(field.id, checked);
                    }}
                    className="gap-2"
                  >
                    {field.visible ? (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {field.name}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete selected */}
          {selectedRowCount > 0 && onDeleteSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Delete ({selectedRowCount})</span>
            </Button>
          )}
          
          {/* Add Task */}
          {onAddTask && (
            <Button 
              onClick={onAddTask} 
              size="sm" 
              className="h-10 bg-primary hover:bg-primary/90 shadow-sm"
            >
              <span className="text-lg leading-none mr-1.5">+</span>
              <span>New Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      {totalFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {filterableFields.map((field) => {
            const column = table.getColumn(field.key);
            const filterValue = (column?.getFilterValue() as string[]) ?? [];
            
            return filterValue.map((value) => (
              <button
                key={`${field.key}-${value}`}
                onClick={() => handleFilterToggle(field.key, value)}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {getDotClass(field, value) && (
                  <span className={cn(getDotClass(field, value), "!w-1.5 !h-1.5")} />
                )}
                <span>{getDisplayLabel(field, value)}</span>
                <X className="h-3 w-3" />
              </button>
            ));
          })}
          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
