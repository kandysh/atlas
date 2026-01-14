# Atlas Project Structure - Quick Reference

## 📁 Directory Map

```
atlas/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home (Active Tasks)
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css
│   ├── completed/page.tsx       # Completed tasks
│   └── insights/page.tsx        # Analytics dashboard
│
├── src/                          # Application source code
│   ├── components/
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── layout/              # App layout (sidebar, nav)
│   │   └── features/
│   │       ├── tasks/           # Task management
│   │       ├── insights/        # Analytics charts
│   │       └── workspace/       # (Future) workspace features
│   │
│   ├── hooks/                   # React hooks (use-mobile)
│   │
│   ├── lib/
│   │   ├── types/               # TypeScript types
│   │   ├── api/                 # Query hooks & keys
│   │   ├── utils/               # Utilities (cn, analytics)
│   │   ├── services/            # Business logic (future)
│   │   ├── constants/           # App constants (future)
│   │   ├── db/                  # Drizzle ORM schema
│   │   └── validations/         # Zod schemas (future)
│   │
│   ├── providers/               # Context providers
│   │   ├── react-query-provider.tsx
│   │   └── workspace-provider.tsx
│   │
│   └── data/                    # Mock data & fixtures
│
├── db/                          # Database config
├── drizzle/                     # ORM migrations
├── public/                      # Static assets
├── docs/                        # Documentation
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 🎯 Common Tasks

### Adding a UI Component
```typescript
// 1. Create in src/components/ui/
src/components/ui/my-component.tsx

// 2. Export from index
// Add to src/components/ui/index.ts
export * from "./my-component"

// 3. Import anywhere
import { MyComponent } from "@/src/components/ui"
```

### Adding a Feature
```
// 1. Create feature folder
src/components/features/my-feature/
├── my-feature-list.tsx
├── my-feature-card.tsx
└── index.ts

// 2. Add API hooks
src/lib/api/my-feature.query.ts
src/lib/api/my-feature.keys.ts

// 3. Add types if needed
src/lib/types/my-feature.ts
```

### Adding a Query Hook
```typescript
// src/lib/api/my-query.query.ts
import { useQuery } from "@tanstack/react-query"
import { myKeys } from "@/src/lib/api/my-query.keys"

export const useMyQuery = () => {
  return useQuery({
    queryKey: myKeys.all,
    queryFn: async () => {
      // fetch data
    }
  })
}
```

## 📦 Import Patterns

```typescript
// Components
import { Button } from "@/src/components/ui"
import { TasksList } from "@/src/components/features/tasks"
import { AppSidebar } from "@/src/components/layout"

// Hooks
import { useWorkspace } from "@/src/providers"
import { useMobile } from "@/src/hooks"

// Types
import type { Task, Status } from "@/src/lib/types"

// Utilities
import { cn } from "@/src/lib/utils"

// API
import { useTasks } from "@/src/lib/api"

// Data
import { mockTasks } from "@/src/data"
```

## 🚀 Development Workflow

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run lint

# Database
npm run db:generate
npm run db:push
npm run db:studio
```

## 🔄 TanStack Query Pattern

### Query Keys
```typescript
// src/lib/api/tasks.keys.ts
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  byId: (id: string) => [...taskKeys.all, "detail", id] as const,
}
```

### Query Hooks
```typescript
// src/lib/api/tasks.query.ts
export const useTasks = () => {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: fetchTasks
  })
}
```

### Usage in Components
```typescript
export function TasksList() {
  const { data: tasks, isLoading } = useTasks()
  
  if (isLoading) return <Spinner />
  return <div>{/* render tasks */}</div>
}
```

## 📝 Types Location

All types belong in `src/lib/types/`:
- **project.ts** - Core domain (Task, Status, Priority)
- **analytics.ts** - Chart data types
- **Add feature.ts** - Feature-specific types

```typescript
// src/lib/types/feature.ts
export interface MyFeature {
  id: string
  name: string
}
```

## 🛠 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `drizzle.config.ts` | Drizzle ORM config |
| `eslint.config.mjs` | ESLint rules |
| `package.json` | Dependencies & scripts |

## 📚 Documentation Files

- `PROJECT_STRUCTURE.md` - Comprehensive structure guide
- `REFACTORING_COMPLETE.md` - What changed & why
- `README.md` - Project overview

## ✅ Checklist for New Developers

- [ ] Read `PROJECT_STRUCTURE.md`
- [ ] Understand feature-based organization
- [ ] Know where to find types (`src/lib/types/`)
- [ ] Know where to add components (`src/components/`)
- [ ] Familiar with import patterns (`@/src/...`)
- [ ] Understand TanStack Query structure
- [ ] Can run `npm run build` successfully

## 🎓 Key Principles

✅ **Feature-First** - Components grouped by feature  
✅ **Types First** - Define types before implementation  
✅ **Separation** - UI, logic, types separated  
✅ **DRY** - Don't repeat code, use components  
✅ **Scalability** - Structure supports growth  
✅ **Type Safe** - Full TypeScript coverage  

---

**Last Updated**: January 14, 2026  
**Build Status**: ✅ Successful  
**Structure Version**: 1.0
