"use client"

import { X, Calendar, User, Tag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusCell } from "@/components/status-cell"
import { PriorityCell } from "@/components/priority-cell"
import { DateCell } from "@/components/date-cell"
import { EditableCell } from "@/components/editable-cell"
import { cn } from "@/lib/utils"

type Task = {
  id: string
  name: string
  status: "todo" | "in-progress" | "testing" | "done" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  dueDate: string
  tags: string[]
  createdAt?: string
  updatedAt?: string
  description?: string
}

type TaskDrawerProps = {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, field: keyof Task, value: any) => void
}

export function TaskDrawer({ task, isOpen, onClose, onUpdate }: TaskDrawerProps) {
  if (!task) return null

  const createdAt = task.createdAt || "2024-12-01T10:00:00Z"
  const updatedAt = task.updatedAt || new Date().toISOString()

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
          "fixed right-0 top-0 h-full w-full md:w-[600px] bg-card border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Task Details</h2>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Task Name</label>
              <div className="text-2xl font-semibold">
                <EditableCell
                  value={task.name}
                  onSave={(value) => onUpdate(task.id, "name", value)}
                  className="text-2xl font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <EditableCell
                value={task.description || "No description provided for this task."}
                onSave={(value) => onUpdate(task.id, "description", value)}
                className="text-sm text-foreground/80 leading-relaxed"
              />
            </div>

            {/* Properties Grid */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Properties</h4>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded bg-muted flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-foreground/40" />
                  </div>
                  Status
                </div>
                <StatusCell value={task.status} onChange={(value) => onUpdate(task.id, "status", value)} />
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 rounded bg-muted flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-foreground/40" />
                  </div>
                  Priority
                </div>
                <PriorityCell value={task.priority} onChange={(value) => onUpdate(task.id, "priority", value)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  Assignee
                </div>
                <div className="flex items-center gap-2">
                  <EditableCell
                    value={task.assignee}
                    onSave={(value) => onUpdate(task.id, "assignee", value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                <DateCell value={task.dueDate} onChange={(value) => onUpdate(task.id, "dueDate", value)} />
              </div>

              {/* Tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  Tags
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-accent/20 text-accent-foreground transition-all duration-200 hover:scale-105"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Timeline</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(updatedAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Created</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
