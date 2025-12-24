import { TasksStatusBreakdownDonut } from "@/components/insights/task-status-breakdown";
import { mockTasks } from "@/data/mock-tasks";
import { mockDataToDonut } from "@/lib/data-transformation";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and performance metrics
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TasksStatusBreakdownDonut chartData={mockDataToDonut(mockTasks)} />
      </div>
    </div>
  );
}
