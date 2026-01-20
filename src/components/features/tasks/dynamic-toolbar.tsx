'use client';

import { Table } from '@tanstack/react-table';
import { Task, Status, Priority } from '@/src/lib/types';
import { FieldConfig } from '@/src/lib/db';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Search,
  Trash2,
  X,
  Filter,
  Columns3,
  Eye,
  EyeOff,
  Plus,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/src/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { useMemo, useState } from 'react';

interface DynamicToolbarProps {
  table: Table<Task>;
  fieldConfigs: FieldConfig[];
  tasks: Task[];
  onAddTask?: () => void;
  onDeleteSelected?: (selectedIds: string[]) => void;
  onToggleFieldVisibility?: (fieldId: string, visible: boolean) => void;
}

const statusLabels: Record<Status, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  testing: 'Testing',
  done: 'Done',
  completed: 'Completed',
  blocked: 'Blocked',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

// Field types that support filtering
const FILTERABLE_TYPES = [
  'select',
  'status',
  'priority',
  'editable-owner',
  'editable-combobox',
];

export function DynamicToolbar({
  table,
  fieldConfigs,
  tasks,
  onAddTask,
  onDeleteSelected,
  onToggleFieldVisibility,
}: DynamicToolbarProps) {
  const selectedRowCount = Object.keys(table.getState().rowSelection).length;
  const globalFilter = table.getState().globalFilter ?? '';
  const [activeFilterField, setActiveFilterField] = useState<string | null>(
    null,
  );

  // Build dynamic filters from field configs
  const filterableFields = useMemo(() => {
    return fieldConfigs.filter(
      (f) => f.visible && FILTERABLE_TYPES.includes(f.type),
    );
  }, [fieldConfigs]);

  // Extract unique values for each filterable field
  const fieldOptions = useMemo(() => {
    const options: Record<string, string[]> = {};

    filterableFields.forEach((field) => {
      if (field.type === 'status') {
        options[field.key] = [
          'todo',
          'in-progress',
          'testing',
          'done',
          'completed',
          'blocked',
        ];
      } else if (field.type === 'priority') {
        options[field.key] = ['low', 'medium', 'high', 'urgent'];
      } else {
        // Extract unique values from tasks
        const values = tasks
          .map(
            (task) => (task as unknown as Record<string, unknown>)[field.key],
          )
          .filter((v): v is string => typeof v === 'string' && v.length > 0);
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

  const clearFieldFilter = (fieldKey: string) => {
    const column = table.getColumn(fieldKey);
    column?.setFilterValue(undefined);
  };

  const getDisplayLabel = (field: FieldConfig, value: string): string => {
    if (field.type === 'status') {
      return statusLabels[value as Status] || value;
    }
    if (field.type === 'priority') {
      return priorityLabels[value as Priority] || value;
    }
    return value;
  };

  const getStatusColor = (value: string): string => {
    const colors: Record<string, string> = {
      todo: 'var(--status-todo)',
      'in-progress': 'var(--status-in-progress)',
      testing: 'var(--status-testing)',
      done: 'var(--status-done)',
      completed: 'var(--status-completed)',
      blocked: 'var(--status-blocked)',
    };
    return colors[value] || 'var(--muted-foreground)';
  };

  const getPriorityColor = (value: string): string => {
    const colors: Record<string, string> = {
      low: 'var(--priority-low)',
      medium: 'var(--priority-medium)',
      high: 'var(--priority-high)',
      urgent: 'var(--priority-urgent)',
    };
    return colors[value] || 'var(--muted-foreground)';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main toolbar row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Search */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="h-9 pl-9 text-sm bg-background border border-border/60 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50"
            />
            {globalFilter && (
              <button
                onClick={() => table.setGlobalFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Columns3 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-80 overflow-auto"
            >
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Toggle columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {fieldConfigs
                .filter((f) => f.key !== 'title') // Don't allow hiding title
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
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">
                Delete ({selectedRowCount})
              </span>
            </Button>
          )}

          {/* Add Task */}
          {onAddTask && (
            <Button
              onClick={onAddTask}
              size="sm"
              className="h-9 gap-1.5 bg-primary hover:bg-primary/90 shadow-sm rounded-lg"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter dropdown buttons for each field */}
        {filterableFields.map((field) => {
          const options = fieldOptions[field.key] || [];
          const column = table.getColumn(field.key);
          const filterValue = (column?.getFilterValue() as string[]) ?? [];
          const hasFilter = filterValue.length > 0;

          if (options.length === 0) return null;

          return (
            <Popover
              key={field.id}
              open={activeFilterField === field.key}
              onOpenChange={(open) =>
                setActiveFilterField(open ? field.key : null)
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-8 rounded-full border-dashed gap-1.5 text-xs font-normal',
                    hasFilter &&
                      'border-solid border-primary/50 bg-primary/5 text-primary hover:bg-primary/10',
                  )}
                >
                  {hasFilter ? (
                    <>
                      <span>{field.name}</span>
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary"
                      >
                        {filterValue.length}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>{field.name}</span>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {field.name}
                    </span>
                    {hasFilter && (
                      <button
                        onClick={() => clearFieldFilter(field.key)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {options.map((value) => {
                      const isSelected = filterValue.includes(value);
                      const isStatus = field.type === 'status';
                      const isPriority = field.type === 'priority';

                      return (
                        <button
                          key={value}
                          onClick={() => handleFilterToggle(field.key, value)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground',
                          )}
                        >
                          <div
                            className={cn(
                              'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                              isSelected
                                ? 'bg-primary border-primary'
                                : 'border-border',
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          {(isStatus || isPriority) && (
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: isStatus
                                  ? getStatusColor(value)
                                  : getPriorityColor(value),
                              }}
                            />
                          )}
                          <span className="flex-1 text-left">
                            {getDisplayLabel(field, value)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        })}

        {/* Clear all filters button */}
        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        )}

        {/* Show filter icon if no filters active */}
        {totalFilters === 0 && filterableFields.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Click to add filters</span>
          </div>
        )}
      </div>
    </div>
  );
}
