"use client"

import { useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type MultiSelectCellProps = {
  value: string[]
  options: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function MultiSelectCell({ value, options, onChange, placeholder = "Select..." }: MultiSelectCellProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option))
    } else {
      onChange([...value, option])
    }
  }

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== option))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto min-h-[32px] justify-start font-normal hover:bg-muted/50 w-full py-1"
        >
          {value.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {value.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs gap-1"
                >
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(item, e)}
                  />
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option)
                return (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
