"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

interface EditableTextCellProps {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
}

export function EditableTextCell({
  value,
  onChange,
  multiline = false,
  className,
}: EditableTextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (multiline) {
        textareaRef.current?.focus();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, multiline]);

  const handleSave = () => {
    if (editValue.trim() !== value && editValue.trim() !== "") {
      onChange(editValue.trim());
    } else {
      setEditValue(value); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return multiline ? (
      <Textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="min-h-[60px] text-sm"
        rows={3}
      />
    ) : (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 text-sm"
      />
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[32px] flex items-center",
        className
      )}
      data-editable="true"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(value);
      }}
    >
      <span className={cn("flex-1", multiline && "line-clamp-2")}>
        {value || <span className="text-muted-foreground italic">Click to edit</span>}
      </span>
    </div>
  );
}

interface EditableNumberCellProps {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  className?: string;
}

export function EditableNumberCell({
  value,
  onChange,
  suffix = "",
  className,
}: EditableNumberCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const numValue = parseInt(editValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue !== value) {
      onChange(numValue);
    } else {
      setEditValue(value.toString()); // Revert if invalid
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        min="0"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 w-24 text-sm"
      />
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[32px] flex items-center",
        className
      )}
      data-editable="true"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(value.toString());
      }}
    >
      <span className="flex-1">
        {value}
        {suffix}
      </span>
    </div>
  );
}

interface EditableOwnerCellProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditableOwnerCell({ value, onChange }: EditableOwnerCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== value && editValue.trim() !== "") {
      onChange(editValue.trim());
    } else {
      setEditValue(value); // Revert if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="h-8 text-sm"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[32px]"
      data-editable="true"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(value);
      }}
    >
      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-medium text-primary">
          {getInitials(value)}
        </span>
      </div>
      <span className="text-sm">{value}</span>
    </div>
  );
}

interface EditableDateCellProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  className?: string;
}

export function EditableDateCell({
  value,
  onChange,
  className,
}: EditableDateCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[32px] flex items-center",
        className
      )}
      data-editable="true"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
      }}
    >
      <span className="text-sm">{formatDate(value)}</span>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-lg shadow-lg p-4">
            <input
              type="date"
              value={value ? value.toISOString().split("T")[0] : ""}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : null;
                onChange(newDate);
                setIsOpen(false);
              }}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="mt-2 w-full px-3 py-1 text-sm border border-border rounded-md hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
