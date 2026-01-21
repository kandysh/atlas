import { NextRequest } from 'next/server';
import { db, tasks } from '@/src/lib/db';
import { eq, desc } from 'drizzle-orm';
import { registerSseClient, unregisterSseClient } from '@/src/lib/sse/server';
import { logger } from '@/src/lib/logger';
import { getWorkspaceBySlug } from '@/src/lib/actions/workspaces';

// GET /api/tasks/[workspaceSlug]/events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceSlug: string }> },
) {
  const { workspaceSlug } = await params;

  // Look up workspace by slug to get the ID
  const workspaceResult = await getWorkspaceBySlug(workspaceSlug);
  if (!workspaceResult.success) {
    return new Response(JSON.stringify({ error: 'Workspace not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const workspaceId = workspaceResult.workspace.id;
  const clientId = `${workspaceSlug}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

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
        logger.error(
          { workspaceSlug, workspaceId, clientId, error },
          'Error fetching initial state',
        );
      }

      // Keep connection alive with periodic heartbeat
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': heartbeat\n\n'));
        } catch (error) {
          logger.error({ workspaceSlug, clientId, error }, 'Heartbeat failed');
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
