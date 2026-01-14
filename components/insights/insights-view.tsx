"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface Task {
  id: string
  status: string
  priority: string
  dueDate: string | null
}

interface InsightsViewProps {
  tasks: Task[]
}

export function InsightsView({ tasks }: InsightsViewProps) {
  const completedTasks = tasks.filter((t) => t.status === "Done").length
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length
  const todoTasks = tasks.filter((t) => t.status === "To Do").length
  const blockedTasks = tasks.filter((t) => t.status === "Blocked").length

  const urgentTasks = tasks.filter((t) => t.priority === "Urgent").length
  const highTasks = tasks.filter((t) => t.priority === "High").length

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date() && t.status !== "Done"
  }).length

  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">Analytics and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <ListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">{todoTasks} in backlog</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">{urgentTasks} urgent tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Status Breakdown</CardTitle>
            <CardDescription className="text-muted-foreground">Task distribution by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBar label="Done" count={completedTasks} total={tasks.length} color="bg-success" />
            <StatusBar label="In Progress" count={inProgressTasks} total={tasks.length} color="bg-info" />
            <StatusBar label="To Do" count={todoTasks} total={tasks.length} color="bg-warning" />
            <StatusBar label="Blocked" count={blockedTasks} total={tasks.length} color="bg-error" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Priority Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBar label="Urgent" count={urgentTasks} total={tasks.length} color="bg-priority-urgent" />
            <StatusBar label="High" count={highTasks} total={tasks.length} color="bg-priority-high" />
            <StatusBar
              label="Medium"
              count={tasks.filter((t) => t.priority === "Medium").length}
              total={tasks.length}
              color="bg-priority-medium"
            />
            <StatusBar
              label="Low"
              count={tasks.filter((t) => t.priority === "Low").length}
              total={tasks.length}
              color="bg-priority-low"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{count}</span>
      </div>
      <div className="h-2 bg-accent rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  )
}
