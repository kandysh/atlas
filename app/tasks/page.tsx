"use client"

import { DataTable } from "@/components/DataTable"
import { columns } from "@/components/columns"
import { useTasks } from "@/lib/tasks/tasks.query"

export default function TasksPage() {
  const { data: tasks, isLoading } = useTasks("All")

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <div className="h-9 w-64 mb-2 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Tasks</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your active project tasks
        </p>
      </div>
      <DataTable columns={columns} data={tasks || []} />
    </div>
  )
}
