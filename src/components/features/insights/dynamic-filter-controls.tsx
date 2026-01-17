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
import { Skeleton } from "@/src/components/ui/skeleton";
import { AnalyticsFilters, FieldMeta } from "@/src/lib/actions/analytics";

interface DynamicFilterControlsProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  filterableFields: FieldMeta[];
  filterOptions: Record<string, string[]>;
  isLoading?: boolean;
}

export function DynamicFilterControls({
  filters,
  onFiltersChange,
  filterableFields,
  filterOptions,
  isLoading,
}: DynamicFilterControlsProps) {
  const updateFilter = (key: string, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-[140px]" />
          ))}
        </div>
      </div>
    );
  }

  // Only show fields that have actual options
  const fieldsWithOptions = filterableFields.filter(
    (field) => (filterOptions[field.key]?.length || 0) > 0 || (field.choices?.length || 0) > 0
  );

  return (
    <div className="space-y-4">
      {/* Dynamic Filter Selects */}
      <div className="flex flex-wrap gap-2">
        {fieldsWithOptions.map((field) => {
          // Use actual data options, fallback to field config choices
          const options = filterOptions[field.key]?.length > 0 
            ? filterOptions[field.key] 
            : field.choices;

          return (
            <Select
              key={field.key}
              value={filters[field.key] || ""}
              onValueChange={(value) => updateFilter(field.key, value || undefined)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={field.name} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatOptionLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}

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
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === "All") return null;
            const field = filterableFields.find((f) => f.key === key);
            const fieldName = field?.name || key;

            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 transition-all hover:shadow-md"
              >
                {fieldName}: {formatOptionLabel(value)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Format option label for display (capitalize, handle kebab-case)
 */
function formatOptionLabel(option: string): string {
  return option
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
