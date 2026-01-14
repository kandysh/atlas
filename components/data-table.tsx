"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditableCell } from "@/components/editable-cell"
import { StatusCell } from "@/components/status-cell"
import { PriorityCell } from "@/components/priority-cell"
import { DateCell } from "@/components/date-cell"
import { TaskDrawer } from "@/components/task-drawer"
import { Plus, Search, SlidersHorizontal, ArrowUpDown, Trash2, MoreHorizontal, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Task = {
  id: string
  name: string
  status: "todo" | "in-progress" | "testing" | "done" | "completed" | "blocked"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  dueDate: string
  tags: string[]
}

const initialTasks: Task[] = [
  {
    id: "1",
    name: "Design new landing page",
    status: "in-progress",
    priority: "high",
    assignee: "Sarah Chen",
    dueDate: "2025-01-15",
    tags: ["design", "frontend"],
  },
  {
    id: "2",
    name: "Implement authentication flow",
    status: "todo",
    priority: "urgent",
    assignee: "Alex Kumar",
    dueDate: "2025-01-10",
    tags: ["backend", "security"],
  },
  {
    id: "3",
    name: "Fix mobile responsive issues",
    status: "done",
    priority: "medium",
    assignee: "Jamie Torres",
    dueDate: "2024-12-28",
    tags: ["frontend", "bug"],
  },
  {
    id: "4",
    name: "Database migration",
    status: "blocked",
    priority: "high",
    assignee: "Morgan Lee",
    dueDate: "2025-01-20",
    tags: ["backend", "infrastructure"],
  },
  {
    id: "5",
    name: "Write API documentation",
    status: "todo",
    priority: "low",
    assignee: "Riley Park",
    dueDate: "2025-01-25",
    tags: ["documentation"],
  },
]

export function DataTable() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Task | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    const direction = sortDirection === "asc" ? 1 : -1
    return aValue > bValue ? direction : -direction
  })

  const handleSort = (column: keyof Task) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCellUpdate = (id: string, field: keyof Task, value: any) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, [field]: value } : task)))
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, [field]: value })
    }
  }

  const handleAddRow = () => {
    const newTask: Task = {
      id: String(tasks.length + 1),
      name: "New task",
      status: "todo",
      priority: "medium",
      assignee: "Unassigned",
      dueDate: new Date().toISOString().split("T")[0],
      tags: [],
    }
    setTasks([...tasks, newTask])
  }

  const handleDeleteSelected = () => {
    setTasks(tasks.filter((task) => !selectedRows.has(task.id)))
    setSelectedRows(new Set())
  }

  const toggleRowSelection = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  const toggleAllRows = () => {
    if (selectedRows.size === sortedTasks.length && sortedTasks.length > 0) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(sortedTasks.map((t) => t.id)))
    }
  }

  const handleRowClick = (task: Task) => {
    setSelectedTask(task)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-transparent transition-all duration-200 hover:scale-105 hover:bg-muted/50"
          >
            <SlidersHorizontal className="h-4 w-4 transition-transform duration-200 hover:rotate-90" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive hover:text-destructive bg-transparent transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" />
              Delete ({selectedRows.size})
            </Button>
          )}
          <Button
            onClick={handleAddRow}
            size="sm"
            className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="w-10 px-2 py-3"></th>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === sortedTasks.length && sortedTasks.length > 0}
                    onChange={toggleAllRows}
                    className="rounded border-border bg-background transition-all duration-200 hover:scale-110 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    Task Name
                    <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    Status
                    <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("priority")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    Priority
                    <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("assignee")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    Assignee
                    <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("dueDate")}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
                  >
                    Due Date
                    <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tags</th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr
                  key={task.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/20 transition-all duration-200 cursor-pointer",
                    selectedRows.has(task.id) && "bg-muted/30",
                  )}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, input, [role="combobox"]')) {
                      return
                    }
                    handleRowClick(task)
                  }}
                >
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(task.id)}
                      onChange={() => toggleRowSelection(task.id)}
                      className="rounded border-border bg-background transition-all duration-200 hover:scale-110 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell value={task.name} onSave={(value) => handleCellUpdate(task.id, "name", value)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusCell value={task.status} onChange={(value) => handleCellUpdate(task.id, "status", value)} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityCell
                      value={task.priority}
                      onChange={(value) => handleCellUpdate(task.id, "priority", value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={task.assignee}
                      onSave={(value) => handleCellUpdate(task.id, "assignee", value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <DateCell value={task.dueDate} onChange={(value) => handleCellUpdate(task.id, "dueDate", value)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent-foreground transition-all duration-200 hover:scale-105 hover:bg-accent/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-all duration-200 hover:scale-110 hover:bg-muted/50"
                        >
                          <MoreHorizontal className="h-4 w-4 transition-transform duration-200" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground transition-opacity duration-200">
        <div>
          {selectedRows.size > 0 ? (
            <span>
              {selectedRows.size} of {sortedTasks.length} row(s) selected
            </span>
          ) : (
            <span>{sortedTasks.length} total tasks</span>
          )}
        </div>
      </div>

      {/* Task Drawer */}
      <TaskDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleCellUpdate}
      />
    </div>
  )
}
