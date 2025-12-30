"use client"

import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

type DateCellProps = {
  value: string
  onChange: (value: string) => void
}

export function DateCell({ value, onChange }: DateCellProps) {
  const [open, setOpen] = useState(false)
  const date = new Date(value)
  const isOverdue = date < new Date() && date.toDateString() !== new Date().toDateString()
  const isToday = date.toDateString() === new Date().toDateString()

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 justify-start gap-2 font-normal hover:bg-muted/50 transition-all duration-200 hover:scale-105 hover:shadow-sm",
            isOverdue && "text-red-500",
            isToday && "text-green-500",
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span className="text-sm">{formattedDate}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card border-border shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (newDate) {
              onChange(newDate.toISOString().split("T")[0])
              setOpen(false)
            }
          }}
          initialFocus
          className="rounded-md bg-card"
        />
      </PopoverContent>
    </Popover>
  )
}
