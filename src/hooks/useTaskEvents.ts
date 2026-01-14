"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "@/src/lib/db";
import { queryKeys } from "@/src/lib/query/hooks";

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
      `/api/tasks/${workspaceId}/events`
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
            const task: Task = data.task;
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
  const updateTaskInCache = (updatedTask: Task) => {
    const queryKey = queryKeys.tasks(workspaceId, page);
    
    queryClient.setQueryData(queryKey, (old: any) => {
      if (!old?.tasks) return old;

      const taskExists = old.tasks.some((t: Task) => t.id === updatedTask.id);
      
      if (taskExists) {
        // Update existing task
        return {
          ...old,
          tasks: old.tasks.map((task: Task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        };
      } else {
        // Add new task to the beginning
        return {
          ...old,
          tasks: [updatedTask, ...old.tasks],
        };
      }
    });
  };

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}
