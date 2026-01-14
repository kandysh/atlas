"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Search, Settings2, X, Plus, Trash2 } from "lucide-react";
import { DataTableFacetedFilter } from "@/src/components/ui/data-table-faceted-filter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onAdd?: () => void;
  onDeleteSelected?: (selectedIds: string[]) => void;
  addButtonLabel?: string;
  deleteButtonLabel?: string;
  searchPlaceholder?: string;
}

export function DataTableToolbar<TData>({
  table,
  onAdd,
  onDeleteSelected,
  addButtonLabel = "Add",
  deleteButtonLabel = "Delete",
  searchPlaceholder = "Search...",
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  // Get status and priority columns for filters
  const statusColumn = table.getColumn("status");
  const priorityColumn = table.getColumn("priority");
  const ownerColumn = table.getColumn("owner");
  const typeColumn = table.getColumn("type");

  // Get unique values for filters
  const statusOptions = statusColumn
    ? Array.from(
        new Set(
          table
            .getCoreRowModel()
            .rows.map((row) => row.getValue("status") as string)
        )
      ).map((value) => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value: value,
      }))
    : [];

  const priorityOptions = priorityColumn
    ? Array.from(
        new Set(
          table
            .getCoreRowModel()
            .rows.map((row) => row.getValue("priority") as string)
        )
      ).map((value) => ({
        label: value.charAt(0).toUpperCase() + value.slice(1),
        value: value,
      }))
    : [];

  const ownerOptions = ownerColumn
    ? Array.from(
        new Set(
          table
            .getCoreRowModel()
            .rows.map((row) => row.getValue("owner") as string)
            .filter(Boolean)
        )
      ).map((value) => ({
        label: value,
        value: value,
      }))
    : [];

  const typeOptions = typeColumn
    ? Array.from(
        new Set(
          table
            .getCoreRowModel()
            .rows.map((row) => row.getValue("type") as string)
            .filter(Boolean)
        )
      ).map((value) => ({
        label: value,
        value: value,
      }))
    : [];

  const handleDeleteSelected = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => (row.original as any).id);
    onDeleteSelected?.(selectedIds);
    table.resetRowSelection();
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center space-x-2">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Faceted Filters */}
        {statusColumn && statusOptions.length > 0 && (
          <DataTableFacetedFilter
            column={statusColumn}
            title="Status"
            options={statusOptions}
          />
        )}
        {priorityColumn && priorityOptions.length > 0 && (
          <DataTableFacetedFilter
            column={priorityColumn}
            title="Priority"
            options={priorityOptions}
          />
        )}
        {ownerColumn && ownerOptions.length > 0 && (
          <DataTableFacetedFilter
            column={ownerColumn}
            title="Owner"
            options={ownerOptions}
          />
        )}
        {typeColumn && typeOptions.length > 0 && (
          <DataTableFacetedFilter
            column={typeColumn}
            title="Type"
            options={typeOptions}
          />
        )}

        {/* Clear Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Settings2 className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Selected */}
        {selectedRowCount > 0 && onDeleteSelected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteSelected}
            className="h-9 text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleteButtonLabel} ({selectedRowCount})
          </Button>
        )}

        {/* Add Button */}
        {onAdd && (
          <Button onClick={onAdd} size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
