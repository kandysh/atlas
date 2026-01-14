export default function CompletedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Completed Tasks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all completed tasks
        </p>
      </div>
      <div className="rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">
          Completed tasks will be displayed here
        </p>
      </div>
    </div>
  );
}
