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
 * Type for unique values map where keys match field keys
 */
type UniqueValuesMap = Record<string, string[]>;

/**
 * Extract unique values for select fields from task data
 */
export function extractUniqueFieldValues(
  tasks: Task[],
  fieldConfigs: FieldConfig[]
): UniqueValuesMap {
  const uniqueValues: UniqueValuesMap = {};

  // Extract unique values for select and owner fields
  const selectFields = fieldConfigs.filter(
    (config) =>
      config.type === "select" ||
      config.cellType === "editable-owner" ||
      config.cellType === "editable-combobox"
  );

  selectFields.forEach((field) => {
    const values = tasks
      .map((task) => (task as Record<string, any>)[field.key])
      .filter((value) => value != null && value !== "");

    uniqueValues[field.key] = Array.from(new Set(values)).sort();
  });

  return uniqueValues;
}

/**
 * Build dynamic columns from field configurations
 */
export function buildColumnsFromFieldConfigs(
  fieldConfigs: FieldConfig[],
  tasks: Task[],
  onUpdate?: (taskId: string, field: string, value: any) => void
): ColumnDef<Task>[] {
  // Extract unique values for all select-type fields
  const uniqueValues = extractUniqueFieldValues(tasks, fieldConfigs);

  // Filter only visible fields for table view
  const visibleFields = fieldConfigs.filter(
    (config) => config.visible === "true"
  );

  // Sort by order
  const sortedFields = [...visibleFields].sort((a, b) => a.order - b.order);

  // Build columns from field configs
  const columns: ColumnDef<Task>[] = sortedFields.map((fieldConfig) => {
    return createColumnFromFieldConfig(fieldConfig, onUpdate, uniqueValues);
  });

  // Add createdAt column
  columns.push(createCreatedAtColumn());

  // Add actions column
  columns.push(createActionsColumn());

  return columns;
}

/**
 * Create the createdAt column
 */
function createCreatedAtColumn(): ColumnDef<Task> {
  return {
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
  };
}

/**
 * Create the actions column
 */
function createActionsColumn(): ColumnDef<Task> {
  return {
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
  };
}

/**
 * Create a column definition from a field config
 */
function createColumnFromFieldConfig(
  fieldConfig: FieldConfig,
  onUpdate?: (taskId: string, field: string, value: any) => void,
  uniqueValues: UniqueValuesMap = {}
): ColumnDef<Task> {
  const { key, name, type } = fieldConfig;

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
      return renderCell(row.original, fieldConfig, onUpdate, uniqueValues);
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
  uniqueValues: UniqueValuesMap = {}
): React.ReactNode {
  const { key, cellType, type, options } = fieldConfig;
  // Type-safe property access
  const value = (task as Record<string, any>)[key];

  const handleChange = (newValue: any) => {
    onUpdate?.(task.id, key, newValue);
  };

  // Get unique options for this field
  const fieldOptions = uniqueValues[key] || [];

  // Map cellType to specific cell components
  switch (cellType) {
    case "status":
      return renderStatusCell(value, handleChange);

    case "priority":
      return renderPriorityCell(value, handleChange);

    case "editable-owner":
      return renderEditableOwnerCell(value, handleChange, fieldOptions);

    case "editable-combobox":
      return renderEditableComboboxCell(
        value,
        handleChange,
        fieldOptions,
        options
      );

    case "editable-text":
      return renderEditableTextCell(value, handleChange, key);

    case "editable-number":
      return renderEditableNumberCell(value, handleChange, options);

    case "editable-date":
      return renderEditableDateCell(value, handleChange);

    case "editable-tags":
      return renderEditableTagsCell(value, handleChange, fieldConfig.name);

    case "badge-list":
      return renderBadgeList(value);

    default:
      return renderFallbackCell(value, type, handleChange);
  }
}

/**
 * Render status cell
 */
function renderStatusCell(
  value: any,
  handleChange: (value: Status) => void
): React.ReactNode {
  return (
    <StatusCell
      value={value as Status}
      onChange={(newValue: Status) => handleChange(newValue)}
    />
  );
}

/**
 * Render priority cell
 */
function renderPriorityCell(
  value: any,
  handleChange: (value: Priority) => void
): React.ReactNode {
  return (
    <PriorityCell
      value={value as Priority}
      onChange={(newValue: Priority) => handleChange(newValue)}
    />
  );
}

/**
 * Render editable owner cell
 */
function renderEditableOwnerCell(
  value: any,
  handleChange: (value: string) => void,
  options: string[]
): React.ReactNode {
  return (
    <EditableOwnerCell
      value={value || ""}
      onChange={handleChange}
      options={options}
      onAddOption={(newOption) => {
        handleChange(newOption);
      }}
    />
  );
}

/**
 * Render editable combobox cell
 */
function renderEditableComboboxCell(
  value: any,
  handleChange: (value: string) => void,
  fieldOptions: string[],
  configOptions?: any
): React.ReactNode {
  // Use unique values from data or fallback to field config choices
  const options = fieldOptions.length > 0 
    ? fieldOptions 
    : ((configOptions?.choices as string[]) || []);

  return (
    <EditableComboboxCell
      value={value || ""}
      onChange={handleChange}
      options={options}
      onAddOption={(newOption) => {
        handleChange(newOption);
      }}
    />
  );
}

/**
 * Render editable text cell
 */
function renderEditableTextCell(
  value: any,
  handleChange: (value: string) => void,
  key: string
): React.ReactNode {
  // Title field should be single-line, others can be multiline
  const isTitle = key === "title";
  return (
    <EditableTextCell
      value={value || ""}
      onChange={handleChange}
      multiline={!isTitle}
      className={isTitle ? "font-medium" : undefined}
    />
  );
}

/**
 * Render editable number cell
 */
function renderEditableNumberCell(
  value: any,
  handleChange: (value: number) => void,
  options?: any
): React.ReactNode {
  const suffix = (options?.suffix as string) || "";
  return (
    <EditableNumberCell
      value={value || 0}
      onChange={handleChange}
      suffix={suffix}
    />
  );
}

/**
 * Render editable date cell
 */
function renderEditableDateCell(
  value: any,
  handleChange: (value: Date | null) => void
): React.ReactNode {
  return <EditableDateCell value={value} onChange={handleChange} />;
}

/**
 * Render editable tags cell
 */
function renderEditableTagsCell(
  value: any,
  handleChange: (value: string[]) => void,
  fieldName: string
): React.ReactNode {
  return (
    <EditableTagsCell
      value={value || []}
      onChange={handleChange}
      placeholder={`Add ${fieldName.toLowerCase()}...`}
    />
  );
}

/**
 * Render badge list
 */
function renderBadgeList(value: any): React.ReactNode {
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
}

/**
 * Render fallback cell for unknown types
 */
function renderFallbackCell(
  value: any,
  type: string,
  handleChange: (value: any) => void
): React.ReactNode {
  if (type === "text") {
    return <EditableTextCell value={value || ""} onChange={handleChange} />;
  } else if (type === "number") {
    return <EditableNumberCell value={value || 0} onChange={handleChange} />;
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
