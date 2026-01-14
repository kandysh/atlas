"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command";
import {
  Calendar as CalendarIcon,
  X,
  ChevronsUpDown,
  Check,
} from "lucide-react";
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
        className,
      )}
      data-editable="true"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
        setEditValue(value);
      }}
    >
      <span className={cn("flex-1", multiline && "line-clamp-2")}>
        {value || (
          <span className="text-muted-foreground italic">Click to edit</span>
        )}
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
        className,
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
  options: string[];
  onAddOption?: (option: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableOwnerCell({ 
  value, 
  onChange,
  options,
  onAddOption,
  placeholder = "Select owner...",
  className,
}: EditableOwnerCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = searchValue.trim();
      
      // If there's a filtered option, select the first one
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      } 
      // Otherwise, add the new value
      else if (trimmed && !options.includes(trimmed)) {
        onAddOption?.(trimmed);
        onChange(trimmed);
        setIsOpen(false);
        setSearchValue("");
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={isOpen}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "h-8 justify-start gap-2 font-normal hover:bg-muted/50 transition-all duration-200 w-auto",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? (
            <>
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-primary">
                  {getInitials(value)}
                </span>
              </div>
              <span className="text-sm">{value}</span>
            </>
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="py-2 px-3 text-sm text-muted-foreground">
              Type and press Enter to add
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                  ref={value === option ? selectedRef : null}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-primary">
                        {getInitials(option)}
                      </span>
                    </div>
                    <span>{option}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "justify-start text-left font-normal hover:bg-accent/50",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value || undefined}
          onSelect={(date) => {
            onChange(date || null);
            setIsOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface EditableTagsCellProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function EditableTagsCell({
  value,
  onChange,
  className,
  placeholder = "Type and press Enter...",
}: EditableTagsCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setInputValue("");
      setIsEditing(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-accent/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[32px]",
        className,
      )}
      data-editable="true"
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <div className="flex items-center gap-1 flex-wrap">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 pr-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{tag}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {isEditing && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              handleAddTag();
              setIsEditing(false);
            }}
            placeholder={placeholder}
            className="h-7 w-32 text-sm inline-block"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!isEditing && value.length === 0 && (
          <span className="text-muted-foreground italic text-sm">
            Click to add tags
          </span>
        )}
      </div>
    </div>
  );
}

interface EditableComboboxCellProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddOption?: (option: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableComboboxCell({
  value,
  onChange,
  options,
  onAddOption,
  placeholder = "Select or type...",
  className,
}: EditableComboboxCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const selectedRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase()),
  );

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = searchValue.trim();

      // If there's a filtered option, select the first one
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0]);
      }
      // Otherwise, add the new value
      else if (trimmed && !options.includes(trimmed)) {
        onAddOption?.(trimmed);
        onChange(trimmed);
        setIsOpen(false);
        setSearchValue("");
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={isOpen}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "h-8 justify-start gap-2 font-normal hover:bg-muted/50 transition-all duration-200 w-auto",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="text-sm">{value || placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-62.5 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-3 text-sm text-muted-foreground">
              Type and press Enter to add
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                  ref={value === option ? selectedRef : null}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
