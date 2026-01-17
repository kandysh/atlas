"use client";

import React from "react";
import { FieldConfig } from "@/src/lib/db/schema";
import { Status, Priority } from "@/src/lib/types";
import { StatusCell } from "@/src/components/features/tasks/status-cell";
import { PriorityCell } from "@/src/components/features/tasks/priority-cell";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableOwnerCell,
  EditableComboboxCell,
  EditableTagsCell,
  EditableDateCell,
  EditableCheckboxCell,
  EditableMultiselectCell,
} from "@/src/components/features/tasks/editable-cells";

/**
 * Props passed to each field renderer
 */
export interface FieldRendererProps {
  value: unknown;
  onChange: (value: unknown) => void;
  fieldConfig: FieldConfig;
  options?: string[];
  disabled?: boolean;
  className?: string;
}

/**
 * Type-to-component registry for metadata-driven UI
 * Maps field types to their render functions
 */
export const fieldRenderers: Record<
  string,
  (props: FieldRendererProps) => React.ReactNode
> = {
  "editable-text": ({ value, onChange, fieldConfig, className }) => (
    <EditableTextCell
      value={(value as string) || ""}
      onChange={(v) => onChange(v)}
      multiline={fieldConfig.key !== "title"}
      className={className}
    />
  ),

  "editable-owner": ({ value, onChange, options = [], className }) => (
    <EditableOwnerCell
      value={(value as string) || ""}
      onChange={(v) => onChange(v)}
      options={options}
      onAddOption={() => {}}
      className={className}
    />
  ),

  status: ({ value, onChange }) => (
    <StatusCell
      value={(value as Status) || "todo"}
      onChange={(v) => onChange(v)}
    />
  ),

  priority: ({ value, onChange }) => (
    <PriorityCell
      value={(value as Priority) || "medium"}
      onChange={(v) => onChange(v)}
    />
  ),

  "editable-tags": ({ value, onChange, fieldConfig, className }) => (
    <EditableTagsCell
      value={(value as string[]) || []}
      onChange={(v) => onChange(v)}
      placeholder={`Add ${fieldConfig.name.toLowerCase()}...`}
      className={className}
    />
  ),

  "editable-number": ({ value, onChange, fieldConfig, className }) => {
    const suffix = (fieldConfig.options?.suffix as string) || "";
    return (
      <EditableNumberCell
        value={(value as number) || 0}
        onChange={(v) => onChange(v)}
        suffix={suffix}
        className={className}
      />
    );
  },

  "editable-date": ({ value, onChange, className }) => (
    <EditableDateCell
      value={value ? new Date(value as string | Date) : null}
      onChange={(v) => onChange(v)}
      className={className}
    />
  ),

  "editable-combobox": ({ value, onChange, options = [], fieldConfig, className }) => {
    const configChoices = (fieldConfig.options?.choices as string[]) || [];
    const allOptions = [...new Set([...options, ...configChoices])];
    return (
      <EditableComboboxCell
        value={(value as string) || ""}
        onChange={(v) => onChange(v)}
        options={allOptions}
        onAddOption={() => {}}
        placeholder={`Select ${fieldConfig.name.toLowerCase()}...`}
        className={className}
      />
    );
  },

  checkbox: ({ value, onChange, className }) => (
    <EditableCheckboxCell
      value={(value as boolean) || false}
      onChange={(v) => onChange(v)}
      className={className}
    />
  ),

  multiselect: ({ value, onChange, options = [], fieldConfig, className }) => {
    const configChoices = (fieldConfig.options?.choices as string[]) || [];
    const allOptions = [...new Set([...options, ...configChoices])];
    return (
      <EditableMultiselectCell
        value={(value as string[]) || []}
        onChange={(v) => onChange(v)}
        options={allOptions}
        placeholder={`Select ${fieldConfig.name.toLowerCase()}...`}
        className={className}
      />
    );
  },

  // Fallback renderers for basic types
  text: ({ value, onChange, className }) => (
    <EditableTextCell
      value={(value as string) || ""}
      onChange={(v) => onChange(v)}
      className={className}
    />
  ),

  number: ({ value, onChange, className }) => (
    <EditableNumberCell
      value={(value as number) || 0}
      onChange={(v) => onChange(v)}
      className={className}
    />
  ),

  date: ({ value, onChange, className }) => (
    <EditableDateCell
      value={value ? new Date(value as string | Date) : null}
      onChange={(v) => onChange(v)}
      className={className}
    />
  ),

  select: ({ value, onChange, options = [], fieldConfig, className }) => {
    const configChoices = (fieldConfig.options?.choices as string[]) || [];
    const allOptions = [...new Set([...options, ...configChoices])];
    return (
      <EditableComboboxCell
        value={(value as string) || ""}
        onChange={(v) => onChange(v)}
        options={allOptions}
        placeholder={`Select ${fieldConfig.name.toLowerCase()}...`}
        className={className}
      />
    );
  },
};

/**
 * Render a field using the type-to-component registry
 * Falls back gracefully if type is not found
 */
export function renderField(props: FieldRendererProps): React.ReactNode {
  const renderer = fieldRenderers[props.fieldConfig.type];
  if (renderer) {
    return renderer(props);
  }
  // Fallback to text renderer for unknown types
  return fieldRenderers["text"](props);
}

/**
 * Check if a field type is supported
 */
export function isFieldTypeSupported(type: string): boolean {
  return type in fieldRenderers;
}
