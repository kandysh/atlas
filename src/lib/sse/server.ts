import { Task } from '@/src/lib/db';
import { logger } from '@/src/lib/logger/logger';

// Store active SSE connections
// In production, use Redis or another shared store for multi-instance deployments
const sseClients = new Map<string, ReadableStreamDefaultController>();

/**
 * Broadcast a task update to all connected SSE clients
 */
export function broadcastTaskUpdate(task: Task) {
  const message = `data: ${JSON.stringify({ type: 'task_update', task })}\n\n`;

  for (const [clientId, controller] of sseClients.entries()) {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      logger.error({ clientId, error }, 'Failed to send to SSE client');
      // Remove dead clients
      sseClients.delete(clientId);
    }
  }
}

/**
 * Register a new SSE client
 */
export function registerSseClient(
  clientId: string,
  controller: ReadableStreamDefaultController,
) {
  sseClients.set(clientId, controller);
  logger.info(
    { clientId, totalClients: sseClients.size },
    'SSE client registered',
  );
}

/**
 * Unregister an SSE client
 */
export function unregisterSseClient(clientId: string) {
  sseClients.delete(clientId);
  logger.info(
    { clientId, totalClients: sseClients.size },
    'SSE client unregistered',
  );
}

/**
 * Get the count of active SSE clients
 */
export function getActiveClientsCount(): number {
  return sseClients.size;
}
