"use client";

import { X, Calendar, User, Clock, Briefcase, Users, Tag, FileText } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { StatusCell } from "./status-cell";
import { PriorityCell } from "./priority-cell";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { Task, Status, Priority } from "@/src/lib/types";
import { EditableTextCell, EditableNumberCell, EditableDateCell } from "./editable-cells";

type TaskDetailDrawerProps = {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, field: keyof Task, value: unknown) => void;
};

export function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  onUpdate,
}: TaskDetailDrawerProps) {
  if (!task) return null;

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Title
              </label>
              <EditableTextCell
                value={task.title}
                onChange={(value) => onUpdate(task.id, "title", value)}
                className="text-xl font-semibold"
              />
            </div>

            {/* Problem Statement */}
            {task.problemStatement && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Problem Statement
                </label>
                <EditableTextCell
                  value={task.problemStatement}
                  onChange={(value) =>
                    onUpdate(task.id, "problemStatement", value)
                  }
                  multiline
                  className="text-sm text-foreground/80 leading-relaxed"
                />
              </div>
            )}

            {/* Solution Design */}
            {task.solutionDesign && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Solution Design
                </label>
                <EditableTextCell
                  value={task.solutionDesign}
                  onChange={(value) =>
                    onUpdate(task.id, "solutionDesign", value)
                  }
                  multiline
                  className="text-sm text-foreground/80 leading-relaxed"
                />
              </div>
            )}

            {/* Properties Grid */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Properties
              </h4>

              <div className="grid gap-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 rounded bg-muted flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-foreground/40" />
                    </div>
                    Status
                  </div>
                  <StatusCell
                    value={task.status}
                    onChange={(value: Status) =>
                      onUpdate(task.id, "status", value)
                    }
                  />
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 rounded bg-muted flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-foreground/40" />
                    </div>
                    Priority
                  </div>
                  <PriorityCell
                    value={task.priority}
                    onChange={(value: Priority) =>
                      onUpdate(task.id, "priority", value)
                    }
                  />
                </div>

                {/* Owner */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Owner
                  </div>
                  <EditableTextCell
                    value={task.owner}
                    onChange={(value) => onUpdate(task.id, "owner", value)}
                    className="text-sm"
                  />
                </div>

                {/* Asset Class */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Asset Class
                  </div>
                  <EditableTextCell
                    value={task.assetClass}
                    onChange={(value) => onUpdate(task.id, "assetClass", value)}
                    className="text-sm"
                  />
                </div>

                {/* Teams Involved */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Teams
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {task.teamsInvolved.map((team) => (
                      <Badge key={team} variant="secondary">
                        {team}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Completion Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Completion Date
                  </div>
                  <EditableDateCell
                    value={task.completionDate}
                    onChange={(value) =>
                      onUpdate(task.id, "completionDate", value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Hours & Metrics */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Time & Metrics
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    <EditableNumberCell
                      value={task.currentHrs}
                      onChange={(value) =>
                        onUpdate(task.id, "currentHrs", value)
                      }
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Est. Hours
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    <EditableNumberCell
                      value={task.workedHrs}
                      onChange={(value) =>
                        onUpdate(task.id, "workedHrs", value)
                      }
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Worked
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    <EditableNumberCell
                      value={task.savedHrs}
                      onChange={(value) =>
                        onUpdate(task.id, "savedHrs", value)
                      }
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Saved
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            {task.benefits && (
              <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Benefits
                </label>
                <EditableTextCell
                  value={task.benefits}
                  onChange={(value) => onUpdate(task.id, "benefits", value)}
                  multiline
                  className="text-sm text-foreground/80 leading-relaxed"
                />
              </div>
            )}

            {/* Other Use Cases */}
            {task.otherUseCases && (
              <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Other Use Cases
                </label>
                <EditableTextCell
                  value={task.otherUseCases}
                  onChange={(value) => onUpdate(task.id, "otherUseCases", value)}
                  multiline
                  className="text-sm text-foreground/80 leading-relaxed"
                />
              </div>
            )}

            {/* Tools */}
            {task.tools && task.tools.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FileText className="h-3.5 w-3.5" />
                  Tools & Technologies
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {task.tools.map((tool) => (
                    <Badge
                      key={tool}
                      variant="outline"
                      className="bg-primary/5 border-primary/20"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {task.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-accent/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </>
  );
}
