"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

type EditableCellProps = {
  value: string
  onSave: (value: string) => void
}

export function EditableCell({ value, onSave }: EditableCellProps) {
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
    if (editValue.trim() !== value) {
      onSave(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      setIsEditing(false)
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
        className="h-8 bg-background border-primary transition-all duration-200 animate-in zoom-in-95"
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-text hover:bg-muted/30 px-2 py-1 rounded transition-all duration-200 min-h-[32px] flex items-center hover:scale-105 hover:shadow-sm"
    >
      <span className="text-sm transition-colors duration-200">{value}</span>
    </div>
  )
}
