"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "@/data/project"
import { ArrowUpDown } from "lucide-react"
import { EditableCell } from "@/components/cells/EditableCell"
import { StatusCell } from "@/components/cells/StatusCell"
import { MultiSelectCell } from "@/components/cells/MultiSelectCell"
import { PriorityCell } from "@/components/cells/PriorityCell"
import { toast } from "sonner"

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          Task Title
          <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
        </button>
      )
    },
    cell: ({ row }) => {
      return (
        <EditableCell
          value={row.getValue("title")}
          onSave={(value) => {
            toast.success("Title updated")
          }}
          placeholder="Enter task title"
        />
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          Status
          <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
        </button>
      )
    },
    cell: ({ row }) => {
      return (
        <StatusCell
          value={row.getValue("status")}
          onChange={(value) => {
            toast.success(`Status changed to ${value}`)
          }}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          Priority
          <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
        </button>
      )
    },
    cell: ({ row }) => {
      const priority = row.getValue("priority") as Task["priority"]
      if (!priority) return <div className="text-sm text-muted-foreground">-</div>
      return (
        <PriorityCell
          value={priority}
          onChange={(value) => {
            toast.success(`Priority changed to ${value}`)
          }}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "owner",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          Owner
          <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
        </button>
      )
    },
    cell: ({ row }) => {
      return (
        <EditableCell
          value={row.getValue("owner")}
          onSave={(value) => {
            toast.success("Owner updated")
          }}
          placeholder="Enter owner name"
        />
      )
    },
  },
  {
    accessorKey: "assetClass",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          Asset Class
          <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
        </button>
      )
    },
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.getValue("assetClass")}</div>
    },
  },
  {
    accessorKey: "tools",
    header: "Tools",
    cell: ({ row }) => {
      const tools = row.getValue("tools") as string[]
      const allTools = ["Python", "Excel", "SQL", "PowerBI", "Tableau", "R", "JavaScript", "AWS"]
      return (
        <MultiSelectCell
          value={tools}
          options={allTools}
          onChange={(value) => {
            toast.success("Tools updated")
          }}
          placeholder="Select tools"
        />
      )
    },
  },
  {
    accessorKey: "completionDate",
    header: ({ column }) => {
      return (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          Completion Date
          <ArrowUpDown className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
        </button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("completionDate") as Date | null
      if (!date) return <div className="text-sm text-muted-foreground">-</div>
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      )
    },
  },
]
