"use client";

import { useTaskEvents } from "@/src/lib/query/hooks";
import { 
  History, 
  Plus, 
  Pencil, 
  Copy, 
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface TaskHistoryProps {
  taskId: string | null;
  dbTaskId?: string | null;
}

// Field name display mapping
const fieldLabels: Record<string, string> = {
  title: "Title",
  status: "Status",
  priority: "Priority",
  owner: "Owner",
  assetClass: "Asset Class",
  teamsInvolved: "Teams",
  theme: "Theme",
  problemStatement: "Problem Statement",
  solutionDesign: "Solution Design",
  benefits: "Benefits",
  currentHrs: "Estimated Hours",
  savedHrs: "Saved Hours",
  workedHrs: "Worked Hours",
  tools: "Tools",
  otherUseCases: "Other Use Cases",
  tags: "Tags",
  completionDate: "Completion Date",
};

// Status display mapping
const statusLabels: Record<string, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "testing": "Testing",
  "done": "Done",
  "completed": "Completed",
  "blocked": "Blocked",
};

// Priority display mapping
const priorityLabels: Record<string, string> = {
  "low": "Low",
  "medium": "Medium",
  "high": "High",
  "urgent": "Urgent",
};

function formatValue(field: string | null, value: unknown): string {
  if (value === null || value === undefined) return "empty";
  
  if (field === "status" && typeof value === "string") {
    return statusLabels[value] || value;
  }
  
  if (field === "priority" && typeof value === "string") {
    return priorityLabels[value] || value;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return "empty";
    return value.join(", ");
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  
  return String(value);
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "created":
      return <Plus className="h-3 w-3" />;
    case "updated":
      return <Pencil className="h-3 w-3" />;
    case "duplicated":
      return <Copy className="h-3 w-3" />;
    case "deleted":
      return <Trash2 className="h-3 w-3" />;
    default:
      return <History className="h-3 w-3" />;
  }
}

function getEventColor(eventType: string): string {
  switch (eventType) {
    case "created":
      return "bg-success/20 text-success";
    case "updated":
      return "bg-info/20 text-info";
    case "duplicated":
      return "bg-warning/20 text-warning";
    case "deleted":
      return "bg-destructive/20 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function TaskHistory({ taskId, dbTaskId }: TaskHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: events, isLoading } = useTaskEvents(dbTaskId || null, 20);

  if (!dbTaskId) return null;

  const recentEvents = events?.slice(0, isExpanded ? 20 : 5) || [];

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group"
      >
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <History className="h-3.5 w-3.5" />
          Recent Activity
          {events && events.length > 0 && (
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full">
              {events.length}
            </span>
          )}
        </h4>
        {events && events.length > 5 && (
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Show more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </span>
        )}
      </button>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 bg-muted rounded" />
                <div className="h-2 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : recentEvents.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No activity recorded yet</p>
      ) : (
        <div className="space-y-3">
          {recentEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                getEventColor(event.eventType)
              )}>
                {getEventIcon(event.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {event.user?.name || "System"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {event.eventType === "created" && "Created this task"}
                  {event.eventType === "duplicated" && "Duplicated this task"}
                  {event.eventType === "updated" && event.field && (
                    <>
                      Changed <span className="font-medium text-foreground">{fieldLabels[event.field] || event.field}</span>
                      {" "}from{" "}
                      <span className="text-muted-foreground/70 line-through">
                        {formatValue(event.field, event.oldValue)}
                      </span>
                      {" "}to{" "}
                      <span className="text-foreground font-medium">
                        {formatValue(event.field, event.newValue)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
