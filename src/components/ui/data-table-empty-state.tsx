'use client';

import { FileX2, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function DataTableEmptyState({
  title = 'No tasks',
  description = 'Get started by creating your first task.',
  actionLabel = 'Add Task',
  onAction,
  icon: Icon = FileX2,
}: DataTableEmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Icon className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="mt-6 text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        {onAction && (
          <Button onClick={onAction} className="mt-6">
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
