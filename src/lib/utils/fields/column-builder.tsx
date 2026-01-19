'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Task, Status, Priority } from '@/src/lib/types';
import { FieldConfig } from '@/src/lib/db/schema';
import { StatusCell } from '@/src/components/features/tasks/status-cell';
import { PriorityCell } from '@/src/components/features/tasks/priority-cell';
import {
  EditableTextCell,
  EditableNumberCell,
  EditableOwnerCell,
  EditableComboboxCell,
  EditableTagsCell,
  EditableDateCell,
  EditableCheckboxCell,
  EditableMultiselectCell,
} from '@/src/components/features/tasks/editable-cells';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Badge } from '@/src/components/ui/badge';

export type CellType =
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'checkbox'
  | 'number'
  | 'editable-text'
  | 'editable-number'
  | 'editable-date'
  | 'editable-tags'
  | 'editable-combobox'
  | 'editable-owner'
  | 'status'
  | 'priority'
  | 'badge-list';

type UniqueValuesMap = Record<string, string[]>;

type FieldValue = string | number | boolean | string[] | Date | null | undefined;
type FieldOptions = { choices?: string[]; suffix?: string } | null | undefined;

/**
 * Extract unique values for select-type fields from task data
 */
export function extractUniqueFieldValues(
  tasks: Task[],
  fieldConfigs: FieldConfig[],
): UniqueValuesMap {
  const uniqueValues: UniqueValuesMap = {};

  const selectFields = fieldConfigs.filter(
    (config) =>
      config.type === 'select' ||
      config.type === 'editable-owner' ||
      config.type === 'editable-combobox',
  );

  selectFields.forEach((field) => {
    const values = tasks
      .map((task) => (task as Record<string, FieldValue>)[field.key])
      .filter((value) => value != null && value !== '')
      .map((value) => String(value)); // Ensure all values are strings

    uniqueValues[field.key] = Array.from(new Set(values)).sort();
  });

  return uniqueValues;
}

/**
 * Build dynamic table columns from field configurations
 */
export function buildColumnsFromFieldConfigs(
  fieldConfigs: FieldConfig[],
  tasks: Task[],
  onUpdate?: (taskId: string, field: string, value: FieldValue) => void,
  onViewDetails?: (task: Task) => void,
  onDelete?: (taskId: string) => void,
  onDuplicate?: (taskId: string) => void,
): ColumnDef<Task>[] {
  const uniqueValues = extractUniqueFieldValues(tasks, fieldConfigs);

  const visibleFields = fieldConfigs
    .filter((config) => config.visible)
    .sort((a, b) => a.order - b.order);

  const columns: ColumnDef<Task>[] = visibleFields.map((fieldConfig) =>
    createColumnFromFieldConfig(fieldConfig, onUpdate, uniqueValues),
  );

  columns.push(createActionsColumn(onViewDetails, onDelete, onDuplicate));

  return columns;
}

/**
 * Create a column definition from a field config
 */
function createColumnFromFieldConfig(
  fieldConfig: FieldConfig,
  onUpdate?: (taskId: string, field: string, value: FieldValue) => void,
  uniqueValues: UniqueValuesMap = {},
): ColumnDef<Task> {
  const { key, name, type } = fieldConfig;

  const column: ColumnDef<Task> = {
    accessorKey: key,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="-ml-4"
      >
        {name}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      renderCell(row.original, fieldConfig, onUpdate, uniqueValues),
  };

  if (type === 'select' || type === 'multiselect') {
    column.filterFn = (row, id, value) => value.includes(row.getValue(id));
  }

  return column;
}

/**
 * Create the actions dropdown column
 */
function createActionsColumn(
  onViewDetails?: (task: Task) => void,
  onDelete?: (taskId: string) => void,
  onDuplicate?: (taskId: string) => void,
): ColumnDef<Task> {
  return {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate?.(row.original.id)}>
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete?.(row.original.id)}
          >
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };
}

/**
 * Render the appropriate cell component based on field config
 */
function renderCell(
  task: Task,
  fieldConfig: FieldConfig,
  onUpdate?: (taskId: string, field: string, value: FieldValue) => void,
  uniqueValues: UniqueValuesMap = {},
): React.ReactNode {
  const { key, type, options } = fieldConfig;
  const value = (task as Record<string, FieldValue>)[key];
  const fieldOptions = uniqueValues[key] || [];

  const handleChange = (newValue: FieldValue) => {
    onUpdate?.(task.id, key, newValue);
  };

  switch (type) {
    case 'status':
      return renderStatusCell(value, handleChange);
    case 'priority':
      return renderPriorityCell(value, handleChange);
    case 'editable-owner':
      return renderEditableOwnerCell(value, handleChange, fieldOptions);
    case 'editable-combobox':
      return renderEditableComboboxCell(
        value,
        handleChange,
        fieldOptions,
        options,
      );
    case 'editable-text':
      return renderEditableTextCell(value, handleChange, key);
    case 'editable-number':
      return renderEditableNumberCell(value, handleChange, options);
    case 'editable-date':
      return <EditableDateCell value={(value as Date | null) ?? null} onChange={handleChange} />;
    case 'editable-tags':
      return renderEditableTagsCell(value, handleChange, fieldConfig.name);
    case 'badge-list':
      return renderBadgeList(value);
    case 'checkbox':
      return (
        <EditableCheckboxCell value={Boolean(value)} onChange={handleChange} />
      );
    case 'multiselect':
      return renderEditableMultiselectCell(
        value,
        handleChange,
        fieldOptions,
        options,
        fieldConfig.name,
      );
    default:
      return renderFallbackCell(value, type, handleChange);
  }
}

function renderStatusCell(
  value: FieldValue,
  handleChange: (value: Status) => void,
): React.ReactNode {
  return <StatusCell value={value as Status} onChange={handleChange} />;
}

function renderPriorityCell(
  value: FieldValue,
  handleChange: (value: Priority) => void,
): React.ReactNode {
  return <PriorityCell value={value as Priority} onChange={handleChange} />;
}

function renderEditableOwnerCell(
  value: FieldValue,
  handleChange: (value: string) => void,
  options: string[],
): React.ReactNode {
  return (
    <EditableOwnerCell
      value={(value as string) || ''}
      onChange={handleChange}
      options={options}
      onAddOption={handleChange}
    />
  );
}

function renderEditableComboboxCell(
  value: FieldValue,
  handleChange: (value: string) => void,
  fieldOptions: string[],
  configOptions?: FieldOptions,
): React.ReactNode {
  const rawOptions =
    fieldOptions.length > 0
      ? fieldOptions
      : (configOptions?.choices as string[]) || [];

  // Ensure all options are strings and filter out null/undefined
  const options = rawOptions
    .filter((opt) => opt != null)
    .map((opt) => String(opt));

  return (
    <EditableComboboxCell
      value={(value as string) || ''}
      onChange={handleChange}
      options={options}
      onAddOption={handleChange}
    />
  );
}

function renderEditableTextCell(
  value: FieldValue,
  handleChange: (value: string) => void,
  key: string,
): React.ReactNode {
  const isTitle = key === 'title';
  return (
    <EditableTextCell
      value={(value as string) || ''}
      onChange={handleChange}
      multiline={!isTitle}
      className={isTitle ? 'font-medium' : undefined}
    />
  );
}

function renderEditableNumberCell(
  value: FieldValue,
  handleChange: (value: number) => void,
  options?: FieldOptions,
): React.ReactNode {
  const suffix = (options?.suffix as string) || '';
  return (
    <EditableNumberCell
      value={(value as number) || 0}
      onChange={handleChange}
      suffix={suffix}
    />
  );
}

function renderEditableTagsCell(
  value: FieldValue,
  handleChange: (value: string[]) => void,
  fieldName: string,
): React.ReactNode {
  return (
    <EditableTagsCell
      value={(value as string[]) || []}
      onChange={handleChange}
      placeholder={`Add ${fieldName.toLowerCase()}...`}
    />
  );
}

function renderBadgeList(value: FieldValue): React.ReactNode {
  const items = (value as string[]) || [];

  if (items.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  if (items.length === 1) {
    return <Badge variant="secondary">{items[0]}</Badge>;
  }

  return (
    <div className="flex items-center gap-1">
      <Badge variant="secondary">{items[0]}</Badge>
      <Badge variant="secondary">+{items.length - 1}</Badge>
    </div>
  );
}

function renderEditableMultiselectCell(
  value: FieldValue,
  handleChange: (value: string[]) => void,
  fieldOptions: string[],
  configOptions?: FieldOptions,
  fieldName?: string,
): React.ReactNode {
  const options =
    fieldOptions.length > 0
      ? fieldOptions
      : (configOptions?.choices as string[]) || [];

  return (
    <EditableMultiselectCell
      value={(value as string[]) || []}
      onChange={handleChange}
      options={options}
      placeholder={`Select ${fieldName?.toLowerCase() || 'items'}...`}
    />
  );
}

function renderFallbackCell(
  value: FieldValue,
  type: string,
  handleChange: (value: FieldValue) => void,
): React.ReactNode {
  switch (type) {
    case 'text':
      return <EditableTextCell value={(value as string) || ''} onChange={handleChange} />;
    case 'number':
      return <EditableNumberCell value={(value as number) || 0} onChange={handleChange} />;
    case 'date':
      return <EditableDateCell value={value as Date | null} onChange={handleChange} />;
    case 'multiselect': {
      const items = (value as string[]) || [];
      if (items.length === 0) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {items.map((item: string, idx: number) => (
            <Badge key={idx} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      );
    }
    case 'select':
      return <span>{(value as string) || '-'}</span>;
    default:
      return <span className="text-muted-foreground">-</span>;
  }
}
