"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
  RowSelectionState,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";
import { useState, ReactNode } from "react";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { DataTableEmptyState } from "./data-table-empty-state";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData, event: React.MouseEvent) => void;
  pageSize?: number;
  enableRowSelection?: boolean;
  emptyStateMessage?: string;
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => ReactNode;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pageSize = 20,
  enableRowSelection = true,
  emptyStateMessage = "No results found.",
  toolbar,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  const handleRowClick = (row: TData, e: React.MouseEvent) => {
    // Don't trigger row click if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest(
        'button, input, textarea, [role="combobox"], [data-radix-collection-item], [data-editable="true"], [cmdk-item], [role="option"]'
      )
    ) {
      return;
    }
    onRowClick?.(row, e);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {toolbar && toolbar(table)}

      {/* Table with responsive horizontal scroll */}
      <div className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {enableRowSelection && (
                  <th className="w-12 px-4 py-3 sticky left-0 bg-muted/30 z-10">
                    <input
                      type="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      onChange={(e) =>
                        table.toggleAllPageRowsSelected(e.target.checked)
                      }
                      className="rounded border-border bg-background transition-all duration-200 hover:scale-110 cursor-pointer"
                    />
                  </th>
                )}
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-border hover:bg-muted/20 transition-all duration-200",
                      onRowClick && "cursor-pointer",
                      row.getIsSelected() && "bg-muted/30"
                    )}
                    onClick={(e) => handleRowClick(row.original, e)}
                  >
                    {enableRowSelection && (
                      <td className="px-4 py-3 sticky left-0 bg-card z-10">
                        <input
                          type="checkbox"
                          checked={row.getIsSelected()}
                          onChange={(e) => row.toggleSelected(e.target.checked)}
                          className="rounded border-border bg-background transition-all duration-200 hover:scale-110 cursor-pointer"
                        />
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    {emptyStateMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer - responsive layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
        <div>
          {selectedRowCount > 0 ? (
            <span>
              {selectedRowCount} of {table.getFilteredRowModel().rows.length}{" "}
              row(s) selected
            </span>
          ) : (
            <span>{table.getFilteredRowModel().rows.length} total rows</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="transition-all duration-200 hover:scale-105"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
