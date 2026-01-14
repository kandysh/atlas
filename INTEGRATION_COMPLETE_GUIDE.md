# Backend Integration Guide

**Complete guide to understanding and integrating the PostgreSQL backend with optimistic updates and real-time sync**

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [How It Works](#how-it-works)
4. [Quick Start](#quick-start)
5. [Integration Steps](#integration-steps)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This integration replaces mock data with PostgreSQL while adding:
- **Optimistic UI updates** - 0ms perceived latency
- **Real-time sync** - SSE for multi-tab synchronization
- **Type-safe** - Full type coverage from DB to UI
- **Graceful fallback** - Uses mock data when DB unavailable

---

## Project Structure

```
atlas/
├── app/
│   ├── api/                          # Backend API Routes
│   │   ├── tasks/
│   │   │   ├── route.ts             # GET (paginated), POST tasks
│   │   │   ├── [id]/route.ts        # PATCH task with JSONB merge
│   │   │   └── [workspaceId]/events/
│   │   │       └── route.ts         # SSE stream for live updates
│   │   └── fields/route.ts          # GET field configurations
│   └── page.tsx                      # Main page (uses React Query hooks)
│
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts             # Database connection
│   │   │   └── schema.ts            # Drizzle ORM schema
│   │   ├── query/
│   │   │   ├── hooks.ts             # React Query hooks (optimistic updates)
│   │   │   └── queries.ts           # Data fetching functions
│   │   ├── sse/
│   │   │   └── server.ts            # SSE broadcast utilities
│   │   └── utils/
│   │       └── task-mapper.ts       # Convert DB ↔ UI types
│   ├── hooks/
│   │   └── useTaskEvents.ts         # SSE client hook
│   └── components/
│       └── features/tasks/
│           ├── tasks-data-table.tsx # Table with mutation integration
│           └── columns.tsx          # Column definitions with handlers
│
└── scripts/
    └── seed.ts                       # Database seeding script
```

---

## How It Works

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User edits cell                                             │
│       ↓                                                      │
│  ┌──────────────────────────────────┐                       │
│  │ 1. Optimistic Update (instant)   │                       │
│  │    - Update React Query cache    │                       │
│  │    - UI updates immediately ⚡   │                       │
│  └────────────┬─────────────────────┘                       │
│               ↓                                              │
│  ┌──────────────────────────────────┐                       │
│  │ 2. Network Request (background)  │                       │
│  │    PATCH /api/tasks/[id]         │                       │
│  └────────────┬─────────────────────┘                       │
└───────────────┼──────────────────────────────────────────────┘
                │
                ↓
┌───────────────────────────────────────────────────────────────┐
│                    Next.js Server                              │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐                         │
│  │ 3. Update Database               │                         │
│  │    UPDATE tasks                  │                         │
│  │    SET data = data || patch      │ ← JSONB merge          │
│  └────────────┬─────────────────────┘                         │
│               ↓                                                │
│  ┌──────────────────────────────────┐                         │
│  │ 4. Broadcast via SSE             │                         │
│  │    - Send to all connected tabs  │                         │
│  └────────────┬─────────────────────┘                         │
└───────────────┼────────────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    ↓                       ↓
┌────────┐            ┌──────────┐
│ Tab A  │            │  Tab B   │
│   ✓    │            │   ✓      │
│Already │            │Receives  │
│updated │            │SSE event │
└────────┘            └──────────┘
```

### Key Components

#### 1. Database Schema (PostgreSQL)
```typescript
// tasks table
{
  id: UUID,                    // Primary key
  workspaceId: UUID,           // Workspace reference
  displayId: "TSK-001-0001",   // Human-readable ID
  sequenceNumber: 1,           // Auto-incrementing per workspace
  data: {                      // JSONB - flexible schema
    title: "Task title",
    status: "todo",
    priority: "high",
    owner: "John Doe",
    // ... any other fields
  },
  version: 1,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Type Mapping
```typescript
// Database type (JSONB)
type DbTask = {
  id: string;              // UUID
  displayId: string;       // "TSK-001-0001"
  data: Record<string, any>;
};

// UI type (flat)
type UiTask = {
  id: string;              // displayId (TSK-001-0001)
  title: string;
  status: string;
  priority: string;
  // ... all fields flattened
};

// Conversion happens in task-mapper.ts
dbTaskToUiTask(dbTask) → uiTask
uiTaskToDbData(uiTask) → dbData
```

#### 3. Optimistic Updates
```typescript
// In src/lib/query/hooks.ts
const updateMutation = useMutation({
  // 1. Optimistic update (instant)
  onMutate: async ({ displayId, patch }) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    
    // Update cache immediately
    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      tasks: old.tasks.map((t) => 
        t.id === displayId ? { ...t, ...patch } : t
      )
    }));
    
    return { previous }; // For rollback
  },
  
  // 2. Make network request
  mutationFn: ({ displayId, patch }) => updateTaskApi(id, patch),
  
  // 3. On success
  onSuccess: () => {
    toast.success("Saved");
  },
  
  // 4. On error - rollback
  onError: (error, variables, context) => {
    queryClient.setQueryData(queryKey, context.previous);
    toast.error("Failed to save");
  },
});
```

#### 4. SSE Live Sync
```typescript
// Server broadcasts updates
export function broadcastTaskUpdate(task: Task) {
  for (const [clientId, controller] of sseClients.entries()) {
    controller.enqueue(
      new TextEncoder().encode(
        `data: ${JSON.stringify({ type: "task_update", task })}\n\n`
      )
    );
  }
}

// Client listens for updates
eventSource.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "task_update") {
    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      tasks: old.tasks.map((t) => 
        t.id === data.task.displayId ? dbTaskToUiTask(data.task) : t
      )
    }));
  }
});
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure database
# Create .env file with:
DATABASE_URL="******localhost:5432/atlas_db"

# 3. Create database tables
npm run db:push

# 4. Seed test data
npx tsx scripts/seed.ts

# 5. Start development server
npm run dev
```

Visit http://localhost:3000 to see it in action!

---

## Integration Steps

### Step 1: Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb atlas_db
   ```

2. **Configure environment**
   ```bash
   # .env
   DATABASE_URL="******localhost:5432/atlas_db"
   ```

3. **Run migrations**
   ```bash
   npm run db:push
   ```

### Step 2: Understand the API Endpoints

#### GET /api/tasks
Fetch paginated tasks for a workspace.

```bash
curl "http://localhost:3000/api/tasks?workspaceId=abc-123&page=0"
```

Response:
```json
{
  "tasks": [
    {
      "id": "uuid-here",
      "displayId": "TSK-001-0001",
      "data": { "title": "Task 1", "status": "todo" },
      "version": 1
    }
  ],
  "page": 0,
  "perPage": 50,
  "hasMore": false
}
```

#### POST /api/tasks
Create a new task.

```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "abc-123",
    "data": {
      "title": "New Task",
      "status": "todo",
      "priority": "high"
    }
  }'
```

#### PATCH /api/tasks/[id]
Update a task (JSONB merge).

```bash
curl -X PATCH "http://localhost:3000/api/tasks/uuid-here" \
  -H "Content-Type: application/json" \
  -d '{
    "patch": {
      "status": "done"
    }
  }'
```

#### GET /api/tasks/[workspaceId]/events
SSE stream for real-time updates.

```bash
curl -N "http://localhost:3000/api/tasks/abc-123/events"
```

### Step 3: Use React Query Hooks

#### Fetch Tasks
```tsx
import { useWorkspaceTasks } from "@/src/lib/query/hooks";

function TaskList({ workspaceId }) {
  const { data, isLoading, error } = useWorkspaceTasks(workspaceId, 0);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;
  
  return (
    <ul>
      {data.tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```

#### Update Task (Optimistic)
```tsx
import { useUpdateTask } from "@/src/lib/query/hooks";

function TaskItem({ task, workspaceId }) {
  const updateTask = useUpdateTask(workspaceId, 0);
  
  const handleStatusChange = (newStatus) => {
    updateTask.mutate({
      displayId: task.id,
      patch: { status: newStatus }
    });
    // UI updates instantly! ⚡
  };
  
  return (
    <div>
      <h3>{task.title}</h3>
      <select value={task.status} onChange={(e) => handleStatusChange(e.target.value)}>
        <option value="todo">To Do</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}
```

#### Enable Live Sync
```tsx
import { useTaskEvents } from "@/src/hooks/useTaskEvents";

function TaskPage({ workspaceId }) {
  // This hook connects to SSE and updates cache automatically
  useTaskEvents(workspaceId, 0);
  
  return <TaskList workspaceId={workspaceId} />;
}
```

### Step 4: Integrate with Existing Components

The integration is already done in:
- `app/page.tsx` - Uses `useWorkspaceTasks` and `useTaskEvents`
- `src/components/features/tasks/tasks-data-table.tsx` - Uses `useUpdateTask`
- `src/components/features/tasks/columns.tsx` - Wires up edit handlers

No additional changes needed unless you're adding new components!

---

## API Reference

### React Query Hooks

#### `useWorkspaceTasks(workspaceId, page)`
Fetch tasks for a workspace with pagination.

```typescript
const { data, isLoading, error, refetch } = useWorkspaceTasks("workspace-id", 0);

// data.tasks - Array of UI tasks
// data.dbTasks - Array of DB tasks (for ID mapping)
// data.page - Current page
// data.hasMore - Whether more pages exist
```

#### `useUpdateTask(workspaceId, page)`
Update a task with optimistic updates.

```typescript
const updateTask = useUpdateTask("workspace-id", 0);

updateTask.mutate({
  displayId: "TSK-001-0001",
  patch: { status: "done", completedAt: new Date() }
});

// UI updates instantly
// Network request in background
// Automatic rollback on error
```

#### `useCreateTask(workspaceId)`
Create a new task.

```typescript
const createTask = useCreateTask("workspace-id");

createTask.mutate({
  title: "New Task",
  status: "todo",
  priority: "high"
});
```

### SSE Hook

#### `useTaskEvents(workspaceId, page)`
Connect to SSE stream for live updates.

```typescript
const { isConnected } = useTaskEvents("workspace-id", 0);

// Automatically updates React Query cache when other tabs make changes
// Returns connection status
```

### Utility Functions

#### `dbTaskToUiTask(dbTask)`
Convert database task to UI task.

```typescript
import { dbTaskToUiTask } from "@/src/lib/utils/task-mapper";

const uiTask = dbTaskToUiTask(dbTask);
// uiTask.id === dbTask.displayId
// All fields from dbTask.data are flattened
```

#### `uiTaskToDbData(uiTask)`
Convert UI task to database data format.

```typescript
import { uiTaskToDbData } from "@/src/lib/utils/task-mapper";

const dbData = uiTaskToDbData(uiTask);
// Returns object to store in JSONB data field
```

---

## Testing

### Test API Endpoints

```bash
# Get workspace ID from seed script output
WORKSPACE_ID="your-workspace-uuid"

# Test GET
curl "http://localhost:3000/api/tasks?workspaceId=$WORKSPACE_ID&page=0"

# Test POST
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -d "{\"workspaceId\":\"$WORKSPACE_ID\",\"data\":{\"title\":\"Test\",\"status\":\"todo\"}}"

# Test PATCH (replace TASK_ID)
curl -X PATCH "http://localhost:3000/api/tasks/TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"patch":{"status":"done"}}'

# Test SSE
curl -N "http://localhost:3000/api/tasks/$WORKSPACE_ID/events"
```

### Test Optimistic Updates

1. Open http://localhost:3000
2. Edit any cell in the table
3. **Observe**: UI updates instantly (no spinner)
4. **Verify**: Toast shows "Saved" after network request completes

### Test Live Sync

1. Open http://localhost:3000 in **two browser tabs**
2. In Tab A: Edit a task
3. In Tab B: **Observe** the task updates automatically (no refresh needed)

### Test Error Handling

1. Stop the database: `docker-compose stop postgres`
2. Try to edit a task
3. **Observe**: UI rolls back to previous value
4. **Verify**: Error toast appears

---

## Troubleshooting

### Database Connection Issues

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Verify connection string
echo $DATABASE_URL

# Restart database
docker-compose restart postgres
```

### SSE Not Working

**Problem**: Changes in one tab don't appear in other tabs

**Solution**:
1. Check browser console for SSE connection errors
2. Verify server logs show: `SSE client registered`
3. Check that no proxy is caching responses
4. Ensure `X-Accel-Buffering: no` header is set

### Optimistic Updates Not Working

**Problem**: UI doesn't update instantly

**Solution**:
1. Open React Query DevTools
2. Check that cache is populated
3. Verify `displayId` matches between cache and mutation
4. Check browser console for errors

### Type Errors

**Problem**: TypeScript errors about task types

**Solution**:
```bash
# Run type checker
npx tsc --noEmit

# Common fix: ensure using correct type
import { Task as UiTask } from "@/src/lib/types";
import { Task as DbTask } from "@/src/lib/db";
```

### Seed Script Fails

**Problem**: `Error: relation "users" does not exist`

**Solution**:
```bash
# Drop and recreate tables
npm run db:push

# Try seed again
npx tsx scripts/seed.ts
```

---

## Advanced Topics

### Adding New Fields

1. **Update the database** (optional - JSONB is flexible)
2. **Update UI types** in `src/lib/types/project.ts`
3. **Update mapper** in `src/lib/utils/task-mapper.ts`
4. **Add to columns** in `src/components/features/tasks/columns.tsx`

Example:
```typescript
// src/lib/utils/task-mapper.ts
export function dbTaskToUiTask(dbTask: DbTask): UiTask {
  const data = dbTask.data as Record<string, any>;
  return {
    // ... existing fields
    newField: data.newField || "default value",
  };
}
```

### Multi-Instance Deployment

For production with multiple server instances:

1. **Replace in-memory SSE storage** with Redis:
```typescript
// src/lib/sse/server.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);
const pubClient = redis.duplicate();

export function broadcastTaskUpdate(task: Task) {
  pubClient.publish("task_updates", JSON.stringify(task));
}

// Subscribe to updates
redis.subscribe("task_updates");
redis.on("message", (channel, message) => {
  const task = JSON.parse(message);
  // Send to local SSE clients
});
```

2. **Or use PostgreSQL NOTIFY/LISTEN**:
```typescript
await db.execute(sql`NOTIFY task_updates, ${JSON.stringify(task)}`);
```

### Custom Validation

Add validation before updates:

```typescript
// src/lib/query/queries.ts
export async function updateTask(taskId: string, patch: Record<string, any>) {
  // Custom validation
  if (patch.priority && !["low", "medium", "high"].includes(patch.priority)) {
    throw new Error("Invalid priority");
  }
  
  // Make request
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ patch }),
  });
  
  return response.json();
}
```

---

## Summary

This integration provides:
- ✅ **PostgreSQL backend** with flexible JSONB schema
- ✅ **Optimistic updates** for instant UI feedback
- ✅ **Real-time sync** via SSE across browser tabs
- ✅ **Type safety** from database to UI components
- ✅ **Error handling** with automatic rollback
- ✅ **Graceful fallback** to mock data

**Key files to know**:
- API routes: `app/api/tasks/`
- React Query: `src/lib/query/hooks.ts`
- SSE: `src/lib/sse/server.ts` + `src/hooks/useTaskEvents.ts`
- Type mapping: `src/lib/utils/task-mapper.ts`

**Next steps**:
1. Follow Quick Start to set up database
2. Test API endpoints with curl
3. Test optimistic updates in UI
4. Test live sync with 2 tabs
5. Deploy to production (see Advanced Topics)

For questions or issues, refer to the specific sections above or check the inline code comments.
