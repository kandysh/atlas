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
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { Task } from "@/src/lib/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function TasksDataTable<TData extends Task, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  const handleRowClick = (task: Task, e: React.MouseEvent) => {
    // Don't open drawer if clicking on interactive elements or editable cells
    if (
      (e.target as HTMLElement).closest(
        'button, input, textarea, [role="combobox"], [data-radix-collection-item], [data-editable="true"]'
      )
    ) {
      return;
    }
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleAddTask = () => {
    console.log("Add new task");
    // TODO: Implement add task functionality
  };

  const handleDeleteSelected = () => {
    console.log("Delete selected tasks", Object.keys(rowSelection));
    // TODO: Implement delete functionality
    setRowSelection({});
  };

  const handleTaskUpdate = (taskId: string, field: keyof Task, value: unknown) => {
    console.log("Update task", taskId, field, value);
    // TODO: Call API to update
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
            <Input
              placeholder="Search tasks..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 bg-card border-border transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 bg-transparent transition-all duration-200 hover:scale-105 hover:bg-muted/50"
          >
            <SlidersHorizontal className="h-4 w-4 transition-transform duration-200 hover:rotate-90" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {selectedRowCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive hover:text-destructive bg-transparent transition-all duration-200 hover:scale-105"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedRowCount})
            </Button>
          )}
          <Button
            onClick={handleAddTask}
            size="sm"
            className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-200 hover:border-border/80">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="w-10 px-2 py-3"></th>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(e) =>
                      table.toggleAllPageRowsSelected(e.target.checked)
                    }
                    className="rounded border-border bg-background transition-all duration-200 hover:scale-110 cursor-pointer"
                  />
                </th>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
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
                      "border-b border-border hover:bg-muted/20 transition-all duration-200 cursor-pointer",
                      row.getIsSelected() && "bg-muted/30"
                    )}
                    onClick={(e) => handleRowClick(row.original, e)}
                  >
                    <td className="px-2 py-3">
                      <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                        className="rounded border-border bg-background transition-all duration-200 hover:scale-110 cursor-pointer"
                      />
                    </td>
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
                    colSpan={columns.length + 2}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {selectedRowCount > 0 ? (
            <span>
              {selectedRowCount} of {table.getFilteredRowModel().rows.length}{" "}
              row(s) selected
            </span>
          ) : (
            <span>{table.getFilteredRowModel().rows.length} total tasks</span>
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

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}
