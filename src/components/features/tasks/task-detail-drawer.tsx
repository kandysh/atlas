"use client";

import { useMemo } from "react";
import {
  X,
  Calendar,
  User,
  Clock,
  Briefcase,
  Users,
  Tag,
  FileText,
  CircleDot,
  Flag,
  Palette,
  Hash,
  AlignLeft,
  CheckSquare,
  List,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { StatusCell } from "./status-cell";
import { PriorityCell } from "./priority-cell";
import { cn } from "@/src/lib/utils";
import { Task, Status, Priority } from "@/src/lib/types";
import { FieldConfig } from "@/src/lib/db/schema";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableDateCell,
  EditableTagsCell,
  EditableComboboxCell,
  EditableOwnerCell,
  EditableCheckboxCell,
  EditableMultiselectCell,
} from "./editable-cells";

import { TaskHistory } from "./task-history";

type TaskDetailDrawerProps = {
  task: Task | null;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, field: string, value: unknown) => void;
  dbTaskId?: string | null;
  workspaceId: string;
  fieldConfigs?: FieldConfig[];
};

// Icon mapping for common field keys
const FIELD_ICONS: Record<string, LucideIcon> = {
  status: CircleDot,
  priority: Flag,
  owner: User,
  assetClass: Briefcase,
  theme: Palette,
  teamsInvolved: Users,
  teams: Users,
  completionDate: Calendar,
  dueDate: Calendar,
  tags: Tag,
  tools: FileText,
  currentHrs: Clock,
  workedHrs: Clock,
  savedHrs: Clock,
  title: AlignLeft,
  problemStatement: AlignLeft,
  solutionDesign: AlignLeft,
  benefits: AlignLeft,
  otherUseCases: AlignLeft,
};

// Get icon for a field
function getFieldIcon(key: string, type: string): LucideIcon {
  if (FIELD_ICONS[key]) return FIELD_ICONS[key];
  
  // Fallback based on type
  switch (type) {
    case "status": return CircleDot;
    case "priority": return Flag;
    case "editable-owner": return User;
    case "editable-date": 
    case "date": return Calendar;
    case "editable-number":
    case "number": return Hash;
    case "editable-tags":
    case "multiselect":
    case "badge-list": return Tag;
    case "checkbox": return CheckSquare;
    case "editable-combobox":
    case "select": return List;
    default: return AlignLeft;
  }
}

// Fields that should be displayed in a special way (not in properties grid)
const SPECIAL_FIELDS = new Set(["title", "problemStatement", "solutionDesign", "benefits", "otherUseCases"]);
const HOUR_FIELDS = new Set(["currentHrs", "workedHrs", "savedHrs"]);

export function TaskDetailDrawer({
  task,
  tasks,
  isOpen,
  onClose,
  onUpdate,
  dbTaskId,
  workspaceId,
  fieldConfigs = [],
}: TaskDetailDrawerProps) {
  // Compute unique values from tasks array for select-type fields
  const uniqueFieldValues = useMemo(() => {
    const valueMap: Record<string, string[]> = {};
    
    const selectFields = fieldConfigs.filter(
      (config) =>
        config.type === "select" ||
        config.type === "editable-owner" ||
        config.type === "editable-combobox"
    );
    
    selectFields.forEach((field) => {
      const values = tasks
        .map((t) => t[field.key] as string)
        .filter((value) => value != null && value !== "")
        .map((value) => String(value));
      
      valueMap[field.key] = Array.from(new Set(values)).sort();
    });
    
    return valueMap;
  }, [tasks, fieldConfigs]);

  // Sort and filter field configs
  const sortedFieldConfigs = useMemo(() => {
    return [...fieldConfigs]
      .filter((config) => config.visible)
      .sort((a, b) => a.order - b.order);
  }, [fieldConfigs]);

  // Separate fields by category
  const { textFields, propertyFields, hourFields, tagFields } = useMemo(() => {
    const textFields = sortedFieldConfigs.filter((f) => SPECIAL_FIELDS.has(f.key));
    const hourFields = sortedFieldConfigs.filter((f) => HOUR_FIELDS.has(f.key));
    const tagFields = sortedFieldConfigs.filter(
      (f) => (f.type === "editable-tags" || f.type === "badge-list") && !HOUR_FIELDS.has(f.key) && !SPECIAL_FIELDS.has(f.key)
    );
    const propertyFields = sortedFieldConfigs.filter(
      (f) => !SPECIAL_FIELDS.has(f.key) && !HOUR_FIELDS.has(f.key) && f.type !== "editable-tags" && f.type !== "badge-list"
    );
    
    return { textFields, propertyFields, hourFields, tagFields };
  }, [sortedFieldConfigs]);

  if (!task) return null;

  const formatFullDateTime = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render a field based on its config
  const renderField = (fieldConfig: FieldConfig) => {
    const { key, name, type, options } = fieldConfig;
    const value = task[key];
    const fieldOptions = uniqueFieldValues[key] || [];

    const handleChange = (newValue: unknown) => {
      onUpdate(task.id, key, newValue);
    };

    switch (type) {
      case "status":
        return (
          <StatusCell
            value={value as Status}
            onChange={(v: Status) => handleChange(v)}
          />
        );
      case "priority":
        return (
          <PriorityCell
            value={value as Priority}
            onChange={(v: Priority) => handleChange(v)}
          />
        );
      case "editable-owner":
        return (
          <EditableOwnerCell
            value={(value as string) || ""}
            onChange={handleChange as (v: string) => void}
            options={fieldOptions}
            onAddOption={() => {}}
            placeholder={`Select ${name.toLowerCase()}...`}
          />
        );
      case "editable-combobox":
      case "select":
        const comboOptions = fieldOptions.length > 0 
          ? fieldOptions 
          : (options?.choices as string[]) || [];
        return (
          <EditableComboboxCell
            value={(value as string) || ""}
            onChange={handleChange as (v: string) => void}
            options={comboOptions}
            onAddOption={() => {}}
            placeholder={`Select ${name.toLowerCase()}...`}
          />
        );
      case "editable-text":
      case "text":
        return (
          <EditableTextCell
            value={(value as string) || ""}
            onChange={handleChange as (v: string) => void}
            multiline={SPECIAL_FIELDS.has(key)}
            className={SPECIAL_FIELDS.has(key) ? "text-sm text-foreground/80 leading-relaxed" : undefined}
          />
        );
      case "editable-number":
      case "number":
        return (
          <EditableNumberCell
            value={(value as number) || 0}
            onChange={handleChange as (v: number) => void}
            suffix={(options?.suffix as string) || ""}
          />
        );
      case "editable-date":
      case "date":
        return (
          <EditableDateCell
            value={value as Date | null}
            onChange={handleChange as (v: Date | null) => void}
          />
        );
      case "editable-tags":
      case "badge-list":
        return (
          <EditableTagsCell
            value={(value as string[]) || []}
            onChange={handleChange as (v: string[]) => void}
            placeholder={`Add ${name.toLowerCase()}...`}
          />
        );
      case "multiselect":
        const multiselectOptions = fieldOptions.length > 0 
          ? fieldOptions 
          : (options?.choices as string[]) || [];
        return (
          <EditableMultiselectCell
            value={(value as string[]) || []}
            onChange={handleChange as (v: string[]) => void}
            options={multiselectOptions}
            placeholder={`Select ${name.toLowerCase()}...`}
          />
        );
      case "checkbox":
        return (
          <EditableCheckboxCell
            value={(value as boolean) || false}
            onChange={handleChange as (v: boolean) => void}
          />
        );
      default:
        return (
          <EditableTextCell
            value={String(value || "")}
            onChange={handleChange as (v: string) => void}
          />
        );
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[650px] bg-card border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                {task.id}
              </span>
              <h2 className="text-xl font-semibold text-foreground">
                Task Details
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 transition-all duration-200 hover:scale-110 hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Title - Always show if present in configs or as fallback */}
            {(textFields.find((f) => f.key === "title") || !fieldConfigs.length) && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Title
                </label>
                <EditableTextCell
                  value={(task.title as string) || ""}
                  onChange={(value) => onUpdate(task.id, "title", value)}
                  className="text-xl font-semibold"
                />
              </div>
            )}

            {/* Text fields (problemStatement, solutionDesign, benefits, otherUseCases) */}
            {textFields
              .filter((f) => f.key !== "title")
              .map((fieldConfig) => (
                <div key={fieldConfig.id} className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {fieldConfig.name}
                  </label>
                  {renderField(fieldConfig)}
                </div>
              ))}

            {/* Properties Grid */}
            {propertyFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Properties
                </h4>

                <div className="grid gap-4">
                  {propertyFields.map((fieldConfig) => {
                    const Icon = getFieldIcon(fieldConfig.key, fieldConfig.type);
                    return (
                      <div key={fieldConfig.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="h-4 w-4" />
                          {fieldConfig.name}
                        </div>
                        {renderField(fieldConfig)}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hours & Metrics */}
            {hourFields.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Time & Metrics
                </h4>

                <div className={`grid grid-cols-${Math.min(hourFields.length, 3)} gap-4`}>
                  {hourFields.map((fieldConfig, index) => (
                    <div key={fieldConfig.id} className="bg-muted/30 rounded-lg p-4 text-center">
                      <div className={`text-2xl font-bold ${index === hourFields.length - 1 ? "text-success" : "text-foreground"}`}>
                        <EditableNumberCell
                          value={(task[fieldConfig.key] as number) || 0}
                          onChange={(value) => onUpdate(task.id, fieldConfig.key, value)}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {fieldConfig.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tag fields (tools, tags, etc.) */}
            {tagFields.map((fieldConfig) => {
              const Icon = getFieldIcon(fieldConfig.key, fieldConfig.type);
              return (
                <div key={fieldConfig.id} className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <Icon className="h-3.5 w-3.5" />
                    {fieldConfig.name}
                  </div>
                  {renderField(fieldConfig)}
                </div>
              );
            })}

            {/* Timeline */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Timeline
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Last Updated
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFullDateTime(task.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Created
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFullDateTime(task.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity / History */}
            <TaskHistory taskId={task.id} dbTaskId={dbTaskId} workspaceId={workspaceId} />
          </div>
        </div>
      </div>
    </>
  );
}
