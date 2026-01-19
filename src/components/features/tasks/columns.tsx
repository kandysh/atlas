"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task, Status, Priority } from "@/src/lib/types";
import { StatusCell } from "./status-cell";
import { PriorityCell } from "./priority-cell";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableOwnerCell,
  EditableComboboxCell,
} from "./editable-cells";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { format } from "date-fns";

export const createColumns = (
  uniqueOwners: string[],
  uniqueAssetClasses: string[],
  onUpdate?: (taskId: string, field: string, value: any) => void,
  onViewDetails?: (task: Task) => void,
  onDelete?: (taskId: string) => void,
  onDuplicate?: (taskId: string) => void
): ColumnDef<Task>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handleTitleChange = (newTitle: string) => {
        onUpdate?.(row.original.id, "title", newTitle);
      };

      const handleProblemChange = (newProblem: string) => {
        onUpdate?.(row.original.id, "problemStatement", newProblem);
      };

      return (
        <div className="flex flex-col gap-2 py-2 min-w-[300px]">
          <EditableTextCell
            value={(row.original.title as string) || ""}
            onChange={handleTitleChange}
            className="font-medium"
          />
          {(row.original.problemStatement as string) && (
            <EditableTextCell
              value={(row.original.problemStatement as string) || ""}
              onChange={handleProblemChange}
              multiline
              className="text-xs text-muted-foreground"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handleStatusChange = (newStatus: Status) => {
        onUpdate?.(row.original.id, "status", newStatus);
      };

      return (
        <StatusCell value={(row.original.status as Status) || "todo"} onChange={handleStatusChange} />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handlePriorityChange = (newPriority: Priority) => {
        onUpdate?.(row.original.id, "priority", newPriority);
      };

      return (
        <PriorityCell
          value={(row.original.priority as Priority) || "medium"}
          onChange={handlePriorityChange}
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "owner",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Owner
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handleOwnerChange = (newOwner: string) => {
        onUpdate?.(row.original.id, "owner", newOwner);
      };

      return (
        <EditableOwnerCell
          value={(row.original.owner as string) || ""}
          onChange={handleOwnerChange}
          options={uniqueOwners}
          onAddOption={() => {}}
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "assetClass",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Asset Class
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handleAssetClassChange = (newAssetClass: string) => {
        onUpdate?.(row.original.id, "assetClass", newAssetClass);
      };

      return (
        <EditableComboboxCell
          value={(row.original.assetClass as string) || ""}
          onChange={handleAssetClassChange}
          options={uniqueAssetClasses}
          onAddOption={() => {}}
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "teamsInvolved",
    header: "Teams",
    cell: ({ row }) => {
      const teams = (row.original.teamsInvolved as string[]) || [];
      if (teams.length === 0)
        return <span className="text-muted-foreground">-</span>;
      if (teams.length === 1)
        return <Badge variant="secondary">{teams[0]}</Badge>;
      return (
        <div className="flex items-center gap-1">
          <Badge variant="secondary">{teams[0]}</Badge>
          {teams.length > 1 && (
            <Badge variant="secondary">+{teams.length - 1}</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "currentHrs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Est. Hours
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handleHoursChange = (newHours: number) => {
        onUpdate?.(row.original.id, "currentHrs", newHours);
      };

      return (
        <EditableNumberCell
          value={(row.original.currentHrs as number) || 0}
          onChange={handleHoursChange}
          suffix="h"
        />
      );
    },
  },
  {
    accessorKey: "workedHrs",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Worked
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const handleWorkedChange = (newHours: number) => {
        onUpdate?.(row.original.id, "workedHrs", newHours);
      };

      return (
        <EditableNumberCell
          value={(row.original.workedHrs as number) || 0}
          onChange={handleWorkedChange}
          suffix="h"
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div className="text-sm text-muted-foreground">
          {date ? format(new Date(date), "MMM d, yyyy") : "-"}
        </div>
      );
    },
    sortingFn: "datetime",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(row.original.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete?.(row.original.id)}
            >
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default export with empty owners array (for backwards compatibility)
export const columns = createColumns([], []);
