"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Task as DbTask } from "@/src/lib/db";
import { Task as UiTask } from "@/src/lib/types";
import { queryKeys } from "@/src/lib/query/hooks";
import { dbTaskToUiTask } from "@/src/lib/utils/task-mapper";

/**
 * Hook to listen to task updates via SSE
 */
export function useTaskEvents(workspaceId: string, page: number = 0) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    // Create EventSource connection
    const eventSource = new EventSource(
      `/api/events/${workspaceId}`
    );
    eventSourceRef.current = eventSource;

    // Handle connection open
    eventSource.addEventListener("open", () => {
      console.log("SSE connection established");
    });

    // Handle messages
    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "connected":
            console.log("SSE connected:", data.clientId);
            break;

          case "initial_state":
            // Update query cache with initial state
            const queryKey = queryKeys.tasks(workspaceId, page);
            queryClient.setQueryData(queryKey, {
              tasks: data.tasks,
              page,
              perPage: 50,
              hasMore: data.tasks.length === 50,
            });
            break;

          case "task_update":
            // Update the specific task in cache
            const task: DbTask = data.task;
            updateTaskInCache(task);
            break;

          default:
            console.log("Unknown SSE message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    });

    // Handle errors
    eventSource.addEventListener("error", (error) => {
      console.error("SSE connection error:", error);
      
      // EventSource will automatically reconnect
      // But we can add custom logic here if needed
    });

    // Cleanup on unmount
    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [workspaceId, page, queryClient]);

  /**
   * Update a task in the query cache
   */
  const updateTaskInCache = (updatedTask: DbTask) => {
    const queryKey = queryKeys.tasks(workspaceId, page);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.tasks) return old;

      // Compare using displayId (UI's task.id)
      const taskExists = old.tasks.some((t: UiTask) => t.id === updatedTask.displayId);
      
      if (taskExists) {
        // Update existing task - convert DB task to UI task
        const uiTask = dbTaskToUiTask(updatedTask);
        return {
          ...old,
          tasks: old.tasks.map((task: UiTask) =>
            task.id === updatedTask.displayId ? uiTask : task
          ),
          // Also update dbTasks if present
          dbTasks: old.dbTasks?.map((t: DbTask) =>
            t.id === updatedTask.id ? updatedTask : t
          ),
        };
      } else {
        // Add new task to the beginning
        const uiTask = dbTaskToUiTask(updatedTask);
        return {
          ...old,
          tasks: [uiTask, ...old.tasks],
          dbTasks: old.dbTasks ? [updatedTask, ...old.dbTasks] : [updatedTask],
        };
      }
    });
  };

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}
