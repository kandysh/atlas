"use client"

import { CheckCircle2, ChevronDown, ChevronRight, LayoutDashboard, ListTodo } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [tasksExpanded, setTasksExpanded] = useState(true)

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Workspace</h2>
        <p className="text-xs text-muted-foreground mt-1">Project Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {/* Tasks Section */}
        <div>
          <button
            onClick={() => setTasksExpanded(!tasksExpanded)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors duration-200"
          >
            {tasksExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Tasks</span>
          </button>

          {tasksExpanded && (
            <div className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => onViewChange("active")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  currentView === "active"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Active Board</span>
              </button>

              <button
                onClick={() => onViewChange("completed")}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  currentView === "completed"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed</span>
              </button>
            </div>
          )}
        </div>

        {/* Insights Section */}
        <button
          onClick={() => onViewChange("insights")}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
            currentView === "insights"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="font-medium">Insights</span>
        </button>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
