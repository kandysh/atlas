"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Task, Status, Priority } from "@/data/project";
import { StatusCell } from "@/components/status-cell";
import { PriorityCell } from "@/components/priority-cell";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Task>[] = [
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
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.original.title}</span>
          {row.original.problemStatement && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.problemStatement}
            </span>
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
        // TODO: Update task status
        console.log("Update status", row.original.id, newStatus);
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
        // TODO: Update task priority
        console.log("Update priority", row.original.id, newPriority);
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
      return (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">
              {row.original.owner
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <span className="text-sm">{row.original.owner}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "assetClass",
    header: "Asset Class",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-normal">
          {row.original.assetClass}
        </Badge>
      );
    },
  },
  {
    accessorKey: "teamsInvolved",
    header: "Teams",
    cell: ({ row }) => {
      const teams = row.original.teamsInvolved;
      if (teams.length === 0) return <span className="text-muted-foreground">-</span>;
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
      return <span className="text-sm">{row.original.currentHrs}h</span>;
    },
  },
  {
    accessorKey: "workedHrs",
    header: "Worked",
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.workedHrs}h</span>;
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
