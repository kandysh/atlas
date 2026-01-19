import { NextRequest } from 'next/server';
import { db, tasks } from '@/src/lib/db';
import { eq, desc } from 'drizzle-orm';
import { registerSseClient, unregisterSseClient } from '@/src/lib/sse/server';

// GET /api/tasks/[workspaceId]/events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await params;
  const clientId = `${workspaceId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Register this client
      registerSseClient(clientId, controller);

      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));

      // Send current tasks state
      try {
        const currentTasks = await db
          .select()
          .from(tasks)
          .where(eq(tasks.workspaceId, workspaceId))
          .orderBy(desc(tasks.sequenceNumber))
          .limit(50);

        const stateMessage = `data: ${JSON.stringify({
          type: 'initial_state',
          tasks: currentTasks,
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(stateMessage));
      } catch (error) {
        console.error('Error fetching initial state:', error);
      }

      // Keep connection alive with periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          console.error('Heartbeat failed:', error);
          clearInterval(heartbeatInterval);
        }
      }, 30000); // 30 seconds

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unregisterSseClient(clientId);
        try {
          controller.close();
        } catch {
          // Controller might already be closed
        }
      });
    },
    cancel() {
      unregisterSseClient(clientId);
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
