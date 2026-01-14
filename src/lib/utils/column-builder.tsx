"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task, Status, Priority } from "@/src/lib/types";
import { FieldConfig } from "@/src/lib/db/schema";
import { StatusCell } from "@/src/components/features/tasks/status-cell";
import { PriorityCell } from "@/src/components/features/tasks/priority-cell";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableOwnerCell,
  EditableComboboxCell,
  EditableTagsCell,
  EditableDateCell,
} from "@/src/components/features/tasks/editable-cells";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";

/**
 * Build dynamic columns from field configurations
 */
export function buildColumnsFromFieldConfigs(
  fieldConfigs: FieldConfig[],
  onUpdate?: (taskId: string, field: string, value: any) => void,
  uniqueOwners: string[] = [],
  uniqueAssetClasses: string[] = []
): ColumnDef<Task>[] {
  // Filter only visible fields for table view
  const visibleFields = fieldConfigs.filter(
    (config) => config.visible === "true"
  );

  // Sort by order
  const sortedFields = [...visibleFields].sort((a, b) => a.order - b.order);

  // Build columns from field configs
  const columns: ColumnDef<Task>[] = sortedFields.map((fieldConfig) => {
    return createColumnFromFieldConfig(
      fieldConfig,
      onUpdate,
      uniqueOwners,
      uniqueAssetClasses
    );
  });

  // Add createdAt column
  columns.push({
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(date), "MMM d, yyyy")}
        </div>
      );
    },
    sortingFn: "datetime",
  });

  // Add actions column
  columns.push({
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit task</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  });

  return columns;
}

/**
 * Create a column definition from a field config
 */
function createColumnFromFieldConfig(
  fieldConfig: FieldConfig,
  onUpdate?: (taskId: string, field: string, value: any) => void,
  uniqueOwners: string[] = [],
  uniqueAssetClasses: string[] = []
): ColumnDef<Task> {
  const { key, name, type, cellType, options } = fieldConfig;

  // Base column with header and sorting
  const column: ColumnDef<Task> = {
    accessorKey: key,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {name}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return renderCell(
        row.original,
        fieldConfig,
        onUpdate,
        uniqueOwners,
        uniqueAssetClasses
      );
    },
  };

  // Add filter function for select and multiselect fields
  if (type === "select" || type === "multiselect") {
    column.filterFn = (row, id, value) => {
      return value.includes(row.getValue(id));
    };
  }

  return column;
}

/**
 * Render the appropriate cell component based on field config
 */
function renderCell(
  task: Task,
  fieldConfig: FieldConfig,
  onUpdate?: (taskId: string, field: string, value: any) => void,
  uniqueOwners: string[] = [],
  uniqueAssetClasses: string[] = []
) {
  const { key, cellType, type, options } = fieldConfig;
  // Type-safe property access using Record type
  const value = (task as Record<string, any>)[key];

  const handleChange = (newValue: any) => {
    onUpdate?.(task.id, key, newValue);
  };

  // Special handling for title with problem statement
  if (cellType === "editable-text-with-problem") {
    const handleTitleChange = (newTitle: string) => {
      onUpdate?.(task.id, "title", newTitle);
    };

    const handleProblemChange = (newProblem: string) => {
      onUpdate?.(task.id, "problemStatement", newProblem);
    };

    return (
      <div className="flex flex-col gap-2 py-2 min-w-[300px]">
        <EditableTextCell
          value={task.title}
          onChange={handleTitleChange}
          className="font-medium"
        />
        {task.problemStatement && (
          <EditableTextCell
            value={task.problemStatement}
            onChange={handleProblemChange}
            multiline
            className="text-xs text-muted-foreground"
          />
        )}
      </div>
    );
  }

  // Map cellType to specific cell components
  switch (cellType) {
    case "status":
      return (
        <StatusCell
          value={value as Status}
          onChange={(newValue: Status) => handleChange(newValue)}
        />
      );

    case "priority":
      return (
        <PriorityCell
          value={value as Priority}
          onChange={(newValue: Priority) => handleChange(newValue)}
        />
      );

    case "editable-owner":
      return (
        <EditableOwnerCell
          value={value || ""}
          onChange={handleChange}
          options={uniqueOwners}
          onAddOption={(newOption) => {
            // When a new owner is added, update the field value
            handleChange(newOption);
          }}
        />
      );

    case "editable-combobox":
      // Determine options based on field key or use options from field config
      let comboboxOptions: string[] = [];
      if (key === "assetClass") {
        comboboxOptions = uniqueAssetClasses;
      } else if (key === "theme") {
        // For theme or other fields, extract from field config options if available
        comboboxOptions = (options?.choices as string[]) || [];
      } else {
        // Fallback to field config choices
        comboboxOptions = (options?.choices as string[]) || [];
      }
      
      return (
        <EditableComboboxCell
          value={value || ""}
          onChange={handleChange}
          options={comboboxOptions}
          onAddOption={(newOption) => {
            // When a new option is added, update the field value
            handleChange(newOption);
          }}
        />
      );

    case "editable-text":
      return (
        <EditableTextCell
          value={value || ""}
          onChange={handleChange}
          multiline
        />
      );

    case "editable-number":
      // Use suffix from field config options if available, default to empty string
      const suffix = (options?.suffix as string) || "";
      return (
        <EditableNumberCell
          value={value || 0}
          onChange={handleChange}
          suffix={suffix}
        />
      );

    case "editable-date":
      return (
        <EditableDateCell value={value} onChange={handleChange} />
      );

    case "editable-tags":
      return (
        <EditableTagsCell
          value={value || []}
          onChange={handleChange}
          placeholder={`Add ${fieldConfig.name.toLowerCase()}...`}
        />
      );

    case "badge-list":
      const items = value || [];
      if (items.length === 0)
        return <span className="text-muted-foreground">-</span>;
      if (items.length === 1)
        return <Badge variant="secondary">{items[0]}</Badge>;
      return (
        <div className="flex items-center gap-1">
          <Badge variant="secondary">{items[0]}</Badge>
          {items.length > 1 && (
            <Badge variant="secondary">+{items.length - 1}</Badge>
          )}
        </div>
      );

    default:
      // Fallback based on field type
      if (type === "text") {
        return (
          <EditableTextCell value={value || ""} onChange={handleChange} />
        );
      } else if (type === "number") {
        return (
          <EditableNumberCell value={value || 0} onChange={handleChange} />
        );
      } else if (type === "date") {
        return <EditableDateCell value={value} onChange={handleChange} />;
      } else if (type === "multiselect") {
        const items = value || [];
        if (items.length === 0)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {items.map((item: string, idx: number) => (
              <Badge key={idx} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        );
      } else if (type === "select") {
        return <span>{value || "-"}</span>;
      }
      return <span className="text-muted-foreground">-</span>;
  }
}
