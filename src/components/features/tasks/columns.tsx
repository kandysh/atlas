"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task, Status, Priority } from "@/src/lib/types";
import { StatusCell } from "./status-cell";
import { PriorityCell } from "./priority-cell";
import {
  EditableTextCell,
  EditableNumberCell,
  EditableOwnerCell,
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

export const createColumns = (uniqueOwners: string[]): ColumnDef<Task>[] => [
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
        console.log("Update title", row.original.id, newTitle);
        // TODO: Call API to update
      };

      const handleProblemChange = (newProblem: string) => {
        console.log("Update problem", row.original.id, newProblem);
        // TODO: Call API to update
      };

      return (
        <div className="flex flex-col gap-2 py-2 min-w-[300px]">
          <EditableTextCell
            value={row.original.title}
            onChange={handleTitleChange}
            className="font-medium"
          />
          {row.original.problemStatement && (
            <EditableTextCell
              value={row.original.problemStatement}
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
    header: "Status",
    cell: ({ row }) => {
      const handleStatusChange = (newStatus: Status) => {
        console.log("Update status", row.original.id, newStatus);
        // TODO: Call API to update
      };

      return (
        <StatusCell
          value={row.original.status}
          onChange={handleStatusChange}
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const handlePriorityChange = (newPriority: Priority) => {
        console.log("Update priority", row.original.id, newPriority);
        // TODO: Call API to update
      };

      return (
        <PriorityCell
          value={row.original.priority}
          onChange={handlePriorityChange}
        />
      );
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const handleOwnerChange = (newOwner: string) => {
        console.log("Update owner", row.original.id, newOwner);
        // TODO: Call API to update
      };

      return (
        <EditableOwnerCell
          value={row.original.owner}
          onChange={handleOwnerChange}
          options={uniqueOwners}
          onAddOption={() => {}}
        />
      );
    },
  },
  {
    accessorKey: "assetClass",
    header: "Asset Class",
    cell: ({ row }) => {
      const handleAssetClassChange = (newAssetClass: string) => {
        console.log("Update asset class", row.original.id, newAssetClass);
        // TODO: Call API to update
      };

      return (
        <EditableTextCell
          value={row.original.assetClass}
          onChange={handleAssetClassChange}
        />
      );
    },
  },
  {
    accessorKey: "teamsInvolved",
    header: "Teams",
    cell: ({ row }) => {
      const teams = row.original.teamsInvolved;
      if (teams.length === 0)
        return <span className="text-muted-foreground">-</span>;
      if (teams.length === 1) return <Badge variant="secondary">{teams[0]}</Badge>;
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
        console.log("Update estimated hours", row.original.id, newHours);
        // TODO: Call API to update
      };

      return (
        <EditableNumberCell
          value={row.original.currentHrs}
          onChange={handleHoursChange}
          suffix="h"
        />
      );
    },
  },
  {
    accessorKey: "workedHrs",
    header: "Worked",
    cell: ({ row }) => {
      const handleWorkedChange = (newHours: number) => {
        console.log("Update worked hours", row.original.id, newHours);
        // TODO: Call API to update
      };

      return (
        <EditableNumberCell
          value={row.original.workedHrs}
          onChange={handleWorkedChange}
          suffix="h"
        />
      );
    },
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
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit task</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default export with empty owners array (for backwards compatibility)
export const columns = createColumns([]);
