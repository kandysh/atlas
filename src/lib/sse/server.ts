import { Task } from "@/src/lib/db";

// Store active SSE connections
// In production, use Redis or another shared store for multi-instance deployments
const sseClients = new Map<string, ReadableStreamDefaultController>();

/**
 * Broadcast a task update to all connected SSE clients
 */
export function broadcastTaskUpdate(task: Task) {
  const message = `data: ${JSON.stringify({ type: "task_update", task })}\n\n`;
  
  for (const [clientId, controller] of sseClients.entries()) {
    try {
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error(`Failed to send to client ${clientId}:`, error);
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
  controller: ReadableStreamDefaultController
) {
  sseClients.set(clientId, controller);
  console.log(`SSE client registered: ${clientId}. Total clients: ${sseClients.size}`);
}

/**
 * Unregister an SSE client
 */
export function unregisterSseClient(clientId: string) {
  sseClients.delete(clientId);
  console.log(`SSE client unregistered: ${clientId}. Total clients: ${sseClients.size}`);
}

/**
 * Get the count of active SSE clients
 */
export function getActiveClientsCount(): number {
  return sseClients.size;
}
