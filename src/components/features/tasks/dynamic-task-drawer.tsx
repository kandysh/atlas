"use client";

import React, { useMemo } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { FieldConfig, Task } from "@/src/lib/db/schema";
import { TaskHistory } from "./task-history";
import { renderField } from "@/src/lib/utils/fields/field-renderers";
import {
  groupFieldsBySection,
  getDrawerFields,
  getDrawerConfig,
} from "@/src/lib/utils/fields/field-options";
import { EditableTextCell } from "./editable-cells";

type DynamicTaskDrawerProps = {
  task: Task | null;
  tasks: Task[];
  fieldConfigs: FieldConfig[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, patch: Record<string, unknown>) => void;
  workspaceId: string;
};

/**
 * Metadata-driven task detail drawer
 * Renders fields dynamically based on field_configs
 */
export function DynamicTaskDrawer({
  task,
  tasks,
  fieldConfigs,
  isOpen,
  onClose,
  onUpdate,
  workspaceId,
}: DynamicTaskDrawerProps) {
  // Extract unique values for select-type fields from all tasks
  const uniqueValues = useMemo(() => {
    const values: Record<string, string[]> = {};
    const selectTypes = ["editable-owner", "editable-combobox", "select"];

    for (const config of fieldConfigs) {
      if (selectTypes.includes(config.type)) {
        const fieldValues = tasks
          .map((t) => (t.data as Record<string, unknown>)?.[config.key])
          .filter((v): v is string => typeof v === "string" && v.length > 0);
        values[config.key] = Array.from(new Set(fieldValues)).sort();
      }
    }
    return values;
  }, [tasks, fieldConfigs]);

  // Group fields by section for rendering
  const drawerFields = useMemo(
    () => getDrawerFields(fieldConfigs),
    [fieldConfigs]
  );
  const sectionedFields = useMemo(
    () => groupFieldsBySection(drawerFields),
    [drawerFields]
  );

  if (!task) return null;

  const taskData = (task.data || {}) as Record<string, unknown>;
  const title = (taskData.title as string) || "";

  const handleFieldChange = (key: string, value: unknown) => {
    onUpdate(task.id, { [key]: value });
  };

  const formatFullDateTime = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get section icon
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "Hours":
        return <Clock className="h-3.5 w-3.5" />;
      case "Timeline":
        return <Calendar className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[650px] bg-card border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                {task.displayId}
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
            {/* Title - always rendered specially */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Title
              </label>
              <EditableTextCell
                value={title}
                onChange={(value) => handleFieldChange("title", value)}
                className="text-xl font-semibold"
              />
            </div>

            {/* Render sections dynamically */}
            {Array.from(sectionedFields.entries()).map(([section, fields]) => {
              if (fields.length === 0) return null;

              // Special rendering for Hours section
              if (section === "Hours") {
                return (
                  <div
                    key={section}
                    className="space-y-4 pt-4 border-t border-border"
                  >
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      {getSectionIcon(section)}
                      Time & Metrics
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {fields.map((field) => (
                        <div
                          key={field.key}
                          className="bg-muted/30 rounded-lg p-4 text-center"
                        >
                          <div className="text-2xl font-bold text-foreground">
                            {renderField({
                              value: taskData[field.key],
                              onChange: (v) => handleFieldChange(field.key, v),
                              fieldConfig: field,
                              options: uniqueValues[field.key],
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {field.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Standard section rendering
              return (
                <div
                  key={section}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    {getSectionIcon(section)}
                    {section}
                  </h4>

                  <div className="grid gap-4">
                    {fields.map((field) => {
                      const drawerConfig = getDrawerConfig(field);
                      const isFullWidth = drawerConfig.width === "full";

                      // Properties-style rendering for Core section
                      if (section === "Core") {
                        return (
                          <div
                            key={field.key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {field.name}
                            </div>
                            {renderField({
                              value: taskData[field.key],
                              onChange: (v) => handleFieldChange(field.key, v),
                              fieldConfig: field,
                              options: uniqueValues[field.key],
                            })}
                          </div>
                        );
                      }

                      // Detail-style rendering for other sections
                      return (
                        <div
                          key={field.key}
                          className={cn(
                            "space-y-2",
                            !isFullWidth && "col-span-1"
                          )}
                        >
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            {field.name}
                          </label>
                          {renderField({
                            value: taskData[field.key],
                            onChange: (v) => handleFieldChange(field.key, v),
                            fieldConfig: field,
                            options: uniqueValues[field.key],
                            className:
                              field.type === "editable-text"
                                ? "text-sm text-foreground/80 leading-relaxed"
                                : undefined,
                          })}
                          {drawerConfig.helpText && (
                            <p className="text-xs text-muted-foreground">
                              {drawerConfig.helpText}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Timeline - always at the bottom */}
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

            {/* Task History */}
            <TaskHistory
              taskId={task.displayId}
              dbTaskId={task.id}
              workspaceId={workspaceId}
            />
          </div>
        </div>
      </div>
    </>
  );
}
