"use client";

import { useState } from "react";
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
  onFiltersChange: (filters: AnalyticsFilters) => void;
  statusOptions?: string[];
  priorityOptions?: string[];
  ownerOptions?: string[];
  teamOptions?: string[];
}

export function FilterControls({
  filters,
  onFiltersChange,
  statusOptions = ["todo", "in-progress", "testing", "done", "completed", "blocked"],
  priorityOptions = ["low", "medium", "high", "urgent"],
  ownerOptions = [],
  teamOptions = [],
}: FilterControlsProps) {
  const updateFilter = (key: keyof AnalyticsFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: keyof AnalyticsFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Selects */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status || ""}
          onValueChange={(value) => updateFilter("status", value || undefined)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || ""}
          onValueChange={(value) => updateFilter("priority", value || undefined)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-10"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 transition-all hover:shadow-md"
            >
              Status: {filters.status}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter("status")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.priority && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 transition-all hover:shadow-md"
            >
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter("priority")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.assignee && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 transition-all hover:shadow-md"
            >
              Owner: {filters.assignee}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter("assignee")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.assetClass && filters.assetClass !== "All" && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 transition-all hover:shadow-md"
            >
              Asset: {filters.assetClass}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => clearFilter("assetClass")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
