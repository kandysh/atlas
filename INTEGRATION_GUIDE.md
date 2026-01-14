# Backend Integration Setup & Testing Guide

This guide provides step-by-step instructions for setting up and testing the new backend integration with PostgreSQL, optimistic updates, and real-time sync via SSE.

## 🎯 What Was Implemented

### Backend APIs
- **GET /api/tasks?workspaceId=1&page=0** - Paginated task fetching (50 tasks per page)
- **POST /api/tasks** - Create new tasks with auto-generated displayId (TSK-001-0001)
- **PATCH /api/tasks/[id]** - Update tasks with JSONB merge (preserves existing data)
- **GET /api/fields?workspaceId=1** - Fetch field configurations
- **GET /api/tasks/[workspaceId]/events** - SSE stream for real-time updates

### Frontend Features
- React Query hooks with optimistic UI updates
- Automatic rollback on errors
- Toast notifications for user feedback
- SSE client for live sync across browser tabs
- Type-safe mapping between DB schema and UI models

## 🔧 Prerequisites

1. **PostgreSQL Database** running on `localhost:5432`
2. **Node.js** (v18+)
3. **npm** or **pnpm**

## 📦 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

#### Option A: Using Docker Compose
```bash
docker-compose up -d
```

#### Option B: Manual PostgreSQL Setup
```bash
# Create database
createdb atlas_db

# Set environment variable
export DATABASE_URL="postgresql://atlas:atlas_password@localhost:5432/atlas_db"
```

### 3. Run Database Migrations
```bash
npm run db:push
```

### 4. Seed Initial Data (Optional)

Create a seed script or manually insert data:

```sql
-- Create a workspace
INSERT INTO workspaces (id, numeric_id, name, slug, owner_user_id)
VALUES (
  gen_random_uuid(),
  1,
  'Personal Projects',
  'personal',
  (SELECT id FROM users LIMIT 1)
);

-- Create some tasks
INSERT INTO tasks (id, workspace_id, display_id, sequence_number, data, version)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM workspaces WHERE numeric_id = 1),
  'TSK-001-0001',
  1,
  '{"title": "Test Task", "status": "todo", "priority": "high", "owner": "John Doe"}'::jsonb,
  1
);
```

### 5. Start Development Server
```bash
npm run dev
```

The app will be available at http://localhost:3000

## 🧪 Testing Guide

### Phase 1: API Endpoints (1hr)

Test all endpoints with curl or your favorite HTTP client:

#### 1. Get Tasks
```bash
curl -X GET "http://localhost:3000/api/tasks?workspaceId=YOUR_WORKSPACE_UUID&page=0"
```

Expected Response:
```json
{
  "tasks": [...],
  "page": 0,
  "perPage": 50,
  "hasMore": false
}
```

#### 2. Create Task
```bash
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "YOUR_WORKSPACE_UUID",
    "data": {
      "title": "New Task from API",
      "status": "todo",
      "priority": "medium",
      "owner": "Test User"
    }
  }'
```

Expected Response:
```json
{
  "id": "...",
  "workspaceId": "...",
  "displayId": "TSK-001-0002",
  "sequenceNumber": 2,
  "data": {...},
  "version": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### 3. Update Task (JSONB Merge)
```bash
curl -X PATCH "http://localhost:3000/api/tasks/TASK_UUID" \
  -H "Content-Type: application/json" \
  -d '{
    "patch": {
      "status": "done",
      "completedBy": "Test User"
    }
  }'
```

**Important**: The patch uses JSONB merge (`data || patch`), so it only updates specified fields.

#### 4. Get Fields
```bash
curl -X GET "http://localhost:3000/api/fields?workspaceId=YOUR_WORKSPACE_UUID"
```

#### 5. Test SSE Connection
```bash
curl -N "http://localhost:3000/api/tasks/YOUR_WORKSPACE_UUID/events"
```

You should see:
```
data: {"type":"connected","clientId":"..."}

data: {"type":"initial_state","tasks":[...]}
```

### Phase 2: UI Integration (30min)

1. **Refresh Page** - Navigate to http://localhost:3000
   - ✅ Should fetch tasks from database
   - ✅ Falls back to mock data if DB is not ready
   - ✅ Shows loading state

2. **Pagination** - Click through pages
   - ✅ URL changes to `?page=1`
   - ✅ Next 50 tasks load

3. **Error Handling**
   - Stop the database
   - Refresh page
   - ✅ Should show error message
   - ✅ Falls back to mock data

### Phase 3: Optimistic Updates (1hr)

1. **Edit a Cell**
   - Click on any editable field (title, status, priority, etc.)
   - Change the value
   - ✅ UI updates **instantly** (optimistic)
   - ✅ Network request sent in background
   - ✅ Toast shows "Saved" on success

2. **Test Rollback**
   - Open DevTools Network tab
   - Throttle network to "Slow 3G"
   - Edit a cell
   - Quickly close the tab (or disable network)
   - ✅ Should rollback to previous value
   - ✅ Toast shows error

3. **Verify Persistence**
   - Edit a cell
   - Wait for "Saved" toast
   - Refresh the page
   - ✅ Changes should persist

### Phase 4: SSE Live Sync (1hr)

1. **Two-Tab Test**
   - Open http://localhost:3000 in **Tab A**
   - Open http://localhost:3000 in **Tab B**
   - Edit a task in Tab A
   - ✅ Tab B should update **instantly** (no refresh needed)

2. **Connection Resilience**
   - Open DevTools Console in both tabs
   - Should see: `SSE connection established`
   - Close Tab A
   - ✅ Tab B should log reconnection
   - ✅ Tab B should continue working

3. **Heartbeat Test**
   - Leave both tabs open for 1+ minute
   - ✅ Connections should stay alive (heartbeat every 30s)
   - Check server logs: `SSE client registered: ... Total clients: 2`

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL

# Test connection with psql
psql $DATABASE_URL
```

### Migration Errors
```bash
# Reset database and re-run migrations
npm run db:push
```

### SSE Not Working
- Check browser console for connection errors
- Ensure no aggressive proxy/CDN caching
- Check that `X-Accel-Buffering: no` header is set

### Optimistic Updates Not Working
- Check browser console for React Query errors
- Verify `displayId` is being used correctly
- Check that `dbTasks` is present in query cache

## 📊 Architecture Overview

```
┌─────────────┐
│  Browser    │
│  Tab A      │
└──────┬──────┘
       │
       │ HTTP Requests (PATCH /api/tasks/[id])
       │ SSE Connection (GET /api/tasks/[wid]/events)
       │
       v
┌─────────────────────────────────────┐
│  Next.js API Routes                 │
│  ├── /api/tasks (GET, POST)         │
│  ├── /api/tasks/[id] (PATCH)        │
│  └── /api/tasks/[wid]/events (SSE)  │
└──────────┬──────────────────────────┘
           │
           │ Drizzle ORM
           │
           v
┌─────────────────────┐
│  PostgreSQL         │
│  ├── workspaces     │
│  ├── tasks          │
│  └── field_configs  │
└─────────────────────┘
```

### Data Flow - Optimistic Update

```
1. User edits cell
   ↓
2. React Query: onMutate
   - Cancel in-flight queries
   - Snapshot current data
   - Update cache optimistically
   ↓
3. UI updates instantly ✨
   ↓
4. API PATCH request sent
   ↓
5a. Success:
    - Show "Saved" toast
    - Invalidate query (refetch truth)
    ↓
5b. Error:
    - Rollback to snapshot
    - Show error toast
```

### Data Flow - SSE Live Sync

```
1. Page loads
   ↓
2. useTaskEvents hook
   - Creates EventSource
   - Connects to /api/tasks/[wid]/events
   ↓
3. Server sends initial state
   - Updates React Query cache
   ↓
4. Another tab updates a task
   ↓
5. Server broadcasts update
   - All SSE clients receive message
   ↓
6. useTaskEvents updates cache
   - UI re-renders with new data ✨
```

## ✅ Success Criteria

All features working:
- ✅ curl APIs return correct JSON
- ✅ /page refresh → real data from DB
- ✅ Edit cell → instant UI + persists on refresh
- ✅ 2 tabs → live sync works
- ✅ Network error → rollback + error toast
- ✅ Connection resilience → reconnects automatically

## 🚀 Production Deployment

### Environment Variables
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### SSE in Production
- For multi-instance deployments, use **Redis** or **PostgreSQL NOTIFY/LISTEN** for pub/sub
- Replace in-memory `sseClients` Map in `src/lib/sse/server.ts`

### Database Migrations
```bash
npm run db:migrate
```

## 📝 Notes

- **displayId** (TSK-001-0001) is shown in UI
- **id** (UUID) is used for API calls internally
- **JSONB merge** preserves all existing fields not in patch
- **Optimistic updates** improve perceived performance
- **SSE** provides sub-second latency for live updates
