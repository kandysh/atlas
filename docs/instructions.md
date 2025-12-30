FINAL Task Table Specification (shadcn/ui Existing)
Production Jira/Notion table. Integrate with your shadcn setup. 5-day solo dev.

🎯 EXACT Requirements
text
✅ Dynamic columns (hide/show/reorder) - TanStack Table
✅ Inline editing (text/select/multi/date/checkbox) - onBlur
✅ Filters + global search - server-side  
✅ Sorting - multi-column
✅ Pagination - 50/page server-side
✅ Real-time sync - SSE (2 users edit same row)
✅ Subtasks - expandable nested table
✅ Field management - add/edit field types
✅ Multi-tenant - projectId
🛠️ EXACT Tech Stack
bash
# ADD these deps (your shadcn stays)
npm i @tanstack/react-table@^8.20 @tanstack/react-query@^5.59 drizzle-orm@^0.35 pg@^8.13 zod@^3.23
npm i -D drizzle-kit@^0.35 @types/pg@^8.13

# ADD these shadcn components ONLY
npx shadcn-ui@latest add table button input select badge checkbox dialog command popover date-picker
📁 EXACT File Structure (12 NEW files)
text
your-project/
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts          # GET/POST /api/tasks
│   │   │   └── [id]/
│   │   │       └── route.ts      # PATCH /api/tasks/:id (JSONB merge)
│   │   └── fields/
│   │       └── route.ts          # GET field configs
│   └── table/
│       └── [projectId]/
│           ├── page.tsx          # Server Component (main table)
│           ├── loading.tsx       # Skeleton loader
│           └── layout.tsx        # Sticky header
│
├── components/
│   ├── DataTable.tsx             # TanStack + shadcn table
│   ├── columns.tsx               # Dynamic column generator
│   ├── cells/
│   │   ├── EditableCell.tsx      # Text/number
│   │   ├── SelectCell.tsx        # Single select
│   │   ├── MultiSelectCell.tsx   # Tags (Command+Badge)
│   │   ├── CheckboxCell.tsx
│   │   └── DatePickerCell.tsx
│   └── table-toolbar.tsx         # Search + filters + Add Field
│
├── lib/
│   ├── db.ts                     # Drizzle client
│   ├── query.ts                  # TanStack Query hooks
│   ├── fields.ts                 # Field types + Zod schemas
│   └── utils.ts                  # cn() helper
│
└── db/
    └── schema.ts                 # tasks (JSONB) + field_configs
🗄️ EXACT Database (Run Once)
sql
-- Your Postgres (Neon/Supabase/whatever)
CREATE TABLE field_configs (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text','select','multiselect','date','checkbox','number')),
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT FALSE
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  subtasks JSONB DEFAULT '[]',
  version INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CRITICAL indexes
CREATE INDEX CONCURRENTLY idx_tasks_data_gin ON tasks USING GIN (data);
CREATE INDEX CONCURRENTLY idx_tasks_project ON tasks (project_id);
CREATE INDEX CONCURRENTLY idx_tasks_status ON tasks ((data->>'status') text_ops);
🚀 EXACT Setup (5min)
bash
# 1. Add deps + shadcn components
npm i @tanstack/react-table @tanstack/react-query drizzle-orm pg zod
npx shadcn-ui@latest add table button input select badge checkbox dialog command popover date-picker

# 2. Add 12 files above
# 3. Add DATABASE_URL=postgres://... to .env.local
# 4. npx drizzle-kit generate:pg && npx drizzle-kit push:pg
# 5. Visit http://localhost:3000/table/1
📊 EXACT Data Flow
text
Server Component (app/table/[projectId]/page.tsx)
  ↓ fetch tasks + fields
  ↓ generateColumns(fields)
  ↓ <DataTable data={tasks} columns={cols} />

Client Component (DataTable.tsx)
  ↓ useTasks(projectId) - TanStack Query
  ↓ useUpdateTask() - optimistic + invalidate
  ↓ useTaskEvents(projectId) - SSE real-time
🎨 EXACT UI (Jira/Notion density)
text
[Search tasks...] [Status:T ▼] [Priority:High ▼] [+ Add Field]
┌─────────────┬────────┬──────────┬──────────┬──────────┬─────────┐
│ #123        │ 🟡 In  │ High     │ alice    │ 12/25    │ ✏️🗑️▼    │
│ #124        │ ✅ Done│ Low      │ -        │ -        │ ✏️🗑️▼    │
└─────────────┴────────┴──────────┴──────────┴──────────┴─────────┘
       1-50 of 1,247             < Previous  2/25 Next >
h-10 dense rows

Sticky header top-0 z-20

Hover: hover:bg-muted/50

Multi-select: Command palette + Badge chips

✅ EXACT Acceptance Tests
text
[ ] /table/1 loads <2s (10k rows)
[ ] Click cell → edit → Tab/Blur → optimistic update → SSE sync
[ ] 2 tabs open → UserA changes status → UserB sees instantly
[ ] Filter "status=todo" → <100ms
[ ] Add field "Priority" (select: Low/Med/High) → appears instantly
[ ] Mobile: Cards (hide table @sm:hidden)
[ ] Bundle <150kb gzipped
🚫 EXACT BLOCKERS (Fail spec)
text
❌ tRPC, React Hook Form, Zustand/Jotai
❌ Client-side filtering 10k+ rows  
❌ No GIN index on JSONB (table freezes)
❌ No optimistic updates (laggy UX)
❌ No SSE (no real-time)
❌ Overwriting JSONB (data loss)
📈 Production Metrics
text
• 500 users → <200ms p95 latency
• 100k rows → infinite scroll <3s
• Vercel + Neon = $50/mo
• Lighthouse: 95+ perf, 100 accessibility
🎁 Bonus (Nice-to-have Day 6+)
text
[ ] Drag reorder columns
[ ] Export CSV
[ ] Bulk edit (select rows → change status)
[ ] Field permissions (hide from users)



📊 Daily Checkpoints
text
Day 2:   Table loads ✅
Day 5:   Sort/filter works ✅  
Day 8:   Inline edit all types ✅
Day 11:  2 users sync instantly ✅
Day 15:  Production deploy ✅
🚨 Rollback Points
text
❌ Phase 1 fails → Wrong DATABASE_URL
❌ Phase 2 slow → Missing GIN index  
❌ Phase 3 conflicts → No JSONB merge
❌ Phase 4 no sync → SSE cleanup bug
🎯 Phase Success Metrics
Phase	Test	Time Budget
1	/table/1 loads 100 rows	4hr
2	Filter + paginate 1k rows	7hr
3	Edit 5 field types → sync	7hr
4	2 tabs real-time sync	6hr
5	10k rows + deploy	5hr
📦 Final Bundle Targets
text
Initial SSR: 0kb JS (Server Components)
Client: 120kb gzipped (TanStack + shadcn)
Lighthouse: 95+ perf
