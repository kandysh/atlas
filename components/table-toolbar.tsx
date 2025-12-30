"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableToolbarProps {
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
}

const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
];

export function TableToolbar({
  statusFilter,
  onStatusFilterChange,
}: TableToolbarProps) {
  const isFiltered = statusFilter.length > 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 bg-transparent transition-all duration-200 hover:scale-105 hover:bg-muted/50"
          >
            Status
            {statusFilter.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground transition-all duration-200">
                {statusFilter.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={statusFilter.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onStatusFilterChange([...statusFilter, option.value]);
                } else {
                  onStatusFilterChange(
                    statusFilter.filter((v) => v !== option.value),
                  );
                }
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => onStatusFilterChange([])}
          className="h-9 px-2 lg:px-3 hover:bg-muted/50 transition-all duration-200"
        >
          Reset
          <X className="ml-2 h-4 w-4 transition-transform duration-200 hover:scale-110" />
        </Button>
      )}
    </div>
  );
}
