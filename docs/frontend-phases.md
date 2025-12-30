# UI-First Plan (3 Days → Perfect Table UX)

**Build pixel-perfect Jira/Notion table first. Data stubs. Backend Phase 2.**

## 🗓️ Phase 1: Static Table (Day 1 - 3hr)
```
✅ [1] Mock Data (30min)
   - components/mock-data.ts → 100 fake tasks + 6 fields
   
✅ [2] Basic shadcn Table (1hr)
   - components/DataTable.tsx (static columns: Name, Status, Priority, Assignee, Due)
   - Copy shadcn/ui table example
   
✅ [3] Test: Perfect Jira density, hover, sticky header
```

**Checkpoint**: `/table/1` → beautiful static table. No API.

## 🗓️ Phase 2: TanStack Superpowers (Day 1 - 3hr)  
```
✅ [1] Dynamic Columns (1hr)
   - components/columns.tsx → generateColumns(fields[])
   
✅ [2] Sort/Filter/Paginate (1hr)
   - TanStack Table: sorting, globalFilter, pagination
   
✅ [3] Column Visibility (1hr)
   - Hide/show columns checkbox
   
✅ [4] Test: Reorder, filter "status=todo", paginate
```

**Checkpoint**: Full TanStack UX. Mock data only.

## 🗓️ Phase 3: Inline Editing Magic (Day 2 - 5hr)
```
✅ [1] Click-to-Edit Core (1hr)
   - components/cells/EditableCell.tsx (text/number)
   
✅ [2] Field Types (3hr)
   - SelectCell (status dropdown)
   - MultiSelectCell (Command + Badge chips) 
   - CheckboxCell, DatePickerCell
   
✅ [3] Optimistic Updates (1hr)
   - Fake API delay + rollback simulation
   
✅ [4] Test: Click→edit→blur→"saved" toast
```

**Checkpoint**: Feels alive. All field types perfect.

## 🗓️ Phase 4: Polish + Toolbar (Day 3 - 4hr)
```
✅ [1] Table Toolbar (1hr)
   - components/table-toolbar.tsx
   - Search, column filters, +Add Field
   
✅ [2] Mobile Cards (1hr)
   - @sm:hidden → card view
   
✅ [3] Loading/Error States (1hr)
   - Skeleton rows, empty state
   
✅ [4] Subtasks Expand (1hr)
   - Chevron → nested table mock
   
✅ [5] Test: Lighthouse 95+, mobile perfect
```

**Checkpoint**: Indistinguishable from Jira. Mock data.

## 📁 UI-Only File Structure (8 Files)
```
components/
├── DataTable.tsx                 # TanStack + shadcn
├── columns.tsx                   # generateColumns(fields)
├── cells/
│   ├── EditableCell.tsx
│   ├── SelectCell.tsx
│   ├── MultiSelectCell.tsx
│   ├── CheckboxCell.tsx
│   └── DatePickerCell.tsx
├── table-toolbar.tsx             # Filters + actions
└── mock-data.ts                  # 100 tasks + fields

app/table/[projectId]/
├── page.tsx                      # <DataTable data={mockTasks} />
└── loading.tsx                   # Skeleton
```

## 🎨 EXACT UI Targets (Copy These Classes)
```tsx
// Density: Jira/Notion perfect
<TableRow className="h-10 border-b border-border/50 hover:bg-muted/30">
<TableHead className="h-12 sticky top-0 z-20 bg-background/95 backdrop-blur">
<Input className="h-9 max-w-sm" />
<Badge className="px-2 py-0.5 text-xs cursor-pointer hover:bg-muted">Todo</Badge>
```

## ✅ UI-Only Success Metrics
```
[ ] h-10 dense rows, sticky header
[ ] Click cell → Input → Tab/Blur → optimistic "saved" 
[ ] Multi-select: Command palette → Badge chips
[ ] Filter "status=todo" → instant (mock data)
[ ] Mobile: @sm:hidden cards
[ ] Lighthouse: 98 perf, 100 accessibility
```

## 🚀 Day 3 Demo Script
```
1. /table/1 → Perfect table loads instantly
2. Filter "status=todo" → 23 rows  
3. Click "In Progress" → dropdown → "Done" → green check
4. Tags: Cmd+K → "Urgent, Frontend" → chips appear
5. Mobile: Perfect cards
6. "Ship backend next" → stakeholders approve
```

## 📦 Backend Later (Day 4+)
```
✅ Hook mock data → real API
✅ Fake optimistic → TanStack Query  
✅ Local state → Postgres JSONB
✅ 3 days → full production
```

**Start NOW: Copy shadcn table → mock 100 rows → done in 3hr.**

**UI 100% → Backend plug-in. No regrets.**
