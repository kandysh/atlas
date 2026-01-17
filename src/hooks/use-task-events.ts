"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Task as DbTask } from "@/src/lib/db";
import { queryKeys } from "@/src/lib/query/keys";

/**
 * Hook to listen to task updates via SSE
 */
export function useTaskEvents(workspaceId: string, page: number = 0) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    // Create EventSource connection
    const eventSource = new EventSource(`/api/events/${workspaceId}`);
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

          case "task_update":
            // Invalidate tasks cache to trigger refetch
            queryClient.invalidateQueries({
              queryKey: queryKeys.tasks.paginated(workspaceId, page),
            });
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
    });

    // Cleanup on unmount
    return () => {
      console.log("Closing SSE connection");
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [workspaceId, page, queryClient]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  };
}
