"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type EditableCellProps = {
  value: string
  onSave: (value: string) => void
  placeholder?: string
}

export function EditableCell({ value, onSave, placeholder }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim() !== value && editValue.trim() !== "") {
      onSave(editValue.trim())
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
    } else if (e.key === "Tab") {
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 bg-background border-primary"
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-text hover:bg-muted/30 px-2 py-1 rounded transition-colors min-h-[32px] flex items-center",
        !value && "text-muted-foreground"
      )}
    >
      <span className="text-sm truncate">{value || placeholder || "Click to edit"}</span>
    </div>
  )
}
