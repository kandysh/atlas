"use client";

import { DataTable } from "@/components/data-table";
import { Sidebar } from "@/components/sidebar";
import { InsightsView } from "@/components/insights-view";
import { useState } from "react";

export default function Home() {
  const [currentView, setCurrentView] = useState("active");
  const [tasks, setTasks] = useState([
    {
      id: "1",
      task: "Design new landing page",
      status: "In Progress",
      priority: "High",
      assignee: "John Doe",
      dueDate: "2024-03-15",
      tags: ["Design", "Frontend"],
    },
    {
      id: "2",
      task: "Implement authentication",
      status: "To Do",
      priority: "Urgent",
      assignee: "Jane Smith",
      dueDate: "2024-03-10",
      tags: ["Backend", "Security"],
    },
    {
      id: "3",
      task: "Write API documentation",
      status: "Done",
      priority: "Medium",
      assignee: "Bob Johnson",
      dueDate: "2024-03-20",
      tags: ["Documentation"],
    },
    {
      id: "4",
      task: "Fix responsive issues",
      status: "In Progress",
      priority: "High",
      assignee: "Alice Williams",
      dueDate: "2024-03-12",
      tags: ["Frontend", "Bug"],
    },
    {
      id: "5",
      task: "Database optimization",
      status: "Blocked",
      priority: "Low",
      assignee: "Charlie Brown",
      dueDate: "2024-03-25",
      tags: ["Backend", "Performance"],
    },
  ]);

  const activeTasks = tasks.filter((task) => task.status !== "Done");
  const completedTasks = tasks.filter((task) => task.status === "Done");

  return (
    <div className="flex min-h-screen bg-background">
      {/*<Sidebar currentView={currentView} onViewChange={setCurrentView} />*/}

      <main className="flex-1 p-6 overflow-auto">
        <div className="mx-auto max-w-7xl space-y-6">
          {currentView === "active" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-balance">
                    Active Board
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and track your team's work
                  </p>
                </div>
              </div>
              <DataTable initialTasks={activeTasks} onTasksChange={setTasks} />
            </>
          )}

          {currentView === "completed" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-balance">
                    Completed Tasks
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    View all finished tasks
                  </p>
                </div>
              </div>
              <DataTable
                initialTasks={completedTasks}
                onTasksChange={setTasks}
              />
            </>
          )}

          {currentView === "insights" && <InsightsView tasks={tasks} />}
        </div>
      </main>
    </div>
  );
}
