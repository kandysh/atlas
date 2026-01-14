"use client";

export default function CompletedPage() {
  // TODO: Filter tasks where status === "completed"
  // const completedTasks = tasks.filter(t => t.status === "completed");
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Completed Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all completed tasks in your workspace
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          Completed tasks will appear here
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Tasks marked as "Completed" are archived here
        </p>
      </div>
    </div>
  );
}
