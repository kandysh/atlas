'use client';

import { Check, Plus, X } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';

interface MultiSelectFilterProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  labelMap?: Record<string, string>;
  colorMap?: Record<string, string>;
}

export function MultiSelectFilter({
  title,
  options,
  selected,
  onChange,
  labelMap = {},
  colorMap = {},
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const getLabel = (value: string) => labelMap[value] || value;

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const clearAll = () => {
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 rounded-full border-dashed gap-1.5 text-xs font-normal',
            selected.length > 0 &&
              'border-solid border-primary/50 bg-primary/5 text-primary hover:bg-primary/10',
          )}
        >
          {selected.length > 0 ? (
            <>
              <span>{title}</span>
              <Badge
                variant="secondary"
                className="h-5 px-1.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary"
              >
                {selected.length}
              </Badge>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              <span>{title}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">
              {title}
            </span>
            {selected.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-0.5 max-h-64 overflow-auto">
            {options.map((value) => {
              const isSelected = selected.includes(value);
              const color = colorMap[value];

              return (
                <button
                  key={value}
                  onClick={() => handleToggle(value)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground',
                  )}
                >
                  <div
                    className={cn(
                      'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-border',
                    )}
                  >
                    {isSelected && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </div>
                  {color && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  <span className="flex-1 text-left">{getLabel(value)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ActiveFilterBadgesProps {
  filters: Record<string, string | string[] | undefined>;
  labelMaps?: Record<string, Record<string, string>>;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterBadges({
  filters,
  labelMaps = {},
  onClearFilter,
  onClearAll,
}: ActiveFilterBadgesProps) {
  const activeFilters = Object.entries(filters).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== 'All';
  });

  if (activeFilters.length === 0) return null;

  const getDisplayValue = (key: string, value: string | string[]) => {
    const labelMap = labelMaps[key] || {};
    if (Array.isArray(value)) {
      return value.map((v) => labelMap[v] || v).join(', ');
    }
    return labelMap[value] || value;
  };

  const keyLabels: Record<string, string> = {
    status: 'Status',
    priority: 'Priority',
    assignee: 'Owner',
    team: 'Team',
    assetClass: 'Asset',
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="gap-1">
          {keyLabels[key] || key}: {getDisplayValue(key, value!)}
          <button
            onClick={() => onClearFilter(key)}
            className="ml-1 hover:text-destructive"
            aria-label={`Remove ${key} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Clear all filters"
      >
        Clear all
      </Button>
    </div>
  );
}
