"use client";

import { X } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { AnalyticsFilters } from "@/src/lib/actions/analytics";

interface FilterControlsProps {
  filters: AnalyticsFilters;
  onFilterChange: (filters: AnalyticsFilters) => void;
  statuses: string[];
  priorities: string[];
  owners: string[];
  teams: string[];
  assetClasses: string[];
}

const statusLabels: Record<string, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  testing: "Testing",
  done: "Done",
  completed: "Completed",
  blocked: "Blocked",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function FilterControls({
  filters,
  onFilterChange,
  statuses,
  priorities,
  owners,
  teams,
  assetClasses,
}: FilterControlsProps) {
  const hasActiveFilters =
    filters.status ||
    filters.priority ||
    filters.assignee ||
    filters.team ||
    (filters.assetClass && filters.assetClass !== "All");

  const clearFilter = (key: keyof AnalyticsFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="space-y-3">
      {/* Filter Selects */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              status: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status] || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              priority: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priorityLabels[priority] || priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assignee || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              assignee: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {owners.map((owner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.team || "all"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              team: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.assetClass || "All"}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              assetClass: value === "All" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Asset Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Assets</SelectItem>
            {assetClasses.map((assetClass) => (
              <SelectItem key={assetClass} value={assetClass}>
                {assetClass}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusLabels[filters.status] || filters.status}
              <button
                onClick={() => clearFilter("status")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove status filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              Priority: {priorityLabels[filters.priority] || filters.priority}
              <button
                onClick={() => clearFilter("priority")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove priority filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.assignee && (
            <Badge variant="secondary" className="gap-1">
              Owner: {filters.assignee}
              <button
                onClick={() => clearFilter("assignee")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove owner filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.team && (
            <Badge variant="secondary" className="gap-1">
              Team: {filters.team}
              <button
                onClick={() => clearFilter("team")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove team filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.assetClass && filters.assetClass !== "All" && (
            <Badge variant="secondary" className="gap-1">
              Asset: {filters.assetClass}
              <button
                onClick={() => clearFilter("assetClass")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove asset class filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
