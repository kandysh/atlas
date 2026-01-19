'use client';

import { ChevronDown, Minus, ChevronUp, AlertCircle } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/src/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { useState } from 'react';
import { Priority } from '@/src/lib/types';

type PriorityCellProps = {
  value: Priority;
  onChange: (value: Priority) => void;
};

const priorityConfig = {
  low: {
    label: 'Low',
    icon: ChevronDown,
    color: 'text-priority-low',
    bgColor: 'bg-priority-low/10',
  },
  medium: {
    label: 'Medium',
    icon: Minus,
    color: 'text-priority-medium',
    bgColor: 'bg-priority-medium/10',
  },
  high: {
    label: 'High',
    icon: ChevronUp,
    color: 'text-priority-high',
    bgColor: 'bg-priority-high/10',
  },
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    color: 'text-priority-urgent',
    bgColor: 'bg-priority-urgent/10',
  },
};

export function PriorityCell({ value, onChange }: PriorityCellProps) {
  const config = priorityConfig[value];
  const Icon = config.icon;
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'h-8 justify-start gap-2 font-normal hover:bg-muted/50 transition-all duration-200 hover:scale-105 hover:shadow-sm',
            config.bgColor,
          )}
        >
          <Icon
            className={cn(
              'h-3.5 w-3.5 transition-all duration-200',
              config.color,
              value === 'urgent' && 'animate-pulse',
            )}
          />
          <span className="text-sm">{config.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0 bg-card border-border shadow-lg"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Command className="bg-card">
          <CommandInput
            placeholder="Search priority..."
            className="h-9 text-sm border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty className="py-4 text-sm text-muted-foreground text-center">
              No priority found.
            </CommandEmpty>
            <CommandGroup className="p-1">
              {(
                Object.entries(priorityConfig) as [
                  Priority,
                  (typeof priorityConfig)[Priority],
                ][]
              ).map(([key, cfg]) => {
                const ItemIcon = cfg.icon;
                return (
                  <CommandItem
                    key={key}
                    value={cfg.label}
                    onSelect={(e) => {
                      onChange(key);
                      setOpen(false);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="gap-2 transition-all duration-200 hover:bg-muted/50 cursor-pointer rounded-sm"
                  >
                    <ItemIcon
                      className={cn(
                        'h-3.5 w-3.5 transition-all duration-200',
                        cfg.color,
                      )}
                    />
                    <span>{cfg.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
