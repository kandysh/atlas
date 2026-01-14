"use client";

import { Circle, CircleDot, PlayCircle, Ban, FlaskConical, CircleCheck } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Status } from "@/data/project";

type StatusCellProps = {
  value: Status;
  onChange: (value: Status) => void;
};

const statusConfig = {
  todo: {
    label: "To Do",
    icon: Circle,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  "in-progress": {
    label: "In Progress",
    icon: PlayCircle,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  testing: {
    label: "Testing",
    icon: FlaskConical,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  done: {
    label: "Done",
    icon: CircleDot,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  blocked: {
    label: "Blocked",
    icon: Ban,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
};

export function StatusCell({ value, onChange }: StatusCellProps) {
  const config = statusConfig[value];
  const Icon = config.icon;
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 justify-start gap-2 font-normal hover:bg-muted/50 transition-all duration-200 hover:scale-105 hover:shadow-sm",
            config.bgColor,
          )}
        >
          <Icon
            className={cn(
              "h-3.5 w-3.5 transition-all duration-200",
              config.color,
              value === "in-progress" && "animate-spin",
            )}
          />
          <span className="text-sm">{config.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0 bg-card border-border shadow-lg"
        align="start"
      >
        <Command className="bg-card">
          <CommandInput
            placeholder="Search status..."
            className="h-9 text-sm border-none focus:ring-0"
          />
          <CommandList>
            <CommandEmpty className="py-4 text-sm text-muted-foreground text-center">
              No status found.
            </CommandEmpty>
            <CommandGroup className="p-1">
              {(
                Object.entries(statusConfig) as [
                  Status,
                  (typeof statusConfig)[Status],
                ][]
              ).map(([key, cfg]) => {
                const ItemIcon = cfg.icon;
                return (
                  <CommandItem
                    key={key}
                    value={cfg.label}
                    onSelect={() => {
                      onChange(key);
                      setOpen(false);
                    }}
                    className="gap-2 transition-all duration-200 hover:bg-muted/50 cursor-pointer rounded-sm"
                  >
                    <ItemIcon
                      className={cn(
                        "h-3.5 w-3.5 transition-all duration-200",
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
